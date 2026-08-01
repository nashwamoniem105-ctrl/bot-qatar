import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <footer className="bg-white border-t border-gray-100 py-12 w-full mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-10">
          
          {/* Security & Partners */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
              {isAr ? "شركاء الدفع الآمن" : "Secure Payment Partners"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-8">
              <img src="/visa-logo.png" alt="Visa" className="h-6 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <img src="/mastercard-logo.png" alt="Mastercard" className="h-10 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
              <img src="/naps-logo.png" alt="NAPS" className="h-10 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <img src="/qpay-logo.png" alt="QPAY" className="h-10 object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Compliance Status */}
          <div className="flex items-center gap-4 bg-gray-50/50 px-6 py-4 rounded-[1.5rem] border border-gray-100 shadow-sm">
            <img src="/pci-dss-logo.png" alt="PCI DSS" className="h-12 object-contain" />
            <div className="text-[9px] font-black text-gray-400 leading-tight uppercase tracking-tighter">
              Certified<br />PCI-DSS<br />COMPLIANT
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-400 font-black uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#8A1538] rounded-full"></span>
            <p>© {new Date().getFullYear()} {isAr ? "وزارة الداخلية - دولة قطر" : "Ministry of Interior - Qatar"}</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#8A1538] transition-colors">{isAr ? "الشروط والأحكام" : "Terms & Conditions"}</a>
            <a href="#" className="hover:text-[#8A1538] transition-colors">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</a>
            <a href="#" className="hover:text-[#8A1538] transition-colors">{isAr ? "مركز المساعدة" : "Help Center"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
