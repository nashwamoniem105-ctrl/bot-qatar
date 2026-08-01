import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";

  return (
    <header className="bg-white border-b border-gray-100 w-full sticky top-0 z-50 shadow-sm overflow-hidden">
      {/* Main Header Row */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center" dir={isAr ? "rtl" : "ltr"}>
        
        {/* Left Side: MOI Logo & Divider & Text */}
        <div className="flex items-center gap-2 sm:gap-4">
          <img 
            src="/qatar-moi-official-logo.png" 
            alt="MOI Logo" 
            className="h-12 xs:h-16 sm:h-20 w-auto object-contain"
          />
          <div className="h-10 sm:h-14 w-[2px] bg-[#8A1538] opacity-20"></div>
          <div className="flex flex-col">
            <span className="text-[14px] xs:text-[18px] sm:text-[24px] font-black text-[#8A1538] leading-tight whitespace-nowrap">
              {isAr ? "بوابة الدفع" : "Payment Gateway"}
            </span>
            <span className="text-[9px] xs:text-[11px] sm:text-[14px] font-bold text-gray-400 leading-tight whitespace-nowrap uppercase tracking-tighter">
              {isAr ? "Payment Gateway" : "بوابة الدفع"}
            </span>
          </div>
        </div>

        {/* Right Side: Wallets & PCI DSS */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* PCI DSS - Integrated into header */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <img src="/pci-dss-logo.png" alt="PCI DSS" className="h-6 sm:h-8 object-contain" />
            <div className="text-[8px] font-black text-gray-400 leading-none uppercase">
              PCI-DSS<br />COMPLIANT
            </div>
          </div>

          {/* Digital Wallets Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/apple-pay-logo.png" alt="Apple Pay" className="h-5 sm:h-7 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            <img src="/google-pay-logo.png" alt="Google Pay" className="h-4 sm:h-6 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            <img src="/samsung-pay-logo.png" alt="Samsung Pay" className="h-3 sm:h-5 object-contain opacity-80 hover:opacity-100 transition-opacity" />
          </div>

          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="text-[11px] sm:text-xs font-black text-[#8A1538] hover:underline px-2 py-1"
          >
            {isAr ? "English" : "العربية"}
          </button>
        </div>
      </div>
      
      {/* Sub-header Navigation / Progress Bar */}
      <div className="bg-[#8A1538] w-full h-[3px]"></div>
    </header>
  );
}
