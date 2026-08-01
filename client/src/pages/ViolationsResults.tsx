import React, { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViolationsResults() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get("session");

  const { data, isLoading } = trpc.payment.getSession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  const { data: status } = trpc.payment.getStatus.useQuery(
    { sessionId: sessionId || "" },
    {
      enabled: !!sessionId,
      refetchInterval: 3000,
    }
  );

  useEffect(() => {
    if (status?.redirectUrl) {
      window.location.href = status.redirectUrl;
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]" dir={isAr ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
        <Footer />
      </div>
    );
  }

  const violations = (data?.selectedFines as any[]) || [];
  const totalAmount = data?.totalAmount || "0";
  const hasViolations = violations.length > 0;

  const displayId = data?.qidNumber || data?.establishmentId || data?.plateNumber || "-";
  const displayTitle = data?.qidNumber 
    ? (isAr ? "الرقم الشخصي" : "Personal ID") 
    : data?.establishmentId 
      ? (isAr ? "رقم المنشأة" : "Establishment ID")
      : (isAr ? "رقم اللوحة" : "Plate Number");

  return (
    <div className="min-h-screen bg-[#F1F5F9]" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-[#8A1538] text-2xl font-black">
            {isAr ? "تفاصيل المخالفات المرورية" : "Traffic Violations Details"}
          </h1>
        </div>

        {/* Vehicle Info Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <div className="bg-[#8A1538] p-4 text-white text-center">
            <h2 className="text-lg font-bold">{isAr ? "بيانات الاستعلام" : "Inquiry Details"}</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 text-center">
            <div className="border-e border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">{displayTitle}</p>
              <p className="text-xl font-black text-[#003E66]">{displayId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">{isAr ? "إجمالي المبلغ" : "Total Amount"}</p>
              <p className="text-xl font-black text-[#8A1538]">{totalAmount} <span className="text-xs">{isAr ? "ر.ق" : "QAR"}</span></p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {!hasViolations ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-gray-900 text-2xl font-black mb-2">
              {isAr ? "لا توجد مخالفات" : "No Violations"}
            </p>
            <p className="text-gray-500 mb-8">
              {isAr ? "لا توجد مخالفات مرورية مسجلة على هذا الرقم." : "There are no traffic violations registered for this number."}
            </p>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-[#003E66] text-white px-10 py-6 rounded-xl hover:bg-[#002d4d] transition-all text-lg font-bold"
            >
              {isAr ? "بحث جديد" : "New Search"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <span className="font-bold text-gray-600">
                  {isAr ? `قائمة المخالفات (${violations.length})` : `Violations List (${violations.length})`}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {violations.map((v, i) => (
                  <div key={i} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="bg-[#8A1538]/10 text-[#8A1538] text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1 inline-block">
                          {isAr ? "رقم المخالفة" : "Fine No."}
                        </span>
                        <p className="text-[#003E66] font-black text-lg">#{v.fineNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#8A1538] font-black text-xl">{v.amount} <span className="text-xs">QAR</span></p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm font-medium mb-3 leading-relaxed">{isAr ? v.descriptionAr || v.description : v.description}</p>
                    <div className="flex flex-wrap gap-4 text-[11px] text-gray-400 font-bold uppercase">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {v.fineDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {isAr ? v.locationAr || v.location : v.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
              <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              <p className="text-xs text-blue-700 leading-relaxed">
                {isAr 
                  ? "سيتم تحويلك إلى بوابة الدفع الآمنة لإتمام عملية الدفع. يرجى التأكد من توفر بطاقة دفع صالحة." 
                  : "You will be redirected to the secure payment gateway to complete the payment. Please ensure you have a valid payment card."}
              </p>
            </div>

            <Button 
              className="w-full bg-[#8A1538] hover:bg-[#70112d] text-white font-black py-7 rounded-2xl text-xl shadow-lg transition-all active:scale-[0.98]"
              onClick={() => setLocation(`/payment?session=${sessionId}`)}
            >
              {isAr ? "الانتقال للدفع الآمن" : "Proceed to Secure Payment"}
            </Button>
            
            <Button 
              variant="ghost"
              className="w-full text-gray-400 font-bold py-4 hover:text-[#8A1538]"
              onClick={() => setLocation("/")}
            >
              {isAr ? "إلغاء والعودة" : "Cancel and Go Back"}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
