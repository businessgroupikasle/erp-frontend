"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2, Plus, X, MapPin, User, Phone, Edit2, Trash2,
  RefreshCw, Search, Shield, Key, Eye, EyeOff, MoreVertical
} from "lucide-react";
import { clsx } from "clsx";
import { franchiseApi, userGovernanceApi, default as api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  INACTIVE: "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-slate-400",
  PENDING:  "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
};

const EMPTY_FORM = { 
  name: "", 
  location: "", 
  ownerName: "", 
  contactNum: "", 
  status: "ACTIVE",
  adminUser: {
    email: "",
    password: "",
    fullName: ""
  }
};

export default function FranchisePage() {
  const { user: currentUser } = useAuth();
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<any>(null);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'users'>('info');
  const [selectedFranchiseUsers, setSelectedFranchiseUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({ fullName: "", email: "", password: "", roleId: "FRANCHISEE" });
  const [roles, setRoles] = useState<any[]>([]);

  const fetchFranchises = useCallback(async () => {
    setLoading(true);
    try {
      const res = await franchiseApi.getAll();
      setFranchises(res.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFranchises(); }, [fetchFranchises]);

  const openCreate = () => { 
    setEditing(null); 
    setForm(EMPTY_FORM); 
    setActiveTab('info');
    setShowForm(true); 
  };

  const fetchUsers = useCallback(async (fId: string) => {
    setLoadingUsers(true);
    try {
      const res = await userGovernanceApi.getAll();
      setSelectedFranchiseUsers(res.data.filter((u: any) => u.franchiseId === fId));
    } catch (e) { console.error(e); }
    finally { setLoadingUsers(false); }
  }, []);

  const openEdit = async (f: any) => {
    setEditing(f);
    setForm({ 
      name: f.name, 
      location: f.location, 
      ownerName: f.ownerName, 
      contactNum: f.contactNum, 
      status: f.status ?? "ACTIVE",
      adminUser: { email: "", password: "", fullName: "" }
    });
    setActiveTab('info');
    setShowForm(true);
    setShowAddUser(false);
    fetchUsers(f.id);

    // Fetch roles if not already loaded
    if (roles.length === 0) {
      try {
        const rRes = await api.get("/api/roles");
        setRoles(rRes.data || []);
      } catch (e) { console.error(e); }
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.location) return;
    setSaving(true);
    try {
      if (editing) {
        // Sanitize payload for update
        const { adminUser, ...updateData } = form;
        await franchiseApi.update(editing.id, updateData);
      } else {
        // Prepare payload with optional admin user
        const payload = { ...form };
        if (!form.adminUser.email) delete (payload as any).adminUser;
        await franchiseApi.create(payload);
      }
      setShowForm(false);
      fetchFranchises();
    } catch (e: any) { 
      alert(e.response?.data?.error || "Failed to save franchise");
    }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await franchiseApi.delete(confirmDelete.id);
      setConfirmDelete(null);
      fetchFranchises();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to delete franchise");
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.fullName || !userForm.email || !userForm.password) return;
    setSaving(true);
    try {
      await userGovernanceApi.create({ ...userForm, franchiseId: editing.id });
      setShowAddUser(false);
      setUserForm({ fullName: "", email: "", password: "", roleId: "FRANCHISEE" });
      fetchUsers(editing.id);
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async (userId: string) => {
    const newPass = prompt("Enter new password for this user:");
    if (!newPass) return;
    try {
      await userGovernanceApi.resetPassword(userId, { password: newPass });
      alert("Password updated successfully!");
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to reset password");
    }
  };

  const filtered = franchises.filter((f) =>
    !search ||
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.location?.toLowerCase().includes(search.toLowerCase()) ||
    f.ownerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#FF6B00]/10 rounded-xl">
              <Building2 size={24} className="text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Franchise Governance
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            God-Mode: Monitor branches, manage owners, and maintain access credentials.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchFranchises} className="p-3 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={18} className="text-slate-400" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e66000] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95">
            <Plus size={18} /> Add New Branch
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Branches", val: franchises.length, color: "bg-blue-500" },
          { label: "Active Nodes", val: franchises.filter(f => f.status === 'ACTIVE').length, color: "bg-[#FF6B00]" },
          { label: "Pending Setup", val: franchises.filter(f => f.status === 'PENDING').length, color: "bg-amber-500" },
          { label: "Administrative Users", val: franchises.reduce((acc, f) => acc + (f._count?.users || 0), 0), color: "bg-purple-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stat.val}</p>
              <div className={`w-1.5 h-6 rounded-full ${stat.color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B00] transition-colors" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Filter by branch name, location, or owner..."
          className="w-full pl-12 pr-6 py-4 text-sm bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all shadow-sm font-medium" 
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Synchronizing Data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
          <Building2 size={64} strokeWidth={1} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No franchises found</p>
          <button onClick={openCreate} className="mt-4 text-[#FF6B00] font-black hover:underline">Register your first outlet now</button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <div key={f.id} className="group bg-white dark:bg-card rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-[4rem]" />
              
              <div className="flex items-start justify-between relative z-10 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Building2 size={24} className="text-white" />
                </div>
                <div className="flex gap-1">
                  <Link 
                    href={`/franchise/dashboard?id=${f.id}`}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                    title="Monitor Activity"
                  >
                    <Eye size={16} />
                  </Link>
                  <button onClick={() => openEdit(f)} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                    <Edit2 size={16} />
                  </button>
                    {(currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN") && (
                      <button 
                        onClick={() => setConfirmDelete(f)} 
                        disabled={f.name === "Kiddos Food Headquarters" || f.status === 'ACTIVE' || (f._count?.inventory || 0) > 0}
                        className={clsx(
                          "p-2 rounded-xl transition-all",
                          f.name === "Kiddos Food Headquarters" || f.status === 'ACTIVE' || (f._count?.inventory || 0) > 0
                            ? "bg-slate-100 dark:bg-white/5 text-slate-300 cursor-not-allowed"
                            : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        )}
                        title={
                          f.name === "Kiddos Food Headquarters" ? "System Protected Node" :
                          f.status === 'ACTIVE' ? "Set to Inactive to Delete" : 
                          f._count?.inventory > 0 ? "Clear stock to delete" : 
                          "Delete Franchise"
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-[#FF6B00] transition-colors">{f.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                    <MapPin size={12} className="text-[#FF6B00]" /> {f.location}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300 font-bold">{f.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={14} className="text-slate-400" />
                    <span>{f.contactNum}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className={clsx("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", STATUS_STYLES[f.status ?? "ACTIVE"] ?? STATUS_STYLES.ACTIVE)}>
                    {f.status ?? "ACTIVE"}
                  </span>
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-card flex items-center justify-center text-[10px] font-black">
                      +{f._count?.users || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Combined Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0D0F14] rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  {editing ? "Branch Architecture" : "Branch Registration"}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  {editing ? "Configure branch metadata and access nodes." : "Initialize a new franchise node in the network."}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="flex gap-4 mb-8">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={clsx(
                    "flex-1 py-3 rounded-2xl text-sm font-black transition-all border",
                    activeTab === 'info' 
                      ? "bg-orange-50 dark:bg-orange-900/20 border-[#FF6B00] text-[#FF6B00]" 
                      : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  Branch Metadata
                </button>
                {editing && (
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={clsx(
                      "flex-1 py-3 rounded-2xl text-sm font-black transition-all border",
                      activeTab === 'users' 
                        ? "bg-orange-50 dark:bg-orange-900/20 border-[#FF6B00] text-[#FF6B00]" 
                        : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    )}
                  >
                    User Management
                  </button>
                )}
              </div>

              {activeTab === 'info' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Franchise Name</label>
                      <input 
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Kiddos Jaipur Main"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-bold" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Location / Zone</label>
                      <input 
                        value={form.location}
                        onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                        placeholder="e.g. Rajasthan"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-bold" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Operational Status</label>
                      <select 
                        value={form.status}
                        onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-bold appearance-none"
                      >
                        <option value="ACTIVE">Active Node</option>
                        <option value="PENDING">Pending Configuration</option>
                        <option value="INACTIVE">Deactivated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Owner Name</label>
                      <input 
                        value={form.ownerName}
                        onChange={(e) => setForm(f => ({ ...f, ownerName: e.target.value }))}
                        placeholder="e.g. Aryan Khan"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-bold" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contact Priority</label>
                      <input 
                        value={form.contactNum}
                        onChange={(e) => setForm(f => ({ ...f, contactNum: e.target.value }))}
                        placeholder="+91 000 000 0000"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#FF6B00] transition-all font-bold" 
                      />
                    </div>
                  </div>

                  {!editing && (
                    <div className="mt-8 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-500 rounded-lg shadow-lg shadow-orange-500/40">
                          <Shield size={16} className="text-white" />
                        </div>
                        <h4 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">Initial Administrator Node</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin Full Name</label>
                          <input 
                            value={form.adminUser.fullName}
                            onChange={(e) => setForm(f => ({ ...f, adminUser: { ...f.adminUser, fullName: e.target.value } }))}
                            placeholder="e.g. Branch Supervisor"
                            className="w-full px-5 py-3.5 bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-[#FF6B00] font-bold text-sm" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Login Email</label>
                            <input 
                              value={form.adminUser.email}
                              onChange={(e) => setForm(f => ({ ...f, adminUser: { ...f.adminUser, email: e.target.value } }))}
                              placeholder="admin@branch.com"
                              className="w-full px-5 py-3.5 bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-[#FF6B00] font-bold text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Access Key</label>
                            <div className="relative">
                              <input 
                                type={showPassword ? "text" : "password"}
                                value={form.adminUser.password}
                                onChange={(e) => setForm(f => ({ ...f, adminUser: { ...f.adminUser, password: e.target.value } }))}
                                placeholder="••••••••"
                                className="w-full px-5 py-3.5 bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-[#FF6B00] font-bold text-sm" 
                              />
                              <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Franchise Personnel</h4>
                    {!showAddUser && (
                      <button 
                        onClick={() => setShowAddUser(true)}
                        className="flex items-center gap-1.5 text-xs font-black text-[#FF6B00] hover:underline"
                      >
                        <Plus size={14} /> New Operator
                      </button>
                    )}
                  </div>

                  {showAddUser ? (
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-orange-500/20 space-y-4 animate-in zoom-in-95 duration-300">
                      <div className="flex justify-between items-center mb-2">
                         <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase">Register New Personnel</h5>
                         <button onClick={() => setShowAddUser(false)} className="text-slate-400 p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                          <input 
                            value={userForm.fullName}
                            onChange={(e) => setUserForm(u => ({ ...u, fullName: e.target.value }))}
                            className="w-full px-4 py-3 bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-[#FF6B00] font-bold text-sm" 
                            placeholder="e.g. David Smith"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                          <input 
                            value={userForm.email}
                            onChange={(e) => setUserForm(u => ({ ...u, email: e.target.value }))}
                            className="w-full px-4 py-3 bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-[#FF6B00] font-bold text-sm" 
                            placeholder="david@branch.com"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                          <input 
                            type="password"
                            value={userForm.password}
                            onChange={(e) => setUserForm(u => ({ ...u, password: e.target.value }))}
                            className="w-full px-4 py-3 bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:border-[#FF6B00] font-bold text-sm" 
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Role Type</label>
                          <select 
                            value={userForm.roleId}
                            onChange={(e) => setUserForm(u => ({ ...u, roleId: e.target.value }))}
                            className="w-full px-4 py-3 bg-white dark:bg-[#1A1C24] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none font-bold text-sm appearance-none"
                          >
                            {roles.filter(r => ["FRANCHISEE", "MANAGER", "STAFF"].includes(r.name)).map(r => (
                              <option key={r.id} value={r.id || r.name}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button onClick={() => setShowAddUser(false)} className="px-4 py-2 text-xs font-black text-slate-400 hover:text-slate-600">Cancel</button>
                        <button 
                          onClick={handleCreateUser} 
                          disabled={saving || !userForm.fullName || !userForm.email || !userForm.password}
                          className="px-6 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                        >
                          {saving ? "Creating..." : "Confirm Registry"}
                        </button>
                      </div>
                    </div>
                  ) : loadingUsers ? (
                    <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Requesting User Registry...</div>
                  ) : selectedFranchiseUsers.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 flex flex-col items-center">
                      <Shield size={48} strokeWidth={1} className="mb-4 opacity-20" />
                      <p className="font-bold">No administrative users found for this branch.</p>
                      <button onClick={() => setShowAddUser(true)} className="mt-4 text-[#FF6B00] font-black text-xs hover:underline uppercase tracking-widest underline-offset-4">Register first user</button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedFranchiseUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-orange-500/30 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-[#FF6B00]">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-sm">{u.fullName}</p>
                              <p className="text-xs text-slate-500 font-medium">{u.email} • <span className="text-[#FF6B00] font-black text-[10px] tracking-widest uppercase">{u.role?.name || "Member"}</span></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                              onClick={() => handlePasswordReset(u.id)}
                              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-[#FF6B00] transition-all shadow-sm"
                              title="Reset Password"
                            >
                              <Key size={14} />
                            </button>
                            {currentUser?.role === "SUPER_ADMIN" && editing?.name !== "Kiddos Food Headquarters" && (
                              <button 
                                onClick={async () => {
                                  if (confirm(`Delete user ${u.fullName}?`)) {
                                    await userGovernanceApi.delete(u.id);
                                    fetchUsers(editing.id);
                                  }
                                }}
                                className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all shadow-sm"
                                title="Delete User"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-100 dark:border-white/5 flex gap-3 justify-end bg-slate-50 dark:bg-white/5">
              <button 
                onClick={() => setShowForm(false)} 
                className="px-6 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
              >
                Dismiss
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving || !form.name || !form.location}
                className="px-10 py-3 bg-[#FF6B00] hover:bg-[#e66000] disabled:opacity-50 text-white rounded-2xl text-sm font-black shadow-xl shadow-orange-500/20 transition-all active:scale-95"
              >
                {saving ? "Processing..." : editing ? "Update Architecture" : "Execute Registration"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0D0F14] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/10 p-8 text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <Trash2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Final Confirmation</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              Are you sure you want to decommission the <span className="text-[#FF6B00] font-bold">"{confirmDelete.name}"</span> node? 
              This will deactivate all access and mark it as deleted in the system.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 px-6 py-4 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-red-500/20 transition-all active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
