import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <footer className="bg-white border-t border-gray-100 py-12 w-full mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Payment Methods & Digital Wallets Section */}
        <div className="mb-12">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-6">
            {isAr ? "طرق الدفع المدعومة" : "Supported Payment Methods"}
          </p>
          
          {/* Card Networks */}
          <div className="mb-8">
            <p className="text-[9px] text-gray-300 font-bold uppercase mb-3">{isAr ? "البطاقات البنكية" : "Credit Cards"}</p>
            <div className="flex flex-wrap items-center gap-6">
              <img src="/visa-logo.png" alt="Visa" className="h-6 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <img src="/mastercard-logo.png" alt="Mastercard" className="h-8 object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Digital Wallets */}
          <div className="mb-8">
            <p className="text-[9px] text-gray-300 font-bold uppercase mb-3">{isAr ? "المحافظ الرقمية" : "Digital Wallets"}</p>
            <div className="flex flex-wrap items-center gap-6">
              <img src="/apple-pay-logo.png" alt="Apple Pay" className="h-6 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <img src="/google-pay-logo.png" alt="Google Pay" className="h-5 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <img src="/samsung-pay-logo.png" alt="Samsung Pay" className="h-5 object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Local Payment Gateways */}
          <div>
            <p className="text-[9px] text-gray-300 font-bold uppercase mb-3">{isAr ? "بوابات الدفع المحلية" : "Local Payment Gateways"}</p>
            <div className="flex flex-wrap items-center gap-6">
              <img src="/naps-logo.png" alt="NAPS" className="h-8 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <img src="/qpay-logo.png" alt="QPAY" className="h-8 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <img src="/himyan-logo.png" alt="HIMYAN" className="h-8 object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Security Compliance */}
        <div className="py-8 border-t border-gray-50 mb-8">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4">
            {isAr ? "الامتثال الأمني" : "Security Compliance"}
          </p>
          <div className="flex items-center gap-4 bg-gray-50/50 px-6 py-4 rounded-lg border border-gray-100 w-fit">
            <img src="/pci-dss-logo.png" alt="PCI DSS" className="h-10 object-contain" />
            <div className="text-[9px] font-black text-gray-400 leading-tight uppercase tracking-tighter">
              Certified<br />PCI-DSS<br />COMPLIANT
            </div>
          </div>
        </div>
        
        {/* Bottom Links & Copyright */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-400 font-black uppercase tracking-widest">
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
