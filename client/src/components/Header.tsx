import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";

  return (
    <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-50 shadow-sm overflow-hidden">
      {/* Main Header Row - Optimized for visibility and balance */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-6" dir={isAr ? "rtl" : "ltr"}>
        
        {/* MOI Emblem - Larger official logo */}
        <div className="flex items-center flex-shrink-0">
          <img 
            src="/qatar-moi-official-logo.png" 
            alt="MOI Logo" 
            className="h-14 xs:h-18 sm:h-24 w-auto object-contain"
          />
        </div>

        {/* Vertical Line and Payment Gateway - Larger and Bold */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink min-w-0">
          {/* Vertical Divider - maroon color, slightly thicker */}
          <div className="h-10 sm:h-16 w-[2px] bg-[#8A1538] flex-shrink-0"></div>
          
          {/* Payment Gateway Text - Larger, Bold, and Clear */}
          <div className={`flex flex-col ${isAr ? "items-end" : "items-start"} min-w-0 overflow-hidden`}>
            <span className="text-[16px] xs:text-[20px] sm:text-[26px] font-black text-[#8A1538] leading-tight whitespace-nowrap truncate">
              {isAr ? "بوابة الدفع" : "Payment Gateway"}
            </span>
            <span className="text-[10px] xs:text-[12px] sm:text-[16px] font-black text-black leading-tight whitespace-nowrap truncate">
              {isAr ? "Payment Gateway" : "بوابة الدفع"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Sub-header for Language & Menu */}
      <div className="bg-white border-y border-gray-100 w-full py-1.5">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center" dir={isAr ? "rtl" : "ltr"}>
          <button 
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="border-2 border-gray-200 rounded-xl px-3 py-1 flex items-center gap-2 text-[11px] sm:text-xs font-black text-[#003E66] hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isAr ? "English" : "العربية"} 
            <span className="bg-[#003E66] text-white px-1.5 rounded text-[9px] font-black">A文</span>
          </button>
          <button className="text-[#003E66]">
            <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
