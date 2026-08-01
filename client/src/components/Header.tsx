import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";

  return (
    <header className="bg-white border-b border-gray-200 w-full sticky top-0 z-50 shadow-sm">
      {/* Main Header Row */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between" dir={isAr ? "rtl" : "ltr"}>
        
        {/* MOI Logo - Centered */}
        <div className="flex items-center justify-center flex-1">
          <img 
            src="/qatar-moi-logo-new-final.jpg" 
            alt="Qatar Ministry of Interior" 
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Payment Gateway Text - Right side */}
        <div className={`flex items-center gap-3 flex-shrink-0 ${isAr ? "ml-auto" : "mr-auto"}`}>
          <span className="text-[#003E66] font-bold text-lg">
            {isAr ? "بوابة الدفع" : "Payment Gateway"}
          </span>
        </div>

        {/* Language Toggle - Left side */}
        <button 
          onClick={() => setLanguage(isAr ? "en" : "ar")}
          className="border border-gray-300 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-[#003E66] hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          {isAr ? "English" : "العربية"}
        </button>
      </div>
    </header>
  );
}
