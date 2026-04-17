"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Plus,
  Building,
  Shield,
  Search
} from "lucide-react";
import { usersApi } from "@/lib/api";
import api from "@/lib/api";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { clsx } from "clsx";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user: authUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    roleId: "",
    franchiseId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, franchiseRes] = await Promise.all([
        usersApi.getAll(),
        api.get("/api/roles"),
        api.get("/api/franchise")
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setFranchises(franchiseRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        fullName: user.fullName || user.name,
        email: user.email,
        password: "",
        roleId: user.roleId || (user.roles?.[0]?.roleId || ""),
        franchiseId: user.franchiseId || ""
      });
    } else {
      setCurrentUser(null);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        roleId: "",
        franchiseId: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser) {
        await usersApi.update(currentUser.id, formData);
      } else {
        await usersApi.create(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const columns = useMemo(() => [
    {
      header: "User Information",
      accessor: (user: any) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-black text-xs shadow-sm shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-slate-800">
            {user.fullName?.[0].toUpperCase() || user.name?.[0].toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs">{user.fullName || user.name}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-0.5">
              <Mail size={10} />
              {user.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Organization",
      accessor: (user: any) => (
        <div className="flex items-center gap-2">
          <Building size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {user.franchise?.name || "Headquarters"}
          </span>
        </div>
      )
    },
    {
      header: "Primary Role",
      accessor: (user: any) => (
        <StatusBadge 
          label={user.role?.name || user.role || "No Role"} 
          type={user.role?.name === 'ADMIN' ? 'error' : user.role?.name === 'MANAGER' ? 'warning' : 'success'} 
        />
      )
    },
    {
      header: "Status",
      accessor: (user: any) => (
        <div className="flex items-center gap-2">
          <div className={clsx(
            "w-1.5 h-1.5 rounded-full",
            user.is_active ? "bg-green-500" : "bg-slate-300"
          )} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      )
    }
  ], []);

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const searchStr = `${u.fullName || u.name} ${u.email} ${u.role?.name || u.role}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 py-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            Workforce <span className="text-slate-400 font-medium ml-2 tracking-tighter">Directory</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Manage your global team for <span className="text-[#F58220] font-bold">Kiddos Foods</span> operations.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl transition-all active:scale-95 transform shadow-slate-200 dark:shadow-none"
        >
          <UserPlus size={18} />
          Create New User
        </button>
      </header>

      <DataTable 
        columns={columns} 
        data={filteredUsers} 
        loading={loading}
        onSearch={setSearchTerm}
        onRowClick={handleOpenModal}
        searchPlaceholder="Filter workforce by identifier..."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentUser ? "Update User Profile" : "Onboard New Staff"}
        size="md"
        footer={(
          <>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-200 dark:shadow-none hover:opacity-90 transition-all active:scale-95"
            >
              {currentUser ? "Save Changes" : "Confirm Onboarding"}
            </button>
          </>
        )}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. John Doe"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-bold text-sm"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="staff@kiddos.com"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-bold text-sm"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {!currentUser && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Temporary Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-bold text-sm"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Franchise Branch</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-bold text-sm appearance-none"
                value={formData.franchiseId}
                onChange={(e) => setFormData({...formData, franchiseId: e.target.value})}
              >
                <option value="">Headquarters (Global)</option>
                {franchises.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System Role</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-bold text-sm appearance-none"
                value={formData.roleId}
                onChange={(e) => setFormData({...formData, roleId: e.target.value})}
              >
                <option value="">Select a role...</option>
                {roles.map((role: any) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
