import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";

  return (
    <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-50 shadow-sm overflow-hidden">
      {/* Main Header Row - Balanced 50/50 layout */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2" dir={isAr ? "rtl" : "ltr"}>
        
        {/* Side 1: Full MOI Logo with Text - Balanced half */}
        <div className="flex items-center justify-center overflow-hidden">
          <img 
            src="/qatar-moi-logo-full-transparent.png" 
            alt="Qatar Ministry of Interior" 
            className="h-16 xs:h-22 sm:h-28 w-auto object-contain"
          />
        </div>

        {/* Center: Thick Vertical Divider */}
        <div className="h-12 sm:h-20 w-[3px] bg-[#8A1538] mx-1 sm:mx-4"></div>

        {/* Side 2: Bold Payment Gateway Text - Balanced half */}
        <div className="flex flex-col justify-center min-w-0 overflow-hidden">
          <div className="flex flex-col items-start">
            <span className="text-[20px] xs:text-[26px] sm:text-[34px] font-black text-[#8A1538] leading-tight whitespace-nowrap">
              {isAr ? "بوابة الدفع" : "Payment Gateway"}
            </span>
            <span className="text-[12px] xs:text-[16px] sm:text-[20px] font-black text-black leading-tight whitespace-nowrap">
              {isAr ? "Payment Gateway" : "بوابة الدفع"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Sub-header for Language & Menu */}
      <div className="bg-white border-y border-gray-100 w-full py-2">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center" dir={isAr ? "rtl" : "ltr"}>
          <button 
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="border-2 border-gray-200 rounded-xl px-4 py-1.5 flex items-center gap-2 text-xs sm:text-sm font-black text-[#003E66] hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isAr ? "English" : "العربية"} 
            <span className="bg-[#003E66] text-white px-2 rounded text-[10px] font-black">A文</span>
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
