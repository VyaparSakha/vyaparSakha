"use client";

import { ArrowLeft, Package, MapPin, Phone, Mail, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useManualProductAdd } from "../hooks";

export const BillingHeader = ({ storeId, storeName, currentStore, isMobile }) => {
  const router = useRouter();
  const { setIsModalOpen } = useManualProductAdd();

  const name = currentStore?.name || currentStore?.storeName || storeName || "Vyapar Sakha Store";

  const formatAddress = (store) => {
    if (!store) return "";
    let addr = store.address || store.location || store.fullAddress || "";
    let pincode = store.pincode || store.pinCode || store.zipCode || "";

    if (typeof addr === "object" && addr !== null) {
      if (addr.pincode) pincode = addr.pincode;
      if (addr.fullAddress) {
        addr = addr.fullAddress;
      } else {
        const parts = [addr.street, addr.city, addr.state, addr.country].filter((v) => Boolean(v) && v !== "N/A");
        addr = parts.join(", ");
      }
    }

    addr = String(addr || "").trim();
    pincode = String(pincode || "").trim();

    if (addr && pincode && !addr.includes(pincode)) {
      return `${addr} - ${pincode}`;
    }
    return addr || (pincode ? `PIN: ${pincode}` : "");
  };

  const storeAddressStr = formatAddress(currentStore);
  const storePhone = currentStore?.phone || currentStore?.mobile || currentStore?.contact || currentStore?.owner?.phone || "";
  const storeEmail = currentStore?.email || currentStore?.owner?.email || "";

  return (
    <header className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-xs border border-slate-200/80 p-3.5 sm:p-4 md:p-5 transition-all">
      {/* Soft gradient banner accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        {/* Store Brand & Back navigation */}
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {!isMobile && (
            <button
              onClick={() => router.push(`/storeDashboard/${storeId}`)}
              className="group p-2 sm:p-2.5 bg-slate-100/80 hover:bg-indigo-50/90 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all duration-200 flex-shrink-0 text-slate-600 hover:text-indigo-600 hover:shadow-xs active:scale-95 mt-0.5 sm:mt-0"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
          )}

          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 flex-shrink-0 ring-4 ring-indigo-50">
            <Store size={20} className="stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 tracking-wide shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                POS Active
              </span>
            </div>

            {/* Store Details: Address, Contact */}
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-500 font-medium mt-1">
              {storeAddressStr && (
                <span className="inline-flex items-start sm:items-center gap-1.5 min-w-0 max-w-full text-slate-600">
                  <MapPin size={13} className="text-indigo-500 shrink-0 mt-0.5 sm:mt-0" />
                  <span className="break-words leading-tight">{storeAddressStr}</span>
                </span>
              )}

              {storePhone && (
                <span className="inline-flex items-center gap-1.5 shrink-0 text-slate-600">
                  <Phone size={13} className="text-indigo-500 shrink-0" />
                  <span>{storePhone}</span>
                </span>
              )}

              {storeEmail && (
                <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full text-slate-600">
                  <Mail size={13} className="text-indigo-500 shrink-0" />
                  <span className="break-all">{storeEmail}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Add Product Manually */}
        <div className="flex items-center justify-start sm:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-0 border-slate-100">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Package size={16} />
            <span>Add Product Manually</span>
          </button>
        </div>
      </div>
    </header>
  );
};
