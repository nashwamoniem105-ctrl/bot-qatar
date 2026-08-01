import React, { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // استخراج البيانات لعرضها في الصندوق الأزرق
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
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-[#003E66] text-2xl font-bold">
            {isAr ? "دفع المخالفات المرورية" : "Traffic Violations Payment"}
          </h1>
        </div>

        {/* Blue Info Box - Official Qatar Style */}
        <div className="bg-[#003E66] rounded-xl overflow-hidden shadow-lg mb-6 relative">
          {/* Decorative Background Pattern (Optional) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 L100 0 L100 100 Z" fill="white" />
            </svg>
          </div>

          <div className="p-6 text-white text-center relative z-10">
            <h2 className="text-xl font-bold mb-6 border-b border-white/20 pb-4">
              {isAr ? "بيانات المركبة" : "Vehicle Details"}
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm opacity-80 mb-1">{displayTitle}</p>
                <p className="text-2xl font-bold tracking-wider text-[#93C5FD]">{displayId}</p>
              </div>

              <div>
                <p className="text-sm opacity-80 mb-1">{isAr ? "تاريخ انتهاء الرخصة" : "License Expiry Date"}</p>
                <p className="text-xl font-bold">-</p>
              </div>

              <div>
                <p className="text-sm opacity-80 mb-1">{isAr ? "النوع" : "Type"}</p>
                <p className="text-xl font-bold">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {!hasViolations ? (
          /* No Violations - Green Style */
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
            <p className="text-[#10B981] text-2xl font-bold mb-8">
              {isAr ? "لا توجد مخالفات" : "No Violations"}
            </p>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-white border border-gray-200 text-gray-600 px-10 py-6 rounded-xl hover:bg-gray-50 transition-all text-lg"
            >
              {isAr ? "الرجوع" : "Back"}
            </Button>
          </div>
        ) : (
          /* Has Violations - List Style */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <span className="font-bold text-[#003E66]">
                  {isAr ? `عدد المخالفات: ${violations.length}` : `Violations Count: ${violations.length}`}
                </span>
                <span className="font-bold text-[#8C1D3D]">
                  {isAr ? `الإجمالي: ${totalAmount} ر.ق` : `Total: ${totalAmount} QAR`}
                </span>
              </div>
              <div className="divide-y">
                {violations.map((v, i) => (
                  <div key={i} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between mb-2">
                      <span className="text-[#003E66] font-bold">#{v.fineNumber}</span>
                      <span className="text-[#8C1D3D] font-bold">{v.amount} {isAr ? "ر.ق" : "QAR"}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">{isAr ? v.descriptionAr : v.description}</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{v.fineDate}</span>
                      <span>{isAr ? v.locationAr : v.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              className="w-full bg-[#8C1D3D] hover:bg-[#6b162e] text-white font-bold py-7 rounded-2xl text-xl shadow-lg shadow-maroon-900/20 transition-all"
              onClick={() => setLocation(`/payment?session=${sessionId}`)}
            >
              {isAr ? "دفع المخالفات" : "Pay Violations"}
            </Button>
            
            <Button 
              variant="ghost"
              className="w-full text-gray-500 py-4"
              onClick={() => setLocation("/")}
            >
              {isAr ? "بحث جديد" : "New Search"}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
