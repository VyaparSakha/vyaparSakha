'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet, apiPost } from '@/servies/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceContext } from '@/context/WorkspaceContext';
import { toast } from 'react-hot-toast';
import {
  Store,
  User,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Clock,
  Ban,
  ShieldCheck,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

export default function InvitePage() {
  const params = useParams();
  const token = params?.token;
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { refreshWorkspaces } = useWorkspaceContext();

  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteStatus, setInviteStatus] = useState('loading'); // 'pending' | 'invalid' | 'expired' | 'revoked' | 'accepted' | 'success'
  const [statusMessage, setStatusMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);
        // Call backend validation API (supports /api/invitations/:token or /api/invite/:token)
        const response = await apiGet(`/invitations/${token}`);
        if (response?.data?.valid) {
          setInviteData(response.data);
          setInviteStatus('pending');
        } else {
          const status = response?.data?.status || 'invalid';
          setInviteStatus(status);
          setStatusMessage(response?.message || 'Invalid or expired invite link.');
        }
      } catch (err) {
        const errorData = err?.data;
        const status = errorData?.status || 'invalid';
        setInviteStatus(status);
        setStatusMessage(err?.message || 'Failed to verify invite link.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvite();
    }
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to accept the invitation');
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    // Check email verification if provided in Firebase user
    if (user && user.emailVerified === false) {
      toast.error('Please verify your email address before accepting the invitation');
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiPost(`/invitations/${token}/accept`);
      if (response?.success || response?.data?.storeId) {
        toast.success(response?.message || 'Successfully joined store!');
        setInviteStatus('success');
        // Refresh workspaces so the new store membership appears immediately
        await refreshWorkspaces();
        setTimeout(() => {
          const targetStoreId = response?.data?.storeId;
          if (targetStoreId) {
            router.push(`/storeDashboard/${targetStoreId}`);
          } else {
            router.push('/storeDashboard');
          }
        }, 1200);
      } else {
        toast.error(response?.message || 'Failed to accept invitation');
      }
    } catch (err) {
      toast.error(err?.message || 'An error occurred while accepting invitation');
      if (err?.message?.includes('expired')) setInviteStatus('expired');
      if (err?.message?.includes('revoked')) setInviteStatus('revoked');
      if (err?.message?.includes('already')) setInviteStatus('accepted');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this invitation?')) return;
    router.push('/');
  };

  // Check email mismatch
  const isEmailMismatch =
    isAuthenticated &&
    user?.email &&
    inviteData?.email &&
    user.email.toLowerCase().trim() !== inviteData.email.toLowerCase().trim();

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-bold italic">Verifying your invitation securely...</p>
      </div>
    );
  }

  // Success State
  if (inviteStatus === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-emerald-100 shadow-xl">
        <div className="mb-6 inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle size={54} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">WELCOME TO THE TEAM!</h2>
        <p className="text-slate-600 text-sm font-semibold mb-6">
          You are now an active team member of <strong>{inviteData?.storeName}</strong>. Redirecting to your workspace...
        </p>
        <button
          onClick={() => router.push('/storeDashboard')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all w-full"
        >
          Go to Dashboard Now →
        </button>
      </div>
    );
  }

  // Already Accepted State
  if (inviteStatus === 'accepted') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-md">
        <div className="mb-6 inline-flex p-4 rounded-full bg-blue-50 text-blue-600">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">ALREADY ACCEPTED</h2>
        <p className="text-slate-600 text-sm font-semibold mb-6">
          This invitation has already been accepted. You can access this store directly from your workspaces.
        </p>
        <button
          onClick={() => router.push('/storeDashboard')}
          className="bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition-colors w-full"
        >
          View Your Workspaces →
        </button>
      </div>
    );
  }

  // Expired State
  if (inviteStatus === 'expired') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-amber-200 shadow-md">
        <div className="mb-6 inline-flex p-4 rounded-full bg-amber-50 text-amber-600">
          <Clock size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">INVITATION EXPIRED</h2>
        <p className="text-slate-600 text-sm font-semibold mb-6">
          This invitation link has expired (links are valid for 48 hours). Please contact the store owner to request a new invitation.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-slate-100 text-slate-800 font-bold py-3.5 px-8 rounded-xl hover:bg-slate-200 transition-colors w-full"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // Revoked State
  if (inviteStatus === 'revoked') {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-red-200 shadow-md">
        <div className="mb-6 inline-flex p-4 rounded-full bg-red-50 text-red-600">
          <Ban size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">INVITATION REVOKED</h2>
        <p className="text-slate-600 text-sm font-semibold mb-6">
          This invitation has been revoked by the store owner and can no longer be used.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-slate-100 text-slate-800 font-bold py-3.5 px-8 rounded-xl hover:bg-slate-200 transition-colors w-full"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // Invalid Token State
  if (inviteStatus === 'invalid' || !inviteData) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="mb-6 inline-flex p-4 rounded-full bg-red-50 text-red-500">
          <XCircle size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase">INVALID INVITATION</h2>
        <p className="text-slate-600 text-sm font-semibold mb-6">
          {statusMessage || 'The invitation link is invalid or has expired.'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-slate-100 text-slate-900 font-bold py-3.5 px-8 rounded-xl hover:bg-slate-200 transition-colors w-full"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 md:mt-16 px-4 mb-16">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition-opacity" />

        <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Employee Workspace Invitation
            </span>
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="mb-5 inline-flex p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                <Mail size={36} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                JOIN <span className="text-blue-600">{inviteData.storeName}</span>
              </h1>
              <p className="text-slate-600 font-medium text-base">
                You have been invited by <strong className="text-slate-900">{inviteData.invitedBy}</strong> to join as a{' '}
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-sm">
                  🛡️ {inviteData.roleName}
                </span>
                .
              </p>
            </div>

            {/* Details cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-3 rounded-xl bg-white text-slate-600 shadow-xs">
                  <Store size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Store</p>
                  <p className="font-bold text-slate-800 text-sm">{inviteData.storeName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-3 rounded-xl bg-white text-slate-600 shadow-xs">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned Role</p>
                  <p className="font-bold text-slate-800 text-sm">{inviteData.roleName}</p>
                </div>
              </div>
            </div>

            {/* Email Mismatch Warning */}
            {isEmailMismatch && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 mb-8 text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Email Account Mismatch</h4>
                    <p className="text-xs text-amber-800 mt-1">
                      This invitation was sent to <strong>{inviteData.email}</strong>, but you are currently signed in as{' '}
                      <strong>{user.email}</strong>.
                    </p>
                    <p className="text-xs text-amber-800 mt-1">
                      To accept, please log out and sign in with the invited email address.
                    </p>
                    <button
                      onClick={async () => {
                        await logout();
                        router.push(`/login?redirect=/invite/${token}`);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out & Switch Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isAuthenticated ? (
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 text-center">
                <p className="text-blue-800 font-semibold text-sm mb-4">
                  Sign in or create your Vyapar Sathi account to accept this invitation.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push(`/login?redirect=/invite/${token}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm uppercase tracking-wider"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => router.push(`/signUp?redirect=/invite/${token}`)}
                    className="flex-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-bold py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            ) : isEmailMismatch ? null : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wider py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      ACCEPT INVITATION
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="flex-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 font-bold uppercase tracking-wider py-4 rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-slate-400">
        Secured by Vyapar Sathi Multi-Tenant Identity Manager
      </p>
    </div>
  );
}
