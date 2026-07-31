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

  return (
    <div className="min-h-screen bg-[#F8FAFC]" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#003E66] mb-2">
              {isAr ? "تفاصيل المخالفات المرورية" : "Traffic Violations Details"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isAr ? "عرض جميع المخالفات المسجلة على المركبة" : "View all recorded violations for the vehicle"}
            </p>
          </div>
          <Button variant="outline" className="border-[#003E66] text-[#003E66]" onClick={() => setLocation("/")}>
            {isAr ? "بحث جديد" : "New Search"}
          </Button>
        </div>

        {/* Summary Card - Official Qatar Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E9F1F4] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#003E66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">{isAr ? "إجمالي المخالفات" : "Total Violations"}</p>
                <p className="text-xl font-bold text-[#003E66]">{violations.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FDF2F2] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#8C1D3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">{isAr ? "المبلغ الإجمالي" : "Total Amount"}</p>
                <p className="text-xl font-bold text-[#8C1D3D]">{totalAmount} {isAr ? "ر.ق" : "QAR"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-[#003E66] text-white">
            <CardContent className="p-6 flex items-center justify-center h-full">
              <Button 
                className="w-full bg-[#8C1D3D] hover:bg-[#6b162e] text-white font-bold py-6 rounded-lg"
                onClick={() => setLocation(`/payment?session=${sessionId}`)}
              >
                {isAr ? "دفع المخالفات" : "Pay Violations"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Violations Table - Official MOI Qatar Layout */}
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-[#F8FAFC] text-[#003E66] border-b">
                  <tr>
                    <th className="px-6 py-4 font-bold">{isAr ? "رقم المخالفة" : "Violation No."}</th>
                    <th className="px-6 py-4 font-bold">{isAr ? "تاريخ المخالفة" : "Date"}</th>
                    <th className="px-6 py-4 font-bold">{isAr ? "وصف المخالفة" : "Description"}</th>
                    <th className="px-6 py-4 font-bold">{isAr ? "الموقع" : "Location"}</th>
                    <th className="px-6 py-4 font-bold">{isAr ? "القيمة (ر.ق)" : "Amount (QAR)"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {violations.length > 0 ? (
                    violations.map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#003E66]">{v.fineNumber}</td>
                        <td className="px-6 py-4 text-gray-600">{v.fineDate}</td>
                        <td className="px-6 py-4 text-gray-700 font-medium">{isAr ? v.descriptionAr : v.description}</td>
                        <td className="px-6 py-4 text-gray-600">{isAr ? v.locationAr : v.location}</td>
                        <td className="px-6 py-4 font-bold text-[#8C1D3D]">{v.amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {isAr ? "لا توجد بيانات متاحة" : "No data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-800">
            {isAr 
              ? "ملاحظة: يتم تحديث البيانات مباشرة من قاعدة بيانات وزارة الداخلية. يرجى التأكد من دفع المخالفات في الوقت المحدد لتجنب أي غرامات إضافية." 
              : "Note: Data is updated directly from the Ministry of Interior database. Please ensure fines are paid on time to avoid any additional penalties."}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
