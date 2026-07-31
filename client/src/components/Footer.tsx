import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  // Using the uploaded image URLs for Arabic and English footers
  const footerImageUrl = isAr 
    ? "https://files.manuscdn.com/user_upload_by_module/session_file/310519663865224572/zTYiwuFcEAmCMXFc.jpg" 
    : "https://files.manuscdn.com/user_upload_by_module/session_file/310519663865224572/TJivDLSfikcudqiL.jpg";

  return (
    <footer className="w-full bg-[#314252] flex justify-center items-center">
      <div className="w-full max-w-[1080px]">
        <img 
          src={footerImageUrl} 
          alt={isAr ? "تذييل الصفحة" : "Footer"} 
          className="w-full h-auto block"
        />
      </div>
    </footer>
  );
};
