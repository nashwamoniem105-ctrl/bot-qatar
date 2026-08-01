import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";

  return (
    <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-50 shadow-sm overflow-hidden">
      {/* Main Header Row - Using Grid to force divider to exact center */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center" dir={isAr ? "rtl" : "ltr"}>
        
        {/* Side 1: MOI Emblem - Aligned to the center-line */}
        <div className={`flex items-center ${isAr ? "justify-start" : "justify-start"}`}>
          <img 
            src="/qatar-moi-official-logo.png" 
            alt="MOI Logo" 
            className="h-14 xs:h-20 sm:h-28 w-auto object-contain"
          />
        </div>

        {/* Center: Vertical Divider - Exactly in the middle */}
        <div className="h-12 sm:h-20 w-[2.5px] bg-[#8A1538] mx-2 sm:mx-6"></div>

        {/* Side 2: Payment Gateway Text - Aligned to the center-line */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex flex-col items-start">
            <span className="text-[18px] xs:text-[24px] sm:text-[34px] font-black text-[#8A1538] leading-tight whitespace-nowrap">
              {isAr ? "بوابة الدفع" : "Payment Gateway"}
            </span>
            <span className="text-[12px] xs:text-[16px] sm:text-[22px] font-black text-black leading-tight whitespace-nowrap">
              {isAr ? "Payment Gateway" : "بوابة الدفع"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Sub-header for Language & Menu */}
      <div className="bg-white border-y border-gray-100 w-full py-1.5">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center" dir={isAr ? "rtl" : "ltr"}>
          <button 
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="border-2 border-gray-200 rounded-xl px-4 py-1.5 flex items-center gap-2 text-[11px] sm:text-xs font-black text-[#003E66] hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isAr ? "English" : "العربية"} 
            <span className="bg-[#003E66] text-white px-1.5 rounded text-[9px] font-black">A文</span>
          </button>
          <button className="text-[#003E66] p-1.5">
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
