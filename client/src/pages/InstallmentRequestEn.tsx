import React, { useState } from "react";
import { useLocation } from "wouter";
import { Shield, CreditCard, ArrowRight, Building2, User, Phone, Mail, Hash } from "lucide-react";

interface FormData {
  fullName: string;
  phone: string;
  ownerId: string;
  email: string;
  plateType: string;
  plateNumber: string;
  totalAmount: string;
  bank: string;
  duration: string;
}

export default function InstallmentRequestEn() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    ownerId: "",
    email: "",
    plateType: "Private",
    plateNumber: "",
    totalAmount: "",
    bank: "",
    duration: "12",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.ownerId.trim()) newErrors.ownerId = "QID is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    if (!formData.totalAmount.trim()) newErrors.totalAmount = "Total amount is required";
    if (parseFloat(formData.totalAmount) < 1000) newErrors.totalAmount = "Amount must be at least 1,000 QAR";
    if (!formData.bank) newErrors.bank = "Bank is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      localStorage.setItem("installmentData", JSON.stringify(formData));
      const paymentPayload = {
        totalAmount: formData.totalAmount,
        plateNumber: formData.plateNumber,
        plateSource: "QAT",
        selectedFines: [{ description: "Traffic Fines Installment Request", amount: formData.totalAmount, ticketNo: "INSTALLMENT" }]
      };
      sessionStorage.setItem("paymentData", JSON.stringify(paymentPayload));
      setLocation("/payment");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (name: string) => `w-full p-4 bg-gray-50 border-2 rounded-2xl focus:border-maroon-600 outline-none transition-all font-bold ${errors[name] ? 'border-red-500' : 'border-gray-100'}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="ltr">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-maroon-50 text-maroon-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Building2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Installment Request</h1>
          <p className="text-gray-500">Ministry of Interior - State of Qatar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-maroon-800 p-8 text-white">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Shield size={24} className="text-maroon-200" />
              Applicant Information
            </h3>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass('fullName')} placeholder="Name as in QID" />
                {errors.fullName && <p className="text-red-500 text-[10px] font-bold">{errors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone size={14} /> Mobile Number
                </label>
                <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass('phone')} placeholder="974XXXXXXXX" />
                {errors.phone && <p className="text-red-500 text-[10px] font-bold">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Hash size={14} /> QID Number
                </label>
                <input name="ownerId" value={formData.ownerId} onChange={handleChange} className={inputClass('ownerId')} placeholder="2XXXXXXXXXX" />
                {errors.ownerId && <p className="text-red-500 text-[10px] font-bold">{errors.ownerId}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <input name="email" value={formData.email} onChange={handleChange} className={inputClass('email')} placeholder="example@domain.com" />
                {errors.email && <p className="text-red-500 text-[10px] font-bold">{errors.email}</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                <CreditCard size={20} className="text-maroon-700" />
                Vehicle & Installment Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Plate Type</label>
                  <select name="plateType" value={formData.plateType} onChange={handleChange} className={inputClass('plateType')}>
                    <option>Private</option>
                    <option>Private Transport</option>
                    <option>Motorcycle</option>
                    <option>Public Transport</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Plate Number</label>
                  <input name="plateNumber" value={formData.plateNumber} onChange={handleChange} className={inputClass('plateNumber')} placeholder="Enter plate number" />
                  {errors.plateNumber && <p className="text-red-500 text-[10px] font-bold">{errors.plateNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount (QAR)</label>
                  <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} className={inputClass('totalAmount')} placeholder="1000" />
                  {errors.totalAmount && <p className="text-red-500 text-[10px] font-bold">{errors.totalAmount}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Bank</label>
                  <select name="bank" value={formData.bank} onChange={handleChange} className={inputClass('bank')}>
                    <option value="">Choose Bank</option>
                    <option value="qnb">QNB - Qatar National Bank</option>
                    <option value="cbq">Commercial Bank</option>
                    <option value="dib">Doha Bank</option>
                    <option value="qib">Qatar Islamic Bank</option>
                    <option value="dukhan">Dukhan Bank</option>
                  </select>
                  {errors.bank && <p className="text-red-500 text-[10px] font-bold">{errors.bank}</p>}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Duration</label>
                <div className="flex gap-4">
                  {['6', '12', '24'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, duration: m }))}
                      className={`flex-1 py-4 rounded-2xl font-black transition-all ${formData.duration === m ? 'bg-maroon-700 text-white shadow-lg' : 'bg-gray-50 text-gray-500 border-2 border-gray-100'}`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-maroon-100 transition-all flex items-center justify-center gap-3 group mt-10"
            >
              <span>Submit & Proceed to Payment</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">
              Secure E-Services Portal - Ministry of Interior Qatar
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
