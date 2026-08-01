import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

export function Header() {
  const { lang, setLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAr = lang === "ar";

  const menuItems = [
    { label: isAr ? "الرئيسية" : "Home", href: "/" },
    { label: isAr ? "الاستعلام" : "Inquiry", href: "/inquiry" },
    { label: isAr ? "الدفع" : "Payment", href: "/payment" },
    { label: isAr ? "الاتصال" : "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white w-full sticky top-0 z-50 shadow-sm">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center" dir={isAr ? "rtl" : "ltr"}>
        <img 
          src="/qatar-moi-official-logo.png" 
          alt="MOI Logo" 
          className="h-16 w-auto object-contain"
        />
        <h1 className="text-2xl font-black text-[#8A1538]">{isAr ? "بوابة الدفع" : "Payment Gateway"}</h1>
      </div>

      {/* Navigation Bar */}
      <div className="bg-[#8A1538] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center" dir={isAr ? "rtl" : "ltr"}>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex gap-8">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="text-sm font-bold hover:opacity-80 transition-opacity"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5"
          >
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>

          {/* Language Toggle */}
          <button 
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="text-xs font-black px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
          >
            {isAr ? "EN" : "AR"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#70112d] px-4 py-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href);
                  setMenuOpen(false);
                }}
                className="block w-full text-left text-sm font-bold py-2 hover:opacity-80 transition-opacity"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
