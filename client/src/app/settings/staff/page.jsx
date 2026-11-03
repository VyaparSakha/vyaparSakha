"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/servies/api";
import PageLoader from "@/components/PageLoader";
import {
  Users,
  UserPlus,
  Store,
  Shield,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronDown,
  Filter,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsStaffPage() {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreFilter, setSelectedStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "suspended"

  // Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteStoreId, setInviteStoreId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit role modal state
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [newRoleId, setNewRoleId] = useState("");
  const [updatingRole, setUpdatingRole] = useState(false);

  const loadOrganizationStaff = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/me/staff");
      if (res?.data) {
        setStores(res.data.stores || []);
        setEmployees(res.data.employees || []);
        setPendingInvitations(res.data.pendingInvitations || []);
      }
    } catch (err) {
      console.warn("Failed to load organization staff:", err);
      toast.error("Failed to load staff directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizationStaff();
  }, []);

  // When opening invite modal, fetch roles for the currently selected store
  const handleOpenInviteModal = async (initialStoreId) => {
    const storeToUse = initialStoreId || (stores.length > 0 ? stores[0]._id : "");
    setInviteStoreId(storeToUse);
    setInviteEmail("");
    setInviteRoleId("");
    setGeneratedInviteLink(null);
    setInviteModalOpen(true);

    if (storeToUse) {
      await fetchRolesForStore(storeToUse);
    }
  };

  const fetchRolesForStore = async (storeId) => {
    try {
      setLoadingRoles(true);
      const res = await apiGet(`/store/${storeId}/roles`);
      const rolesList = res?.data || (Array.isArray(res) ? res : []);
      setAvailableRoles(rolesList);
      if (rolesList.length > 0) {
        setInviteRoleId(rolesList[0]._id);
      }
    } catch (err) {
      console.warn("Failed to load roles for store:", err);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleStoreChangeInInvite = async (storeId) => {
    setInviteStoreId(storeId);
    await fetchRolesForStore(storeId);
  };

  const handleSubmitInvite = async (e) => {
    e.preventDefault();
    if (!inviteStoreId) {
      toast.error("Please select a store");
      return;
    }
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!inviteRoleId) {
      toast.error("Please select a role");
      return;
    }

    try {
      setInviting(true);
      const res = await apiPost(`/store/${inviteStoreId}/employees`, {
        email: inviteEmail.trim().toLowerCase(),
        roleId: inviteRoleId,
      });

      const inviteLink = res?.data?.invitationLink || res?.invitationLink || null;
      if (inviteLink) {
        setGeneratedInviteLink(inviteLink);
        toast.success("Invitation created! Share the secure link with your employee.");
      } else {
        toast.success("Invitation sent successfully!");
        setInviteModalOpen(false);
      }

      await loadOrganizationStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to invite employee");
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setCopiedLink(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Status toggle (Suspend / Reactivate)
  const handleToggleSuspend = async (emp) => {
    const storeId = emp.store?._id || emp.store;
    const isSuspended = emp.status === "suspended";
    const endpoint = isSuspended ? "reactivate" : "suspend";

    try {
      await apiPost(`/store/${storeId}/employees/${emp._id}/${endpoint}`);
      toast.success(isSuspended ? "Employee reactivated successfully" : "Employee suspended");
      await loadOrganizationStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update employee status");
    }
  };

  // Remove membership
  const handleRemoveEmployee = async (emp) => {
    const storeId = emp.store?._id || emp.store;
    const name = emp.user?.name || emp.user?.email || "this employee";

    if (!window.confirm(`Are you sure you want to remove ${name} from this store workspace?`)) {
      return;
    }

    try {
      await apiDelete(`/store/${storeId}/employees/${emp._id}`);
      toast.success("Employee removed from store");
      await loadOrganizationStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to remove employee");
    }
  };

  // Revoke pending invitation
  const handleRevokeInvitation = async (inv) => {
    const storeId = inv.store?._id || inv.store;
    if (!window.confirm(`Revoke invitation for ${inv.email}?`)) {
      return;
    }

    try {
      await apiPost(`/stores/${storeId}/invitations/${inv._id}/revoke`);
      toast.success("Invitation revoked");
      await loadOrganizationStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to revoke invitation");
    }
  };

  // Open Edit Role Modal
  const handleOpenEditRole = async (emp) => {
    setTargetEmployee(emp);
    const storeId = emp.store?._id || emp.store;
    setNewRoleId(emp.role?._id || "");
    setEditRoleModalOpen(true);
    await fetchRolesForStore(storeId);
  };

  const handleSaveRole = async () => {
    if (!targetEmployee || !newRoleId) return;
    const storeId = targetEmployee.store?._id || targetEmployee.store;

    try {
      setUpdatingRole(true);
      await apiPut(`/store/${storeId}/employees/${targetEmployee._id}/role`, {
        roleId: newRoleId,
      });
      toast.success("Employee role updated successfully");
      setEditRoleModalOpen(false);
      await loadOrganizationStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to update role");
    } finally {
      setUpdatingRole(false);
    }
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Store filter
      const empStoreId = String(emp.store?._id || emp.store || "");
      if (selectedStoreFilter !== "all" && empStoreId !== selectedStoreFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && emp.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (emp.user?.name || "").toLowerCase();
        const email = (emp.user?.email || "").toLowerCase();
        const storeName = (emp.store?.name || "").toLowerCase();
        const roleName = (emp.role?.name || "").toLowerCase();
        return name.includes(q) || email.includes(q) || storeName.includes(q) || roleName.includes(q);
      }

      return true;
    });
  }, [employees, selectedStoreFilter, statusFilter, searchQuery]);

  // Filtered pending invites
  const filteredInvitations = useMemo(() => {
    return pendingInvitations.filter((inv) => {
      const invStoreId = String(inv.store?._id || inv.store || "");
      if (selectedStoreFilter !== "all" && invStoreId !== selectedStoreFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const email = (inv.email || "").toLowerCase();
        const storeName = (inv.store?.name || "").toLowerCase();
        return email.includes(q) || storeName.includes(q);
      }
      return true;
    });
  }, [pendingInvitations, selectedStoreFilter, searchQuery]);

  if (loading) {
    return <PageLoader message="Loading team directory..." />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Page Header & Invite Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">
            <Users className="h-3 w-3" />
            <span>Organization Staff Hub</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Team &amp; Staff Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage employees, invitations, and assigned permissions across all your stores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOrganizationStaff}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh directory"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => handleOpenInviteModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Employee</span>
          </button>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Staff</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{employees.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Members</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {employees.filter((e) => e.status === "active").length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Invites</p>
          <p className="mt-1 text-2xl font-black text-amber-600">{pendingInvitations.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stores Managed</p>
          <p className="mt-1 text-2xl font-black text-blue-600">{stores.length}</p>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, email or store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Store Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Store className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedStoreFilter}
              onChange={(e) => setSelectedStoreFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Stores ({stores.length})</option>
              {stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/60 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === "active" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("suspended")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                statusFilter === "suspended" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Suspended
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Staff Directory Table ── */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h2 className="text-sm font-bold text-slate-900">
            Active Staff Directory ({filteredEmployees.length})
          </h2>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-800">No staff members found</h3>
            <p className="mt-1 text-xs text-slate-500">
              {employees.length === 0
                ? "You haven't invited any employees to your stores yet."
                : "No employees match your current filter settings."}
            </p>
            {employees.length === 0 && (
              <button
                onClick={() => handleOpenInviteModal()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite First Employee</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Store Workspace</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const isSuspended = emp.status === "suspended";
                  const storeName = emp.store?.name || "Unknown Store";
                  const roleName = emp.role?.name || "Employee";

                  return (
                    <tr key={emp._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 text-xs">
                            {emp.user?.name ? emp.user.name.charAt(0).toUpperCase() : "E"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {emp.user?.name || "Pending Account"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{emp.user?.email || "No email"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Store */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          <Store className="h-3 w-3 text-slate-400" />
                          <span>{storeName}</span>
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenEditRole(emp)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          title="Click to change role"
                        >
                          <Shield className="h-3 w-3" />
                          <span>{roleName}</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isSuspended
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleSuspend(emp)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                              isSuspended
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            }`}
                          >
                            {isSuspended ? "Reactivate" : "Suspend"}
                          </button>

                          <button
                            onClick={() => handleRemoveEmployee(emp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Remove from store"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pending Invitations Section ── */}
      {filteredInvitations.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs">
          <div className="border-b border-slate-100 bg-amber-50/40 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Pending Staff Invitations ({filteredInvitations.length})
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">Awaiting employee signup or acceptance</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredInvitations.map((inv) => (
              <div
                key={inv._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 px-6 hover:bg-slate-50/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-xs">{inv.email}</p>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {inv.role?.name || "Assigned Role"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Store: <strong className="text-slate-700">{inv.store?.name}</strong></span>
                    <span>•</span>
                    <span>
                      Expires: {new Date(inv.expiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRevokeInvitation(inv)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                  >
                    Revoke Invitation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Invite Employee Modal ── */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setInviteModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Invite Staff Member</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {generatedInviteLink ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Invitation Link Created!
                  </p>
                  <p className="mt-1 leading-relaxed text-emerald-700">
                    Share this secure single-use invitation link with <strong>{inviteEmail}</strong> via WhatsApp, SMS, or Email:
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteLink}
                    className="flex-1 bg-transparent text-slate-700 outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="mt-2 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInvite} className="mt-6 space-y-4">
                {/* Store Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Assign to Store Workspace
                  </label>
                  <select
                    value={inviteStoreId}
                    onChange={(e) => handleStoreChangeInInvite(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    {stores.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.businessType || "Retail"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Employee Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="employee@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Role Picker */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Assign Store Role
                  </label>
                  {loadingRoles ? (
                    <div className="p-2 text-xs text-slate-400">Loading roles...</div>
                  ) : (
                    <select
                      value={inviteRoleId}
                      onChange={(e) => setInviteRoleId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                    >
                      {availableRoles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} {r.isSystem ? "(Standard)" : "(Custom)"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {inviting ? "Creating Invitation..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Role Modal ── */}
      {editRoleModalOpen && targetEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setEditRoleModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-scaleIn">
            <h3 className="text-base font-bold text-slate-900">Change Staff Role</h3>
            <p className="mt-1 text-xs text-slate-500">
              Update role for <strong>{targetEmployee.user?.name || targetEmployee.user?.email}</strong> in {targetEmployee.store?.name}
            </p>

            <div className="mt-4 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select New Role</label>
              <select
                value={newRoleId}
                onChange={(e) => setNewRoleId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                {availableRoles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditRoleModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={updatingRole}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingRole ? "Saving..." : "Update Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

