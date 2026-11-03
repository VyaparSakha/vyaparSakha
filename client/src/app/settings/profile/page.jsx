"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/features/profile/hooks/useUserProfile";
import {
  ProfileHeader,
  PersonalInfoSection,
  AccountSecuritySection,
} from "@/features/profile/components";
import PageLoader from "@/components/PageLoader";

export default function SettingsProfilePage() {
  const router = useRouter();
  const {
    user,
    profileData,
    loading,
    saving,
    handleUpdateProfile,
    handleSendPasswordReset,
    handleSendVerification,
  } = useUserProfile();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return <PageLoader message="Loading your profile details..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Page Title & Description ── */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Profile & Security
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal credentials, contact details, and Firebase authentication settings.
        </p>
      </div>

      {/* ── Profile Header Card ── */}
      <ProfileHeader user={user} profileData={profileData} />

      {/* ── Personal Info Form ── */}
      <PersonalInfoSection
        user={user}
        profileData={profileData}
        onUpdate={handleUpdateProfile}
        saving={saving}
      />

      {/* ── Security & Password Reset ── */}
      <AccountSecuritySection
        user={user}
        onSendPasswordReset={handleSendPasswordReset}
        onSendVerification={handleSendVerification}
      />
    </div>
  );
}

