export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'يرجى تسجيل الدخول (10001)';
export const NOT_ADMIN_ERR_MSG = 'ليس لديك الصلاحيات المطلوبة (10002)';

export const APP_CONFIG = {
  region: "QATAR",
  branding: {
    name: "وزارة الداخلية - قطر",
    nameEn: "Ministry of Interior - Qatar",
    primaryColor: "#8A1538", // العنابي القطري
    secondaryColor: "#FFFFFF",
  },
  apis: {
    qatarMoi: "https://fees2.moi.gov.qa/moipay",
  }
};
