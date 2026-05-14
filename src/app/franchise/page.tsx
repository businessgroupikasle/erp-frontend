"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { 
  Building2, Plus, X, MapPin, User, Phone, Edit2, Trash2, 
  RefreshCw, Search, Shield, Key, Eye, EyeOff, MoreVertical,
  AlertTriangle, CheckCircle2, Info, Power, Terminal
} from "lucide-react";
import { clsx } from "clsx";
import { franchiseApi, userGovernanceApi, default as api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

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
  dashboardPassword: "",
  adminUser: {
    email: "",
    password: "",
    fullName: ""
  }
};

export default function FranchisePage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<any>(null);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  
  // Role Protection
  useEffect(() => {
    if (!loading && currentUser && currentUser.role === 'FRANCHISE_ADMIN') {
      router.push('/franchise/dashboard');
    }
  }, [currentUser, loading, router]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'users'>('info');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFranchiseUsers, setSelectedFranchiseUsers] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ type: 'error' | 'success' | 'info', title: string, message: string } | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({ fullName: "", email: "", password: "", roleId: "FRANCHISE_ADMIN" });
  const [roles, setRoles] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showUserPassword, setShowUserPassword] = useState(false);

  const fetchFranchises = useCallback(async () => {
    setLoading(true);
    try {
      const res = await franchiseApi.getAll();
      // Filter out internal HQ and confusing duplicates to maintain 2-level hierarchy
      const cleanList = (res.data ?? []).filter((f: any) => 
        !f.name.includes("Headquarters (HQ)") && 
        !f.name.includes("Distribution Center") &&
        f.id !== "hq-001" // Main HQ is managed as Super Admin, not as a franchise branch
      );
      setFranchises(cleanList);
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
      dashboardPassword: f.dashboardPassword || "",
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
        const { adminUser, ...updateData } = form;
        await franchiseApi.update(editing.id, updateData);
      } else {
        const payload = { ...form };
        if (payload.adminUser.email) {
          const email = payload.adminUser.email;
          payload.adminUser.email = email.includes('@') ? email : `${email}@gmail.com`;
        } else {
          // If no email, send as empty string or null
          payload.adminUser.email = ""; 
        }
        await franchiseApi.create(payload);
      }
      setShowForm(false);
      fetchFranchises();
      setNotification({
        type: 'success',
        title: editing ? 'Update Successful' : 'Franchise Created',
        message: `${form.name} has been ${editing ? 'updated' : 'registered'} successfully.`
      });
    } catch (e: any) { 
      setNotification({
        type: 'error',
        title: 'Save Failed',
        message: e.response?.data?.error || "Failed to save franchise"
      });
    }
    finally { setSaving(false); }
  };

  const handleVerifyAndRedirect = async (f: any) => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      const pass = prompt(`Enter Dashboard Access Password for ${f.name}:`);
      if (pass === null) return; // User cancelled

      try {
        const res = await franchiseApi.verifyPassword(f.id, pass);
        if (res.data.isValid) {
          window.location.href = `/franchise/dashboard?id=${f.id}`;
        } else {
          toast.error('Incorrect Dashboard Password');
        }
      } catch (e) {
        console.error(e);
        toast.error('Verification failed. Please try again.');
      }
    } else {
      window.location.href = `/franchise/dashboard`;
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await franchiseApi.delete(confirmDelete.id);
      setConfirmDelete(null);
      fetchFranchises();
      setNotification({
        type: 'success',
        title: 'Franchise Deleted',
        message: 'The franchise record has been permanently removed.'
      });
    } catch (e: any) {
      setNotification({
        type: 'error',
        title: 'Deletion Error',
        message: e?.response?.data?.error ?? "Failed to delete franchise"
      });
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.fullName || !userForm.email || (!editingUser && !userForm.password)) return;
    setSaving(true);
    try {
      const emailWithDomain = userForm.email.includes('@') ? userForm.email : `${userForm.email}@gmail.com`;
      const payload: any = { ...userForm, email: emailWithDomain };
      if (!payload.password) delete payload.password;

      if (editingUser) {
        await userGovernanceApi.update(editingUser.id, payload);
      } else {
        await userGovernanceApi.create({ ...payload, franchiseId: editing.id });
      }

      setShowAddUser(false);
      setEditingUser(null);
      setUserForm({ fullName: "", email: "", password: "", roleId: "FRANCHISE_ADMIN" });
      fetchUsers(editing.id);
      setNotification({
        type: 'success',
        title: editingUser ? 'User Updated' : 'Admin Added',
        message: `Account for ${userForm.fullName} has been ${editingUser ? 'updated' : 'created'}.`
      });
    } catch (e: any) {
      setNotification({
        type: 'error',
        title: 'Operation Failed',
        message: e.response?.data?.error || "Failed to process user request"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleStatus = async (f: any) => {
    const newStatus = f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await franchiseApi.update(f.id, { status: newStatus });
      fetchFranchises();
      setNotification({
        type: 'success',
        title: 'Status Updated',
        message: `${f.name} is now ${newStatus.toLowerCase()}.`
      });
    } catch (e: any) {
      setNotification({
        type: 'error',
        title: 'Toggle Failed',
        message: e.response?.data?.error || "Failed to update status"
      });
    }
  };

  const handlePasswordReset = async (userId: string) => {
    if (!newPassword) return;
    setSaving(true);
    try {
      await userGovernanceApi.resetPassword(userId, { password: newPassword });
      setResettingPassword(null);
      setNewPassword("");
      setNotification({
        type: 'success',
        title: 'Password Reset',
        message: 'User password has been updated successfully.'
      });
    } catch (e: any) {
      const errorMsg = e.response?.data?.error || e.response?.data?.message || "Failed to reset password";
      setNotification({
        type: 'error',
        title: 'Reset Failed',
        message: errorMsg
      });
    } finally {
      setSaving(false);
    }
  };

  const filtered = franchises.filter((f) =>
    !search ||
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.location?.toLowerCase().includes(search.toLowerCase()) ||
    f.ownerName?.toLowerCase().includes(search.toLowerCase())
  );

  if (!currentUser || currentUser.role === 'FRANCHISE_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-pulse">
          <Shield size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Authenticating Permissions...</p>
        </div>
      </div>
    );
  }

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
              Franchise Management
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            Master Oversight: Create branches and manage their primary administrators from here.
          </p>
        </div>
        {currentUser.role === 'SUPER_ADMIN' && (
          <div className="flex gap-3">
            <button onClick={fetchFranchises} className="p-3 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <RefreshCw size={18} className="text-slate-400" />
            </button>
            <button onClick={openCreate} className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e66000] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95">
              <Plus size={18} /> Add New Branch
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Outlets", val: franchises.length, color: "bg-blue-500" },
          { label: "Active Branches", val: franchises.filter(f => f.status === 'ACTIVE').length, color: "bg-[#FF6B00]" },
          { label: "Planned Setup", val: franchises.filter(f => f.status === 'PENDING').length, color: "bg-amber-500" },
          { label: "Branch Administrators", val: franchises.reduce((acc, f) => acc + (f._count?.users || 0), 0), color: "bg-purple-500" },
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
          <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Fetching Data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
          <Building2 size={64} strokeWidth={1} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No franchises found</p>
          <button onClick={openCreate} className="mt-4 text-[#FF6B00] font-black hover:underline">Register your first outlet now</button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => {
            const isHQ = f.name === "Kiddos Food Headquarters" || f.id === 'hq-001';
            const isActive = f.status === 'ACTIVE';

            return (
              <div 
                key={f.id} 
                className={clsx(
                  "group rounded-[2.5rem] border p-7 transition-all duration-500 relative overflow-hidden",
                  isHQ 
                    ? "bg-gradient-to-br from-orange-50/80 via-white to-white border-orange-200/50 shadow-2xl shadow-orange-500/10" 
                    : "bg-white/70 backdrop-blur-md border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50"
                )}
              >
                <div className={clsx(
                  "absolute top-[-10%] right-[-10%] w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-700",
                  isHQ ? "bg-orange-400 group-hover:scale-125" : "bg-slate-200 group-hover:bg-orange-200"
                )} />
                
                <div className="flex items-start justify-between relative z-10 mb-8">
                  <div className={clsx(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    "bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] shadow-orange-500/30"
                  )}>
                    {isHQ ? <Terminal size={28} className="text-white" /> : <Building2 size={28} className="text-white" />}
                  </div>
                  
                  <div className="flex gap-2 p-1.5 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm">
                    {!isHQ && (
                      <button 
                        onClick={() => handleToggleStatus(f)}
                        className={clsx(
                          "p-2.5 rounded-xl transition-all active:scale-90",
                          isActive 
                            ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20" 
                            : "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                        )}
                      >
                        <Power size={16} />
                      </button>
                    )}
                    <button onClick={() => handleVerifyAndRedirect(f)} className="p-2.5 rounded-xl text-slate-400 hover:text-[#FF6B00] transition-all active:scale-90">
                      <Eye size={18} />
                    </button>
                    {currentUser.role === 'SUPER_ADMIN' && (
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(f)} className="p-2.5 rounded-xl text-slate-400 hover:text-[#FF6B00] transition-all active:scale-90" title="Edit Branch">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(f)} 
                          disabled={f.status === 'ACTIVE'}
                          className={clsx(
                            "p-2.5 rounded-xl transition-all active:scale-90",
                            f.status === 'ACTIVE' ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                          )}
                          title="Delete/Revoke"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="font-black text-xl tracking-tight transition-colors text-slate-900 group-hover:text-[#FF6B00]">{f.name}</h3>
                      {isHQ && (
                        <span className="px-3 py-1 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 animate-pulse">Master</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest pl-0.5">
                      <MapPin size={14} className="text-orange-500" /> {f.location}
                    </div>
                  </div>

                  <div className="p-5 rounded-[2rem] space-y-3 transition-all duration-500 border border-slate-100 bg-white shadow-sm group-hover:shadow-md">
                    <div className="flex items-center gap-4 text-sm">
                      <User size={14} className="text-orange-500/70" />
                      <span className="font-bold text-slate-800 text-base">{f.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Phone size={14} className="text-blue-500/70" />
                      <span className="text-slate-500 font-bold tracking-tight">{f.contactNum}</span>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-slate-100/50">
                    <span className={clsx(
                      "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]",
                      STATUS_STYLES[f.status ?? "ACTIVE"] ?? STATUS_STYLES.ACTIVE
                    )}>
                      {f.status ?? "ACTIVE"}
                    </span>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Team</span>
                       <div className="flex items-center -space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                          {f._count?.users || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Combined Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0D0F14] rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{editing ? "Franchise Settings" : "Add New Franchise"}</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Configure branch details and primary admin.</p>
              </div>
              <button onClick={() => { setShowForm(false); setShowAddUser(false); setEditingUser(null); }} className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {editing && (
                <div className="flex gap-4 mb-8">
                  <button onClick={() => setActiveTab('info')} className={clsx("flex-1 py-3 rounded-2xl text-sm font-black transition-all border", activeTab === 'info' ? "bg-orange-50 border-[#FF6B00] text-[#FF6B00]" : "bg-slate-50 text-slate-400")}>Details</button>
                  <button onClick={() => setActiveTab('users')} className={clsx("flex-1 py-3 rounded-2xl text-sm font-black transition-all border", activeTab === 'users' ? "bg-orange-50 border-[#FF6B00] text-[#FF6B00]" : "bg-slate-50 text-slate-400")}>Admins</button>
                </div>
              )}

              {activeTab === 'info' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Franchise Name</label>
                    <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Branch Name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                    <input value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold" placeholder="City / Area" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Owner</label>
                      <input value={form.ownerName} onChange={(e) => setForm(f => ({ ...f, ownerName: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Name" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact</label>
                      <input value={form.contactNum} onChange={(e) => setForm(f => ({ ...f, contactNum: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold" placeholder="Phone" />
                    </div>
                  </div>

                  {!editing && (
                    <div className="mt-8 p-6 bg-orange-50 rounded-[2rem] border border-orange-200 space-y-4">
                      <h4 className="font-black text-sm uppercase tracking-wider">Primary Admin Account</h4>
                      <input value={form.adminUser.fullName} onChange={(e) => setForm(f => ({ ...f, adminUser: { ...f.adminUser, fullName: e.target.value } }))} className="w-full px-4 py-3 bg-white border rounded-xl font-bold text-sm" placeholder="Full Name" />
                      <div className="grid grid-cols-2 gap-4">
                        <input value={form.adminUser.email} onChange={(e) => setForm(f => ({ ...f, adminUser: { ...f.adminUser, email: e.target.value } }))} className="w-full px-4 py-3 bg-white border rounded-xl font-bold text-sm" placeholder="Login ID / Email" />
                        <input type="password" value={form.adminUser.password} onChange={(e) => {
                          const pass = e.target.value;
                          setForm(prev => ({ ...prev, dashboardPassword: pass, adminUser: { ...prev.adminUser, password: pass } }));
                        }} className="w-full px-4 py-3 bg-white border rounded-xl font-bold text-sm" placeholder="Password" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</h4>
                    <button onClick={() => setShowAddUser(true)} className="text-xs font-black text-[#FF6B00] hover:underline">+ New Admin</button>
                  </div>
                  {/* Admin User List Logic */}
                  <div className="space-y-3">
                    {selectedFranchiseUsers.map(u => (
                      <div key={u.id} className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center">
                        <div>
                          <p className="font-black text-sm">{u.fullName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                        <button onClick={() => setResettingPassword(u.id)} className="p-2 text-slate-400 hover:text-[#FF6B00]"><Key size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t bg-slate-50 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-8 py-4 font-black uppercase text-sm text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
              <button onClick={showAddUser ? handleCreateUser : handleSave} disabled={saving} className="px-12 py-4 bg-[#FF6B00] text-white rounded-2xl font-black uppercase text-sm shadow-xl shadow-orange-500/20 transition-all active:scale-95">
                {saving ? "..." : "Save Franchise"}
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
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Confirm Delete</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
              Are you sure you want to delete <span className="text-[#FF6B00] font-bold">&quot;{confirmDelete.name}&quot;</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-6 py-4 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-red-500/20 transition-all active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <Modal isOpen={!!notification} onClose={() => setNotification(null)} title={notification?.title || "Notification"} size="sm">
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <div className={clsx("w-20 h-20 rounded-full flex items-center justify-center", notification?.type === 'success' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
            {notification?.type === 'success' ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
          </div>
          <p className="text-slate-600 font-medium">{notification?.message}</p>
          <button onClick={() => setNotification(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm">Dismiss</button>
        </div>
      </Modal>
    </div>
  );
}
