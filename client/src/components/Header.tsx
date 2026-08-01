import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";

  return (
    <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center" dir={isAr ? "rtl" : "ltr"}>
        
        {/* Left: MOI Logo & Title */}
        <div className="flex items-center gap-4">
          <img 
            src="/qatar-moi-official-logo.png" 
            alt="MOI Logo" 
            className="h-16 w-auto object-contain"
          />
          <div className="h-12 w-[2px] bg-[#8A1538] opacity-20"></div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#8A1538]">{isAr ? "بوابة الدفع" : "Payment Gateway"}</span>
            <span className="text-xs font-bold text-gray-400 uppercase">{isAr ? "وزارة الداخلية" : "Ministry of Interior"}</span>
          </div>
        </div>

        {/* Right: Language Toggle */}
        <button 
          onClick={() => setLanguage(isAr ? "en" : "ar")}
          className="text-xs font-black text-[#8A1538] hover:underline"
        >
          {isAr ? "English" : "العربية"}
        </button>
      </div>
      
      {/* Bottom Border */}
      <div className="bg-[#8A1538] w-full h-[2px]"></div>
    </header>
  );
}
