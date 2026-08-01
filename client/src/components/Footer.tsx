import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1: About */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
              {isAr ? "عن البوابة" : "About Gateway"}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {isAr 
                ? "بوابة دفع آمنة وموثوقة من وزارة الداخلية لتسهيل عمليات الدفع الحكومية بكفاءة عالية."
                : "A secure and reliable payment gateway from the Ministry of Interior for efficient government payment processing."
              }
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
              {isAr ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-2 text-xs text-gray-500 font-medium">
              <li><a href="#" className="hover:text-[#8A1538] transition-colors">{isAr ? "الشروط والأحكام" : "Terms & Conditions"}</a></li>
              <li><a href="#" className="hover:text-[#8A1538] transition-colors">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</a></li>
              <li><a href="#" className="hover:text-[#8A1538] transition-colors">{isAr ? "مركز المساعدة" : "Help Center"}</a></li>
              <li><a href="#" className="hover:text-[#8A1538] transition-colors">{isAr ? "اتصل بنا" : "Contact Us"}</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">
              {isAr ? "معلومات الاتصال" : "Contact Info"}
            </h3>
            <ul className="space-y-2 text-xs text-gray-500 font-medium">
              <li>{isAr ? "البريد الإلكتروني:" : "Email:"} <a href="mailto:support@moi.gov.qa" className="text-[#8A1538]">support@moi.gov.qa</a></li>
              <li>{isAr ? "الهاتف:" : "Phone:"} <a href="tel:+97444403333" className="text-[#8A1538]">+974 4440 3333</a></li>
              <li>{isAr ? "الموقع:" : "Website:"} <a href="https://www.moi.gov.qa" className="text-[#8A1538]">www.moi.gov.qa</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-12"></div>

        {/* Payment Methods Section */}
        <div className="mb-12">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">
            {isAr ? "طرق الدفع المدعومة" : "Supported Payment Methods"}
          </h3>
          
          {/* Payment Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            {/* Credit Cards */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">{isAr ? "البطاقات البنكية" : "Credit Cards"}</p>
              <div className="flex items-center justify-center gap-6 py-6">
                <img src="/visa-logo.png" alt="Visa" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/mastercard-logo.png" alt="Mastercard" className="h-10 object-contain opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Digital Wallets */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">{isAr ? "المحافظ الرقمية" : "Digital Wallets"}</p>
              <div className="flex items-center justify-center gap-4 py-6 flex-wrap">
                <img src="/apple-pay-logo.png" alt="Apple Pay" className="h-6 object-contain opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/google-pay-logo.png" alt="Google Pay" className="h-5 object-contain opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/samsung-pay-logo.png" alt="Samsung Pay" className="h-5 object-contain opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Local Gateways */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">{isAr ? "البوابات المحلية" : "Local Gateways"}</p>
              <div className="flex items-center justify-center gap-4 py-6 flex-wrap">
                <img src="/naps-logo.png" alt="NAPS" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/qpay-logo.png" alt="QPAY" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/himyan-logo.png" alt="HIMYAN" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-12"></div>

        {/* Security & Compliance */}
        <div className="bg-gradient-to-r from-[#8A1538]/5 to-[#003E66]/5 rounded-xl border border-gray-100 p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                {isAr ? "معايير الأمان الدولية" : "International Security Standards"}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {isAr 
                  ? "نحن ملتزمون بأعلى معايير الأمان والتشفير لحماية بيانات العملاء."
                  : "We comply with international security standards to protect customer data."
                }
              </p>
            </div>
            <div className="flex items-center gap-6 flex-shrink-0">
              <img src="/pci-dss-logo.png" alt="PCI DSS" className="h-12 object-contain" />
              <div className="text-right">
                <p className="text-[10px] font-black text-[#8A1538] uppercase tracking-tighter">PCI-DSS</p>
                <p className="text-[9px] text-gray-400 font-bold">CERTIFIED</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#8A1538] rounded-full"></span>
            <p>© {new Date().getFullYear()} {isAr ? "وزارة الداخلية - دولة قطر" : "Ministry of Interior - State of Qatar"}</p>
          </div>
          <p className="text-[9px] text-gray-300">
            {isAr ? "جميع الحقوق محفوظة" : "All Rights Reserved"}
          </p>
        </div>
      </div>
    </footer>
  );
};
