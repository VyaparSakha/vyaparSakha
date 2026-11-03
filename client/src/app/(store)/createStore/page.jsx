"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CreateStoreProvider } from "@/features/createStore/context/CreateStoreContext";
import StoreForm from "@/features/createStore/components/StoreForm";
import { useWorkspaceContext } from "@/context/WorkspaceContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import PageLoader from "@/components/PageLoader";

/**
 * Create Store Page
 * Enforces backend store-creation eligibility policy on the frontend.
 */
function CreateStorePage() {
  const router = useRouter();
  const { isStoreCreationEligible, isLoading } = useWorkspaceContext();

  if (isLoading) {
    return <PageLoader message="Verifying store creation eligibility..." />;
  }

  // If user is employee-only, block store creation and explain policy
  if (!isStoreCreationEligible) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl border border-amber-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2">
            Store Creation Restricted
          </h2>
          <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
            Your account is currently associated only with employee memberships. Under Vyapar Sathi security policy, employee accounts cannot create new stores.
          </p>
          <button
            onClick={() => router.push("/storeDashboard")}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all"
          >
            <ArrowLeft size={16} />
            Back to Accessible Workspaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Create Your Store
          </h1>
          <p className="mt-3 text-lg text-slate-600 font-semibold">
            Set up your store in a few simple steps
          </p>
        </div>

        {/* Store Creation Form */}
        <CreateStoreProvider>
          <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-[2.5rem] border border-white/60 p-8">
            <StoreForm />
          </div>
        </CreateStoreProvider>
      </div>
    </div>
  );
}

export default CreateStorePage;
