import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
export function Header() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";
  return (
    <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-50 shadow-sm overflow-hidden">
      {/* Main Header Row - Official MOI Logo with Payment Gateway Text */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-6" dir={isAr ? "rtl" : "ltr"}>
        {/* Official MOI Logo */}
        <div className="flex items-center flex-shrink-0">
          <img 
            src="/qatar-moi-official.jpg" 
            alt="Ministry of Interior - State of Qatar" 
            className="h-20 sm:h-24 w-auto object-contain"
          />
        </div>
        
        {/* Vertical Divider */}
        <div className="h-20 sm:h-24 w-[2.5px] bg-[#8A1538] flex-shrink-0"></div>
        
        {/* Payment Gateway Text */}
        <div className={`flex flex-col ${isAr ? "items-end" : "items-start"} flex-grow`}>
          <span className="text-2xl sm:text-3xl font-black text-[#8A1538] leading-tight">
            {isAr ? "بوابة الدفع" : "Payment Gateway"}
          </span>
          <span className="text-sm sm:text-base font-bold text-black leading-tight">
            {isAr ? "Payment Gateway" : "بوابة الدفع"}
          </span>
        </div>
      </div>
      
      {/* Sub-header for Language & Menu */}
      <div className="bg-white border-y border-gray-100 w-full py-2">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center" dir={isAr ? "rtl" : "ltr"}>
          <button 
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="border border-gray-200 rounded px-3 py-1 flex items-center gap-2 text-xs font-bold text-[#003E66] hover:bg-gray-50 transition-colors"
          >
            {isAr ? "English" : "العربية"} 
            <span className="bg-[#003E66] text-white px-1.5 rounded text-[9px] font-black">A文</span>
          </button>
          <button className="text-[#003E66] hover:opacity-70 transition-opacity">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
