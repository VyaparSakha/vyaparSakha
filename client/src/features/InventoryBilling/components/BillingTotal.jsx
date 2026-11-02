import { useState, useRef, useEffect } from "react";
import { Lottie } from "lottie-react";
import completeBillAnimation from "@/assets/animations/billing_anim/NexaStore — Add Product · 4.5s.json";
import { cashAnimation, upiAnimation, cardAnimation } from "@/assets/Payment Method";
import { useBillPayment } from "../hooks";
import { useBillingContext } from "../context/billingContext";
import { getBuyers } from "@/features/buyer/services/buyerService";
import UpiQrModal from "./UpiQrModal";

import {
  User,
  Phone,
  Mail,
  Search,
  CheckCircle,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  Receipt,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export const BillingTotal = () => {
  const {
    billedProducts,
    clearBill,
    storeId,
    currentStore,
    discount,
    setDiscount,
    customerDetails,
    setCustomerDetails,
  } = useBillingContext();
  const {
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    handlePayment,
    totalAmount,
    itemCount,
  } = useBillPayment();

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [discountValue, setDiscountValue] = useState(
    discount?.value > 0 ? String(discount.value) : ""
  );
  const [localDiscountType, setLocalDiscountType] = useState(discount?.type || "fixed");

  // Keep local input fields in sync if discount in context is reset (e.g. after bill complete or clearBill)
  useEffect(() => {
    if (discount?.value === 0 && discountValue !== "") {
      setDiscountValue("");
    } else if (discount?.value > 0 && String(discount.value) !== discountValue) {
      setDiscountValue(String(discount.value));
      setLocalDiscountType(discount.type || "fixed");
    }
  }, [discount]);

  // Live customer search state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);

  const handleCustomerInputChange = (field, value) => {
    setCustomerDetails((prev) => ({
      ...prev,
      [field]: value,
      buyerId: field === "name" || field === "phone" || field === "email" ? null : prev.buyerId,
    }));

    const searchVal = value.trim();
    if (searchVal.length >= 2 && storeId) {
      setIsSearching(true);
      setShowDropdown(true);

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const data = await getBuyers(storeId, { search: searchVal, limit: 5 });
          const list = data?.buyers || data?.data?.buyers || (Array.isArray(data) ? data : []);
          setSearchResults(list);
        } catch (err) {
          console.warn("[CUSTOMER_SEARCH] Failed to search buyers from backend:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectBuyer = (buyer) => {
    setCustomerDetails({
      buyerId: buyer._id,
      name: buyer.name || "",
      phone: buyer.phone || "",
      email: buyer.email || "",
    });
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleClearBuyer = () => {
    setCustomerDetails({
      buyerId: null,
      name: "",
      phone: "",
      email: "",
    });
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Safe discount application with validation against subtotal and negative values
  const handleApplyDiscount = () => {
    const rawVal = parseFloat(discountValue);
    if (!isNaN(rawVal) && rawVal > 0) {
      if (localDiscountType === "percent") {
        // Percentage cannot exceed 100%
        const clampedPercent = Math.min(100, Math.max(0, rawVal));
        setDiscount({ type: "percent", value: clampedPercent });
        setDiscountValue(String(clampedPercent));
      } else {
        // Fixed amount cannot exceed subtotal
        const maxAllowed = Math.max(0, subtotal);
        const clampedAmount = Math.min(maxAllowed, Math.max(0, rawVal));
        setDiscount({ type: "fixed", value: clampedAmount });
        setDiscountValue(String(clampedAmount));
      }
    } else {
      setDiscount({ type: "fixed", value: 0 });
      setDiscountValue("");
    }
  };

  const handleClearDiscount = () => {
    setDiscount({ type: "fixed", value: 0 });
    setDiscountValue("");
  };

  const handleSelectPaymentMethod = (method) => {
    setPaymentMethod(method);
    if (method === "upi" && billedProducts.length > 0) {
      setShowUpiModal(true);
    }
  };

  const subtotal = billedProducts.reduce(
    (sum, p) => sum + (p.price || p.sellingPrice || 0) * (p.billedQuantity || 1),
    0
  );

  return (
    <>
      <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/80 p-5 md:p-6 space-y-5 transition-all h-full min-h-[580px] flex flex-col justify-between">
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt size={19} className="text-indigo-600" />
            <span>Order Summary</span>
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {itemCount} total units
          </span>
        </div>

        {/* Customer Information Inputs with Live Backend Autocomplete */}
        <div className="relative p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span>Customer Details</span>
            </label>
            {customerDetails?.buyerId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                ✓ Saved Buyer
                <button
                  type="button"
                  onClick={handleClearBuyer}
                  className="ml-1 text-emerald-900 hover:text-red-600 font-black"
                  title="Clear"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={customerDetails?.name || ""}
              onChange={(e) => handleCustomerInputChange("name", e.target.value)}
              placeholder="Customer Name (e.g. Satyam Singh)"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="tel"
                value={customerDetails?.phone || ""}
                onChange={(e) => handleCustomerInputChange("phone", e.target.value)}
                placeholder="Phone number"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
              />
            </div>
            <div className="relative">
              <input
                type="email"
                value={customerDetails?.email || ""}
                onChange={(e) => handleCustomerInputChange("email", e.target.value)}
                placeholder="Email address"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
              />
            </div>
          </div>

          {/* Autocomplete Dropdown List */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-52 overflow-y-auto p-1">
              {isSearching ? (
                <div className="p-3 text-xs text-slate-400 font-medium text-center flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  Searching saved buyers...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-xs text-slate-400 font-medium text-center">
                  New customer profile will be created on checkout.
                </div>
              ) : (
                <div>
                  <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Select Saved Customer
                  </div>
                  {searchResults.map((b) => (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => handleSelectBuyer(b)}
                      className="w-full px-3 py-2.5 text-left hover:bg-indigo-50/70 rounded-xl transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                          {b.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {b.phone || "No phone"} {b.email ? `• ${b.email}` : ""}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white px-2 py-0.5 rounded-lg transition-colors">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pricing Breakdown Card - Clean light theme matching the billing interface */}
        <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-100/90 rounded-2xl md:rounded-3xl p-5 space-y-3.5 transition-all">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Items Total:</span>
              <span className="font-bold text-slate-900">{itemCount} units</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 font-medium">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>

            {discount.value > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-bold">
                <span className="flex items-center gap-1">
                  <span>Discount Applied:</span>
                  <button
                    type="button"
                    onClick={handleClearDiscount}
                    className="text-slate-400 hover:text-red-500 text-[11px] ml-1"
                    title="Remove discount"
                  >
                    ✕
                  </button>
                </span>
                <span>
                  -{discount.type === "percent" ? `${discount.value}%` : `₹${discount.value}`}
                </span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-3 border-t border-blue-200/60 flex justify-between items-end">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                Total Payable
              </p>
              <p className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                GST Included
              </span>
            </div>
          </div>
        </div>

        {/* Discount Section */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={13} className="text-indigo-600" />
            <span>Apply Discount</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                max={localDiscountType === "percent" ? "100" : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyDiscount();
                  }
                }}
                placeholder="0.00"
                className="w-full pl-3 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                <button
                  type="button"
                  onClick={() => setLocalDiscountType("percent")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                    localDiscountType === "percent"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setLocalDiscountType("fixed")}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors ${
                    localDiscountType === "fixed"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ₹
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shrink-0"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Payment Method Selector Tiles */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "cash", label: "Cash", animation: cashAnimation, icon: Banknote },
              { id: "upi", label: "UPI QR", animation: upiAnimation, icon: QrCode },
              { id: "card", label: "Card", animation: cardAnimation, icon: CreditCard },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleSelectPaymentMethod(method.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all group overflow-visible ${
                    isSelected
                      ? "bg-indigo-50/80 border-indigo-600 text-indigo-700 shadow-xs ring-2 ring-indigo-500/20"
                      : "bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center overflow-visible transition-transform duration-200 group-hover:scale-110">
                    {mounted ? (
                      <Lottie
                        src={method.animation}
                        loop
                        autoplay
                        className="w-full h-full object-contain pointer-events-none select-none scale-125"
                      />
                    ) : (
                      <Icon size={20} className={isSelected ? "text-indigo-600" : "text-slate-500"} />
                    )}
                  </div>
                  <span className="text-xs font-bold tracking-tight">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fallback standard select for screen readers & form compatibility */}
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={(e) => handleSelectPaymentMethod(e.target.value)}
            className="sr-only"
            aria-label="Payment method"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>

          {/* Hint when UPI selected but no ID */}
          {paymentMethod === "upi" && !currentStore?.settings?.upiId && (
            <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
              <span>⚠️</span> No UPI ID configured in Store Settings.
            </p>
          )}
        </div>

        {/* Checkout Actions */}
        <div className="pt-2 space-y-2.5">
          <button
            onClick={handlePayment}
            disabled={billedProducts.length === 0 || isProcessing}
            className="w-full relative overflow-visible py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none group"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Bill...</span>
              </>
            ) : (
              <>
                {/* Lottie animation at left side of button — only shown when at least 1 product is added */}
                {mounted && billedProducts.length > 0 ? (
                  <div className="w-10 h-10 -my-3 -ml-2 flex-shrink-0 flex items-center justify-center overflow-visible transition-transform duration-200 group-hover:scale-110">
                    <Lottie
                      src={completeBillAnimation}
                      loop
                      autoplay
                      className="w-full h-full object-contain scale-[2.4] pointer-events-none select-none"
                    />
                  </div>
                ) : (
                  <CheckCircle size={18} className="text-white/80 shrink-0" />
                )}
                <span>Complete & Generate Bill</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <button
            onClick={clearBill}
            disabled={billedProducts.length === 0 || isProcessing}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} />
            <span>Clear Current Bill</span>
          </button>
        </div>
      </div>

      {/* UPI QR Popup */}
      <UpiQrModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        totalAmount={totalAmount}
        upiId={currentStore?.settings?.upiId || null}
        upiName={currentStore?.settings?.upiName || null}
        storeName={currentStore?.name}
      />
    </>
  );
};
