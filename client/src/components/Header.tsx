import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";

  return (
    <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-50 shadow-sm overflow-hidden">
      {/* Main Header Row - Balanced 50/50 layout */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between" dir={isAr ? "rtl" : "ltr"}>
        
        {/* Left Side: MOI Emblem - Taking 50% of the space */}
        <div className="flex-1 flex items-center justify-start">
          <img 
            src="/qatar-moi-logo-transparent.png" 
            alt="MOI Logo" 
            className="h-16 xs:h-20 sm:h-24 w-auto object-contain bg-transparent"
          />
        </div>

        {/* Vertical Divider - Centerish */}
        <div className="h-12 sm:h-16 w-[2px] bg-[#8A1538] mx-2 sm:mx-4 flex-shrink-0"></div>

        {/* Right Side: Payment Gateway Text - Taking 50% of the space */}
        <div className="flex-1 flex flex-col justify-center min-w-0 overflow-hidden">
          <div className={`flex flex-col ${isAr ? "items-start" : "items-start"}`}>
            <span className="text-[18px] xs:text-[22px] sm:text-[28px] font-bold text-[#8A1538] leading-tight whitespace-nowrap">
              {isAr ? "بوابة الدفع" : "Payment Gateway"}
            </span>
            <span className="text-[12px] xs:text-[14px] sm:text-[16px] font-bold text-black leading-tight whitespace-nowrap">
              {isAr ? "Payment Gateway" : "بوابة الدفع"}
            </span>
          </div>
        </div>
      </div>
      
      {/* Sub-header for Language - Slimmer for mobile */}
      <div className="bg-white border-y border-gray-100 w-full py-1">
        <div className="max-w-4xl mx-auto px-3 flex justify-between items-center" dir={isAr ? "rtl" : "ltr"}>
          <button 
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="border border-gray-200 rounded px-2 py-0.5 flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-[#003E66] hover:bg-gray-50 transition-colors"
          >
            {isAr ? "English" : "العربية"} 
            <span className="bg-[#003E66] text-white px-1 rounded text-[8px] sm:text-[9px]">A文</span>
          </button>
          <button className="text-[#003E66]">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
