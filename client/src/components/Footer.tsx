import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <footer className="bg-white border-t border-gray-200 py-10 w-full">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <div className="text-center md:text-start">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">
              {isAr ? "مدعوم بواسطة بوابة دفع آمنة" : "Powered by Secure Payment Gateway"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
              <img src="/visa-logo.png" alt="Visa" className="h-6 object-contain" />
              <img src="/mastercard-logo.png" alt="Mastercard" className="h-10 object-contain" />
              <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>
              <img src="/naps-logo.png" alt="NAPS" className="h-8 object-contain" />
              <img src="/qpay-logo.png" alt="QPAY" className="h-8 object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
            <img src="/pci-dss-logo.png" alt="PCI DSS" className="h-10 object-contain" />
            <div className="text-[10px] font-black text-gray-500 leading-tight">
              PCI-DSS<br />COMPLIANT
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <p>© {new Date().getFullYear()} {isAr ? "وزارة الداخلية - دولة قطر" : "Ministry of Interior - Qatar"}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#8A1538] transition-colors">{isAr ? "الشروط والأحكام" : "Terms & Conditions"}</a>
            <a href="#" className="hover:text-[#8A1538] transition-colors">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
