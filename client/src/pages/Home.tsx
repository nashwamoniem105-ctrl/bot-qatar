import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { CarIcon, PersonIcon, BuildingIcon } from "@/components/Icons";

const COUNTRIES = [
  { id: "QAT", ar: "قطر", en: "Qatar" },
  { id: "SAU", ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
  { id: "ARE", ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" },
  { id: "KWT", ar: "الكويت", en: "Kuwait" },
  { id: "BHR", ar: "البحرين", en: "Bahrain" },
  { id: "OMN", ar: "عمان", en: "Oman" },
  { id: "EGY", ar: "مصر", en: "Egypt" },
  { id: "JOR", ar: "الأردن", en: "Jordan" },
  { id: "PSE", ar: "فلسطين", en: "Palestine" },
  { id: "IRQ", ar: "العراق", en: "Iraq" },
  { id: "LBN", ar: "لبنان", en: "Lebanon" },
  { id: "SYR", ar: "سوريا", en: "Syria" },
  { id: "YEM", ar: "اليمن", en: "Yemen" },
  { id: "LBY", ar: "ليبيا", en: "Libya" },
  { id: "SDN", ar: "السودان", en: "Sudan" },
  { id: "MAR", ar: "المغرب", en: "Morocco" },
  { id: "DZA", ar: "الجزائر", en: "Algeria" },
  { id: "TUN", ar: "تونس", en: "Tunisia" },
  { id: "MRT", ar: "موريتانيا", en: "Mauritania" },
  { id: "SOM", ar: "الصومال", en: "Somalia" },
  { id: "DJI", ar: "جيبوتي", en: "Djibouti" },
  { id: "COM", ar: "جزر القمر", en: "Comoros" }
];

const PLATE_TYPES = [
  { id: "1", ar: "خصوصي", en: "Private" },
  { id: "2", ar: "خصوصي (Q)", en: "Private (Q)" },
  { id: "3", ar: "خصوصي (T)", en: "Private (T)" },
  { id: "4", ar: "خصوصي (R)", en: "Private (R)" },
  { id: "5", ar: "حكومة", en: "Government" },
  { id: "6", ar: "تجارية", en: "Commercial" },
  { id: "7", ar: "نقل خاص", en: "Private Transport" },
  { id: "8", ar: "آليات", en: "Machinery" },
  { id: "9", ar: "مقطورة", en: "Trailer" },
  { id: "10", ar: "نقل عام", en: "Public Transport" },
  { id: "11", ar: "هيئة دبلوماسية", en: "Diplomatic Corps" },
  { id: "12", ar: "شرطة", en: "Police" },
  { id: "13", ar: "دراجة نارية شرطة", en: "Police Motorcycle" },
  { id: "14", ar: "دراجة نارية خصوصية", en: "Private Motorcycle" },
  { id: "15", ar: "أجرة", en: "Taxi" },
  { id: "16", ar: "سيارة لخويا", en: "Lekhwiya Car" },
  { id: "17", ar: "دراجة لخويا", en: "Lekhwiya Motorcycle" },
  { id: "18", ar: "سيارة الحرس الأميري", en: "Amiri Guard Car" },
  { id: "19", ar: "دراجة الحرس الأميري", en: "Amiri Guard Motorcycle" },
  { id: "20", ar: "ليموزين", en: "Limousine" },
  { id: "21", ar: "القوات المسلحة القطرية", en: "Qatar Armed Forces" },
  { id: "22", ar: "إدخال مؤقت", en: "Temporary Entry" },
  { id: "23", ar: "معدة", en: "Equipment" },
  { id: "24", ar: "هيئة الامم المتحدة", en: "United Nations" },
  { id: "25", ar: "تصْدير", en: "Export" },
  { id: "26", ar: "آليات حكومية", en: "Government Machinery" },
  { id: "27", ar: "تحت التجربة", en: "Under Test" },
  { id: "28", ar: "مقطورة حكومية", en: "Government Trailer" }
];

export default function Home() {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [inquiryType, setInquiryType] = useState<"plate" | "qid" | "establishment">("plate");
  const [plateSource, setPlateSource] = useState("QAT");
  const [plateType, setPlateType] = useState("1");
  const [plateNumber, setPlateNumber] = useState("");
  const [ownerIdType, setOwnerIdType] = useState<"qid" | "establishment">("qid");
  const [ownerId, setOwnerId] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState(`/api/captcha?t=${Date.now()}`);
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem("paymentSessionId");
    if (saved) return saved;
    const newId = nanoid();
    localStorage.setItem("paymentSessionId", newId);
    return newId;
  });

  const isAr = lang === "ar";
  
  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/captcha?t=${Date.now()}`);
  };

  const updateStageMutation = trpc.payment.updateStage.useMutation();

  useEffect(() => {
    updateStageMutation.mutate({ sessionId, stage: "home" });
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/visitors?page=/&sessionId=${sessionId}`);
    return () => ws.close();
  }, []);

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        if (data.totalFines === 0) {
          toast.info(isAr ? "لا توجد مخالفات مسجلة" : "No violations recorded");
        } else {
          setLocation(`/violations-results?session=${data.sessionId}`);
        }
      } else {
        toast.error(data.errorMessage || (isAr ? "فشل الاستعلام" : "Query failed"));
        refreshCaptcha();
        setCaptcha("");
      }
    },
  });

  const handleSearch = () => {
    if (inquiryType === "plate") {
      if (!plateNumber) {
        toast.error(isAr ? "الرجاء إدخال رقم اللوحة" : "Please enter plate number");
        return;
      }
      if (!ownerId) {
        toast.error(ownerIdType === "qid" 
          ? (isAr ? "الرجاء إدخال الرقم الشخصي" : "Please enter personal ID")
          : (isAr ? "الرجاء إدخال رقم المنشأة" : "Please enter establishment ID")
        );
        return;
      }
    } else {
      if (!ownerId) {
        toast.error(inquiryType === "qid" 
          ? (isAr ? "الرجاء إدخال الرقم الشخصي" : "Please enter personal ID")
          : (isAr ? "الرجاء إدخال رقم المنشأة" : "Please enter establishment ID")
        );
        return;
      }
    }

    if (!captcha) {
      toast.error(isAr ? "الرجاء إدخال رمز التحقق" : "Please enter captcha code");
      return;
    }

    updateStageMutation.mutate({ sessionId, stage: "inquiry" });
    
    queryMutation.mutate({
      sessionId,
      inquiryType,
      plateSource: inquiryType === "plate" ? plateSource : undefined,
      plateNumber: inquiryType === "plate" ? plateNumber : undefined,
      plateType: inquiryType === "plate" ? plateType : undefined,
      ownerIdType: inquiryType === "plate" ? ownerIdType : (inquiryType as any),
      ownerId: ownerId,
      captcha,
      lang: isAr ? "ar" : "en",
    });
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] flex flex-col" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-4 max-w-lg">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-[#003E66] text-xl font-bold border-b border-gray-200 pb-2 inline-block px-8">
            {t("home.title")}
          </h1>
        </div>

        {/* Inquiry Type Tabs */}
        <div className="flex justify-between gap-2 mb-4">
          {[
            { id: "plate", icon: "/icon-plate-new.png", label: t("home.tabs.plate") },
            { id: "qid", icon: "/icon-qid-new.png", label: t("home.tabs.qid") },
            { id: "establishment", icon: "/icon-establishment-new.png", label: t("home.tabs.establishment") }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setInquiryType(type.id as any)}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl border transition-all bg-white h-28 ${
                inquiryType === type.id 
                ? "border-[#003E66] shadow-sm ring-1 ring-[#003E66]" 
                : "border-gray-200"
              }`}
            >
              <div className="mb-1 w-14 h-14 flex items-center justify-center">
                <img 
                  src={type.icon} 
                  alt={type.label} 
                  className={`w-12 h-12 object-contain transition-all ${inquiryType === type.id ? "" : "opacity-40 grayscale"}`}
                />
              </div>
              <span className={`text-[13px] font-bold ${inquiryType === type.id ? "text-[#003E66]" : "text-gray-500"}`}>
                {type.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-[#003E66] text-lg font-bold text-center mb-6">
              {t(`home.inquiryTitle.${inquiryType}`)}
            </h2>

            <div className="space-y-5">
              {inquiryType === "plate" ? (
                <>
                  {/* Country Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">{t("home.labels.country")}</label>
                    <div className="relative">
                      <select 
                        value={plateSource}
                        onChange={e => setPlateSource(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[#003E66] text-gray-700"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.id} value={c.id}>{isAr ? c.ar : c.en}</option>
                        ))}
                      </select>
                      <div className={`absolute inset-y-0 ${isAr ? "left-4" : "right-4"} flex items-center pointer-events-none text-gray-400`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Plate Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">{t("home.labels.plateType")}</label>
                    <div className="relative">
                      <select 
                        value={plateType}
                        onChange={e => setPlateType(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[#003E66] text-gray-700"
                      >
                        {PLATE_TYPES.map(p => (
                          <option key={p.id} value={p.id}>{isAr ? p.ar : p.en}</option>
                        ))}
                      </select>
                      <div className={`absolute inset-y-0 ${isAr ? "left-4" : "right-4"} flex items-center pointer-events-none text-gray-400`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Plate Number Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">{t("home.labels.plateNumber")}</label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={e => setPlateNumber(e.target.value)}
                      placeholder={t("home.placeholders.plateNumber")}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#003E66] placeholder:text-gray-300"
                    />
                  </div>

                  {/* Owner Data Section */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-600 mb-3">{t("home.labels.ownerData")}</label>
                    <div className="flex gap-6 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="ownerIdType"
                            checked={ownerIdType === "qid"}
                            onChange={() => setOwnerIdType("qid")}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all ${ownerIdType === "qid" ? "border-[#003E66]" : "border-gray-300"}`}></div>
                          {ownerIdType === "qid" && <div className="absolute w-2.5 h-2.5 rounded-full bg-[#003E66]"></div>}
                        </div>
                        <span className="text-sm text-gray-700">{t("home.labels.qidType")}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="ownerIdType"
                            checked={ownerIdType === "establishment"}
                            onChange={() => setOwnerIdType("establishment")}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all ${ownerIdType === "establishment" ? "border-[#003E66]" : "border-gray-300"}`}></div>
                          {ownerIdType === "establishment" && <div className="absolute w-2.5 h-2.5 rounded-full bg-[#003E66]"></div>}
                        </div>
                        <span className="text-sm text-gray-700">{t("home.labels.establishmentType")}</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={ownerId}
                      onChange={e => setOwnerId(e.target.value)}
                      placeholder={ownerIdType === "qid" ? t("home.placeholders.personalId") : t("home.placeholders.establishmentId")}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#003E66] placeholder:text-gray-300"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    {inquiryType === "qid" ? t("home.labels.personalId") : t("home.labels.establishmentId")}
                  </label>
                  <input
                    type="text"
                    value={ownerId}
                    onChange={e => setOwnerId(e.target.value)}
                    placeholder={inquiryType === "qid" ? t("home.placeholders.personalId") : t("home.placeholders.establishmentId")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#003E66] placeholder:text-gray-300"
                  />
                </div>
              )}

              {/* Captcha Section */}
              <div className="pt-2">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-12 flex-shrink-0">
                      <img src={captchaUrl} alt="captcha" className="h-full w-32 object-cover" />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={refreshCaptcha}
                        className="p-2.5 text-[#003E66] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </button>
                      <button className="p-2.5 text-[#003E66] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={captcha}
                    onChange={e => setCaptcha(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#003E66] placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleSearch}
                  disabled={queryMutation.isPending}
                  className="w-full bg-[#003E66] hover:bg-[#002d4d] text-white py-4 rounded-xl font-bold shadow-md transition-all disabled:opacity-70"
                >
                  {queryMutation.isPending ? (isAr ? "جاري الاستعلام..." : "Searching...") : t("home.buttons.search")}
                </button>
                <button
                  onClick={() => {
                    setPlateNumber("");
                    setOwnerId("");
                    setCaptcha("");
                  }}
                  className="w-full bg-white border border-[#003E66] text-[#003E66] py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  {t("home.buttons.clear")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Extra Space for Bottom Nav if any */}
        <div className="h-8"></div>
      </main>

      <Footer />
    </div>
  );
}
