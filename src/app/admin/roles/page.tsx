"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert,
  Search, 
  Shield, 
  MoreVertical,
  Edit,
  Trash2,
  X,
  Plus,
  Lock,
  CheckCircle2,
  ListFilter
} from "lucide-react";
import api from "@/lib/api";

const AVAILABLE_PERMISSIONS = [
  { id: "users:view", label: "View Users", category: "Users" },
  { id: "users:create", label: "Create Users", category: "Users" },
  { id: "users:edit", label: "Edit Users", category: "Users" },
  { id: "users:delete", label: "Delete Users", category: "Users" },
  { id: "roles:view", label: "View Roles", category: "Roles" },
  { id: "roles:create", label: "Create Roles", category: "Roles" },
  { id: "roles:edit", label: "Edit Roles", category: "Roles" },
  { id: "roles:delete", label: "Delete Roles", category: "Roles" },
  { id: "inventory:view", label: "View Inventory", category: "Inventory" },
  { id: "inventory:manage", label: "Manage Inventory", category: "Inventory" },
  { id: "pos:access", label: "Access POS", category: "POS" },
  { id: "pos:refund", label: "Process Refunds", category: "POS" },
];

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/roles");
      setRoles(res.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role: any = null) => {
    if (role) {
      setCurrentRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        permissions: Array.isArray(role.permissions) ? role.permissions : []
      });
    } else {
      setCurrentRole(null);
      setFormData({
        name: "",
        description: "",
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentRole) {
        await api.put(`/api/roles/${currentRole.id}`, formData);
      } else {
        await api.post("/api/roles", formData);
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this role? Standard roles might be required for system stability.")) {
      try {
        await api.delete(`/api/roles/${id}`);
        fetchRoles();
      } catch (error) {
        console.error("Failed to delete role:", error);
      }
    }
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc: any, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <ShieldCheck className="text-primary" size={32} />
            Role Management
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Define and configure system roles and their associated permissions.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Create New Role
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-[32px] border border-muted animate-pulse shadow-sm" />
          ))
        ) : roles.map((role: any) => (
          <div key={role.id} className="bg-white rounded-[32px] border border-muted p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Shield size={28} />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleOpenModal(role)}
                    className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(role.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black tracking-tight text-foreground mb-2">{role.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 font-medium h-10">
                {role.description || "No description provided for this role."}
              </p>

              <div className="flex items-center justify-between py-4 border-t border-muted">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
                  <Lock size={14} />
                  {Array.isArray(role.permissions) ? role.permissions.length : 0} Permissions
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-white flex items-center justify-center text-[10px] font-bold">
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8 pb-4 flex items-center justify-between border-b border-muted">
              <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
                {currentRole ? <Edit className="text-primary" /> : <Plus className="text-primary" />}
                {currentRole ? "Edit Role" : "Create New Role"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Role Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Master Chef, Floor Manager"
                    className="w-full bg-muted/30 border border-muted/50 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-bold text-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Briefly describe what users with this role can do..."
                    className="w-full bg-muted/30 border border-muted/50 rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground ml-1">Permissions Configuration</label>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase tracking-widest">
                      {formData.permissions.length} Selected
                    </span>
                  </div>
                  
                  <div className="bg-muted/10 rounded-[32px] p-6 max-h-72 overflow-y-auto custom-scrollbar border border-muted/30">
                    {Object.entries(groupedPermissions).map(([category, perms]: [string, any]) => (
                      <div key={category} className="mb-6 last:mb-0">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                          <ListFilter size={12} />
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map((perm: any) => (
                            <label key={perm.id} className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-primary/5 transition-colors cursor-pointer border border-muted/50 has-[:checked]:border-primary/30 group">
                              <div className="relative flex items-center">
                                <input 
                                  type="checkbox" 
                                  className="peer sr-only"
                                  checked={formData.permissions.includes(perm.id)}
                                  onChange={(e) => {
                                    const newPerms = e.target.checked 
                                      ? [...formData.permissions, perm.id]
                                      : formData.permissions.filter(id => id !== perm.id);
                                    setFormData({...formData, permissions: newPerms});
                                  }}
                                />
                                <div className="w-5 h-5 rounded-md border-2 border-muted group-hover:border-primary transition-all peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center">
                                  <CheckCircle2 size={12} className="text-white scale-0 peer-checked:scale-100 transition-transform" />
                                </div>
                              </div>
                              <span className="text-xs font-bold text-muted-foreground group-has-[:checked]:text-foreground transition-colors">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-muted/50 text-foreground py-4 rounded-2xl font-bold hover:bg-muted transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 shadow-lg shadow-primary/10"
                >
                  {currentRole ? "Save Changes" : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
