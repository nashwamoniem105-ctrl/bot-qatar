import axios from "axios";
import http from "node:http";
import https from "node:https";
import { ProxyAgent } from "proxy-agent";

const DEFAULT_HTTP_AGENT = new http.Agent({
  keepAlive: true,
  maxSockets: 200,
  maxFreeSockets: 50,
});

const DEFAULT_HTTPS_AGENT = new https.Agent({
  keepAlive: true,
  maxSockets: 200,
  maxFreeSockets: 50,
});

const QATAR_MOI_API = "https://fees2.moi.gov.qa/moipay";

const API_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "ar,en;q=0.9",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://fees2.moi.gov.qa/moipay/inquiry/violation",
  Origin: "https://fees2.moi.gov.qa",
};

export interface FineResult {
  fineNumber?: string;
  fineDate?: string;
  description?: string;
  descriptionAr?: string;
  amount?: string;
  blackPoints?: number;
  isPaid?: "paid" | "unpaid" | "partial";
  location?: string;
  locationAr?: string;
  ticketNo?: string;
  source?: string;
  sourceAr?: string;
  speed?: string;
}

export interface ScraperResult {
  success: boolean;
  fines: FineResult[];
  totalAmount?: string;
  errorMessage?: string;
}

export const PLATE_SOURCES = [
  { value: "QAT", label: "قطر", labelEn: "Qatar" },
  { value: "KSA", label: "السعودية", labelEn: "Saudi Arabia" },
  { value: "KWT", label: "الكويت", labelEn: "Kuwait" },
  { value: "UAE", label: "الإمارات", labelEn: "UAE" },
  { value: "OMN", label: "عمان", labelEn: "Oman" },
  { value: "BAH", label: "البحرين", labelEn: "Bahrain" },
];

export const QATAR_PLATE_TYPES = [
  { value: "1", label: "خصوصي", labelEn: "Private" },
  { value: "2", label: "نقل خاص", labelEn: "Private Transport" },
  { value: "3", label: "دراجة نارية", labelEn: "Motorcycle" },
  { value: "4", label: "نقل عام", labelEn: "Public Transport" },
  { value: "6", label: "تصدير", labelEn: "Export" },
  { value: "10", label: "مقطورة", labelEn: "Trailer" },
];

export async function scrapeQatarFines(params: {
  inquiryType: "plate" | "qid" | "establishment";
  plateNumber?: string;
  plateType?: string;
  plateSource?: string;
  ownerIdType?: "qid" | "establishment";
  ownerId?: string;
  captcha?: string;
}): Promise<ScraperResult> {
  try {
    console.log("[Scraper] Querying Qatar MOI for:", params.inquiryType, params.plateNumber || params.ownerId);
    
    // إعداد البيانات بناءً على نوع الاستعلام
    const requestData: any = {
      inquiryType: params.inquiryType,
      captcha: params.captcha,
    };

    if (params.inquiryType === "plate") {
      requestData.plateNumber = params.plateNumber;
      requestData.plateType = params.plateType;
      requestData.plateSource = params.plateSource;
    } else {
      requestData.ownerId = params.ownerId;
    }

    const response = await axios.post(`${QATAR_MOI_API}/inquiry/violation`, requestData, {
      headers: API_HEADERS,
      httpAgent: DEFAULT_HTTP_AGENT,
      httpsAgent: DEFAULT_HTTPS_AGENT,
      timeout: 15000,
    });

    if (response.data && response.data.success) {
      const fines = (response.data.fines || []).map((f: any) => ({
        fineNumber: f.violationNumber || f.fineNumber,
        fineDate: f.violationDate || f.fineDate,
        description: f.violationDescription || f.description,
        descriptionAr: f.violationDescriptionAr || f.descriptionAr,
        amount: String(f.amount || "0"),
        blackPoints: Number(f.blackPoints || 0),
        location: f.violationLocation || f.location,
        isPaid: "unpaid"
      }));

      const totalAmount = fines.reduce((sum: number, f: any) => sum + parseFloat(f.amount), 0).toFixed(2);

      return {
        success: true,
        fines,
        totalAmount,
      };
    }

    return {
      success: false,
      fines: [],
      errorMessage: response.data?.message || "لم يتم العثور على مخالفات أو البيانات غير صحيحة",
    };
  } catch (error: any) {
    console.error("[Scraper] Error:", error.message);
    return {
      success: false,
      fines: [],
      errorMessage: "حدث خطأ أثناء الاتصال بخادم وزارة الداخلية القطرية. يرجى التأكد من رمز التحقق.",
    };
  }
}

export async function getPlateCodeOptions(source: string) {
  if (source === "QAT") return QATAR_PLATE_TYPES;
  return [];
}

// دالة متوافقة مع الكود القديم لتسهيل الانتقال
export async function scrapeDubaiFines(
  plateSrcCode: string,
  plateNo: string,
  plateCode: string,
  meta: any = {}
): Promise<ScraperResult> {
  return scrapeQatarFines({
    inquiryType: "plate",
    plateNumber: plateNo,
    plateType: plateCode,
    plateSource: plateSrcCode,
    ownerIdType: meta.ownerIdType,
    ownerId: meta.ownerId,
  });
}
