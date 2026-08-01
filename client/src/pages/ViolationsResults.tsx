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
      <div className="min-h-screen bg-white" dir={isAr ? "rtl" : "ltr"}>
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <Skeleton className="h-12 w-full mb-8" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
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
    <div className="min-h-screen bg-white flex flex-col" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      
      {/* Blue Header Title Strip */}
      <div className="bg-[#003E66] py-6 text-center">
        <h1 className="text-white text-2xl font-bold">
          {isAr ? "دفع المخالفات المرورية" : "Payment of Traffic Violations"}
        </h1>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-xl">
        {/* Dark Blue Vehicle Info Card */}
        <div className="bg-[#1B3E5F] rounded-lg shadow-md overflow-hidden mb-8 border border-[#1B3E5F]">
          <div className="p-4 border-b border-[#2C5275] text-center">
            <h2 className="text-white text-xl font-bold">{isAr ? "بيانات المركبة" : "Vehicle Details"}</h2>
          </div>
          <div className="p-8 space-y-6 text-center">
            <div>
              <p className="text-white/80 text-sm mb-2">{displayTitle}</p>
              <p className="text-[#5B9BD5] text-2xl font-bold tracking-wider">{displayId}</p>
            </div>
            
            <div className="border-t border-[#2C5275] pt-4">
              <p className="text-white/80 text-sm mb-2">{isAr ? "تاريخ انتهاء الرخصة" : "License Expiry Date"}</p>
              <p className="text-white text-xl font-bold">-</p>
            </div>

            <div className="border-t border-[#2C5275] pt-4">
              <p className="text-white/80 text-sm mb-2">{isAr ? "النوع" : "Type"}</p>
              <p className="text-white text-xl font-bold">-</p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {!hasViolations ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
            <p className="text-[#2E7D32] text-2xl font-bold mb-8">
              {isAr ? "لا توجد مخالفات" : "No Violations"}
            </p>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-white text-gray-800 border border-gray-200 px-12 py-6 rounded-lg hover:bg-gray-50 transition-all text-lg font-medium shadow-sm"
            >
              {isAr ? "الرجوع" : "Back"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Violations List Container */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-4 bg-gray-50 border-b">
                <p className="font-bold text-gray-700 text-center">
                  {isAr ? "قائمة المخالفات" : "Violations List"}
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {violations.map((v, i) => (
                  <div key={i} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">{isAr ? "رقم المخالفة" : "Violation No."}</p>
                        <p className="text-[#003E66] font-bold text-lg">{v.fineNumber}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[#8A1538] font-bold text-xl">{v.amount} <span className="text-xs">QAR</span></p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{isAr ? v.descriptionAr || v.description : v.description}</p>
                    <div className="flex justify-between text-[11px] text-gray-400 font-bold">
                      <span>{v.fineDate}</span>
                      <span>{isAr ? v.locationAr || v.location : v.location}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total Amount Summary */}
              <div className="p-6 bg-[#F8FAFC] border-t flex justify-between items-center">
                <span className="font-bold text-gray-700">{isAr ? "إجمالي المبلغ" : "Total Amount"}</span>
                <span className="text-2xl font-bold text-[#8A1538]">{totalAmount} <span className="text-sm">QAR</span></span>
              </div>
            </div>

            <Button 
              className="w-full bg-[#8A1538] hover:bg-[#70112d] text-white font-bold py-7 rounded-lg text-xl shadow-lg transition-all"
              onClick={() => setLocation(`/payment?session=${sessionId}`)}
            >
              {isAr ? "الانتقال للدفع" : "Proceed to Payment"}
            </Button>
            
            <Button 
              variant="ghost"
              className="w-full text-gray-400 font-medium py-4"
              onClick={() => setLocation("/")}
            >
              {isAr ? "إلغاء والرجوع" : "Cancel and Go Back"}
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
