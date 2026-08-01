import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";

  return (
    <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-50 shadow-sm overflow-hidden">
      {/* Main Header Row - Balanced 50/50 layout using Grid */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center" dir={isAr ? "rtl" : "ltr"}>
        
        {/* Side 1: MOI Emblem - Taking 50% of the space */}
        <div className={`flex items-center ${isAr ? "justify-start" : "justify-start"}`}>
          <img 
            src="/qatar-moi-logo-final-v2.png" 
            alt="MOI Logo" 
            className="h-14 xs:h-18 sm:h-24 w-auto object-contain"
          />
        </div>

        {/* Center: Vertical Divider */}
        <div className="h-10 sm:h-16 w-[2px] bg-[#8A1538] mx-2 sm:mx-6"></div>

        {/* Side 2: Payment Gateway Text - Taking 50% of the space */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex flex-col items-start">
            <span className="text-[16px] xs:text-[20px] sm:text-[26px] font-bold text-[#8A1538] leading-tight whitespace-nowrap">
              {isAr ? "بوابة الدفع" : "Payment Gateway"}
            </span>
            <span className="text-[11px] xs:text-[13px] sm:text-[15px] font-bold text-black leading-tight whitespace-nowrap">
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
            className="border border-gray-200 rounded-lg px-3 py-1 flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#003E66] hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isAr ? "English" : "العربية"} 
            <span className="bg-[#003E66] text-white px-1.5 rounded text-[9px] font-bold">A文</span>
          </button>
          <button className="text-[#003E66] p-1">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
