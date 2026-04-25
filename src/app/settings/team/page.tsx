"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { Plus, Search, MoreHorizontal, ShieldCheck, X, Eye, LayoutDashboard, Settings, UserCheck, Loader2 } from "lucide-react";
import { userGovernanceApi } from "@/lib/api";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: {
    name: string;
    description?: string;
  };
  isYou?: boolean;
  redirectTo?: string;
  isPermanent?: boolean;
}

export default function ManageUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newUser, setNewUser] = useState({ 
    fullName: "", 
    email: "", 
    password: "Password@123", 
    roleName: "ADMIN" 
  });

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userGovernanceApi.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.fullName || "").toLowerCase().includes(search.toLowerCase()) || 
    (user.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!newUser.fullName || !newUser.email) return;
    
    setIsSaving(true);
    try {
      await userGovernanceApi.create(newUser);
      await fetchUsers(); // Refresh list
      setShowAddModal(false);
      setNewUser({ fullName: "", email: "", password: "Password@123", roleName: "ADMIN" });
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create user");
    } finally {
      setIsSaving(false);
    }
  };

  const removeUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this account?")) return;
    
    try {
      await userGovernanceApi.delete(id);
      await fetchUsers();
      setActiveMenu(null);
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <SettingsLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              Admin Users <span className="text-sm opacity-60">✨</span>
           </h2>
           <button 
             onClick={() => setShowAddModal(true)}
             className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-200/50"
           >
              <Plus size={16} /> Add User
           </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
           <div className="relative group flex items-center">
              <Search size={16} className="absolute left-4 text-[#999]" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Name/Email..." 
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium" 
              />
           </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
             <Loader2 size={32} className="animate-spin text-[#7C3AED]" />
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold text-[#999]">
              Showing {filteredUsers.length} to {filteredUsers.length} of {users.length} Record(s)
            </p>

            {/* User Cards */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-[#7C3AED]/20 transition-all shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#006699] flex items-center justify-center text-white text-xs font-black shadow-lg uppercase">
                         {(user.fullName || "??").substring(0, 2)}
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <button 
                              onClick={() => user.redirectTo && router.push(user.redirectTo)}
                              className="text-[14px] font-black text-[#1A1A1A] dark:text-white hover:text-[#7C3AED] transition-colors text-left"
                            >
                              {user.fullName}
                            </button>
                         </div>
                         <p className="text-[12px] font-medium text-[#666] dark:text-slate-400">{user.email}</p>
                         
                         <div className="flex items-center gap-2 pt-1">
                            <div className="px-3 py-1 bg-[#F3E8FF] border border-[#E9D5FF] rounded-lg flex items-center gap-2 transition-all hover:bg-[#E9D5FF]">
                               <span className="text-[11px] font-extrabold text-[#7C3AED]">{user.role?.name || "N/A"}</span>
                               {!user.isPermanent && (
                                 <button onClick={() => removeUser(user.id)} className="text-[#7C3AED] hover:text-[#5B21B6] transition-colors ml-1">
                                    <X size={10} strokeWidth={4} />
                                 </button>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-6 pr-4">
                      <button 
                        onClick={() => user.redirectTo && router.push(user.redirectTo)}
                        className="flex flex-col items-center gap-1 group/btn"
                      >
                         <Eye size={20} className="text-[#999] group-hover/btn:text-[#7C3AED] transition-colors" />
                         <span className="text-[10px] font-bold text-[#999] group-hover/btn:text-[#7C3AED] transition-colors">View</span>
                      </button>
                      <button className="flex flex-col items-center gap-1 group/btn">
                         <ShieldCheck size={20} className="text-[#999] group-hover/btn:text-[#7C3AED] transition-colors" />
                         <span className="text-[10px] font-bold text-[#999] group-hover/btn:text-[#7C3AED] transition-colors">Permissions</span>
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                          className="flex flex-col items-center gap-1 group/btn"
                        >
                           <MoreHorizontal size={20} className="text-[#999] group-hover/btn:text-[#7C3AED] transition-colors" />
                           <span className="text-[10px] font-bold text-[#999] group-hover/btn:text-[#7C3AED] transition-colors">More</span>
                        </button>

                        {activeMenu === user.id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl shadow-xl z-[100] overflow-hidden py-1">
                            <button 
                              onClick={() => { setSelectedUser(user); setShowDashboardModal(true); setActiveMenu(null); }}
                              className="w-full px-4 py-2 text-left text-[12px] font-bold text-[#666] hover:bg-[#F5F1F5] dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <LayoutDashboard size={14} /> Dashboard Settings
                            </button>
                            <button 
                              onClick={() => { setSelectedUser(user); setShowProfileModal(true); setActiveMenu(null); }}
                              className="w-full px-4 py-2 text-left text-[12px] font-bold text-[#666] hover:bg-[#F5F1F5] dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <Settings size={14} /> Profile Access
                            </button>
                            <button 
                              onClick={() => { setSelectedUser(user); setShowHistoryModal(true); setActiveMenu(null); }}
                              className="w-full px-4 py-2 text-left text-[12px] font-bold text-[#666] hover:bg-[#F5F1F5] dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <UserCheck size={14} /> Activity History
                            </button>
                            
                            {!user.isPermanent && (
                              <>
                                <div className="border-t border-[#F0EAF0] dark:border-slate-800 my-1"></div>
                                <button onClick={() => removeUser(user.id)} className="w-full px-4 py-2 text-left text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                  <X size={14} /> Deactivate Account
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-gray-500">No users found.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text" 
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Role</label>
                <select 
                  value={newUser.roleName}
                  onChange={(e) => setNewUser({...newUser, roleName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddUser}
                disabled={!newUser.fullName || !newUser.email || isSaving}
                className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {isSaving ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Dashboard Settings Modal */}
      {showDashboardModal && selectedUser && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDashboardModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
                   <LayoutDashboard size={20} className="text-[#7C3AED]" /> Dashboard Config
                </h3>
                <button onClick={() => setShowDashboardModal(false)} className="text-[#999] hover:text-[#1A1A1A]"><X size={20} /></button>
             </div>
             <p className="text-[12px] font-bold text-[#999] mb-4">CONFIGURE WIDGETS FOR <span className="text-[#7C3AED]">{selectedUser.fullName}</span></p>
             <div className="space-y-3">
                {['Sales Overview', 'Inventory Alerts', 'Recent Activities', 'Financial Summary'].map(widget => (
                   <div key={widget} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-[13px] font-bold text-[#1A1A1A] dark:text-white">{widget}</span>
                      <div className="w-10 h-5 bg-[#10B981] rounded-full relative">
                         <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                   </div>
                ))}
             </div>
             <button onClick={() => setShowDashboardModal(false)} className="w-full mt-6 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-200/50">Save Configuration</button>
          </div>
        </div>
      )}

      {/* Profile Access Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowProfileModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
             <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-[#006699] flex items-center justify-center text-white text-2xl font-black shadow-xl uppercase">
                   {selectedUser.fullName.substring(0, 2)}
                </div>
                <div>
                   <h3 className="text-xl font-black text-[#1A1A1A] dark:text-white">{selectedUser.fullName}</h3>
                   <p className="text-sm font-medium text-[#999]">{selectedUser.email}</p>
                </div>
                <div className="px-4 py-1.5 bg-[#F3E8FF] rounded-full text-[#7C3AED] text-[11px] font-black uppercase tracking-widest border border-[#E9D5FF]">
                   {selectedUser.role?.name || "N/A"}
                </div>
             </div>
             <div className="mt-8 space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-50 dark:border-slate-800">
                   <span className="text-[12px] font-bold text-[#999]">Status</span>
                   <span className="text-[12px] font-black text-[#10B981]">Active</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-50 dark:border-slate-800">
                   <span className="text-[12px] font-bold text-[#999]">Last Login</span>
                   <span className="text-[12px] font-black text-[#1A1A1A] dark:text-white">10 mins ago</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-50 dark:border-slate-800">
                   <span className="text-[12px] font-bold text-[#999]">Access Level</span>
                   <span className="text-[12px] font-black text-[#1A1A1A] dark:text-white">Full Admin Access</span>
                </div>
             </div>
             <button onClick={() => setShowProfileModal(false)} className="w-full mt-8 py-3 border-2 border-[#F0EAF0] dark:border-slate-800 text-[#1A1A1A] dark:text-white rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">Close Profile</button>
          </div>
        </div>
      )}

      {/* Activity History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
                   <UserCheck size={20} className="text-[#7C3AED]" /> Recent Activity
                </h3>
                <button onClick={() => setShowHistoryModal(false)} className="text-[#999] hover:text-[#1A1A1A]"><X size={20} /></button>
             </div>
             <div className="space-y-6">
                {[
                   { action: 'Updated Inventory Stock', time: '2 mins ago', module: 'Inventory' },
                   { action: 'Generated Sales Report', time: '1 hour ago', module: 'Sales' },
                   { action: 'Modified Role Permissions', time: 'Yesterday', module: 'Admin' },
                ].map((act, i) => (
                   <div key={i} className="flex gap-4 relative">
                      <div className="w-2 h-2 rounded-full bg-[#7C3AED] mt-1.5 shrink-0 shadow-[0_0_8px_#7C3AED]"></div>
                      <div className="space-y-1">
                         <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">{act.action}</p>
                         <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#999]">{act.time}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span className="text-[11px] font-bold text-[#7C3AED]">{act.module}</span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
             <button onClick={() => setShowHistoryModal(false)} className="w-full mt-8 py-3 bg-gray-50 dark:bg-slate-800 text-[#1A1A1A] dark:text-white rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">View All Logs</button>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
