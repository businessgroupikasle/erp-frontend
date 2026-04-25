"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { Plus, ChevronDown, Key, FileEdit, Copy, MoreHorizontal, X } from "lucide-react";

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState([
    { name: "Super Admin", description: "Can Do Everything", archived: "No" },
    { name: "Franchise", description: "Standard franchise access", archived: "No" },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [permissions, setPermissions] = useState<Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }>>({
    Inventory: { view: true, add: false, edit: false, delete: false },
    Sales: { view: true, add: true, edit: false, delete: false },
    HR: { view: false, add: false, edit: false, delete: false },
  });

  const handleTogglePermission = (module: string, action: 'view' | 'add' | 'edit' | 'delete') => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleAddRole = () => {
    if (!newRole.name) return;
    setRoles([...roles, { ...newRole, archived: "No" }]);
    setShowAddModal(false);
    setNewRole({ name: "", description: "" });
  };

  return (
    <SettingsLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              Roles & Permissions <span className="text-sm opacity-60">✨</span>
           </h2>
           <button 
             onClick={() => setShowAddModal(true)}
             className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-200/50"
           >
              <Plus size={16} /> Add New Role
           </button>
        </div>

        <p className="text-[11px] font-bold text-[#999]">Showing 1 to {roles.length} of {roles.length} Records</p>

        {/* Roles Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider">Role Name</th>
                <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider flex items-center gap-2">
                   Archived <ChevronDown size={12} className="opacity-40" />
                </th>
                <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.name} className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                     <div className="space-y-0.5">
                        <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">{role.name}</p>
                        {role.description && <p className="text-[11px] font-medium text-[#999]">{role.description}</p>}
                     </div>
                  </td>
                  <td className="p-4 text-[13px] font-medium text-[#666] dark:text-slate-400">{role.archived}</td>
                  <td className="p-4">
                     <div className="flex items-center justify-end gap-6 opacity-60 group-hover:opacity-100 transition-opacity pr-4">
                        <button 
                          onClick={() => { setSelectedRole(role.name); setShowPermissionsModal(true); }}
                          className="flex flex-col items-center gap-1 hover:text-[#7C3AED] transition-colors"
                        >
                           <Key size={18} strokeWidth={2.5} />
                           <span className="text-[9px] font-black uppercase">View Permissions</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:text-[#7C3AED] transition-colors">
                           <FileEdit size={18} strokeWidth={2.5} />
                           <span className="text-[9px] font-black uppercase">Update</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:text-[#7C3AED] transition-colors">
                           <Copy size={18} strokeWidth={2.5} />
                           <span className="text-[9px] font-black uppercase">Duplicate</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:text-[#7C3AED] transition-colors">
                           <MoreHorizontal size={18} strokeWidth={2.5} />
                           <span className="text-[9px] font-black uppercase">More</span>
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Add New Role</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Role Name</label>
                <input 
                  type="text" 
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                  placeholder="e.g. Sales Executive"
                />
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Description (Optional)</label>
                <textarea 
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium resize-none h-24"
                  placeholder="Briefly describe what this role can do..."
                />
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
                onClick={handleAddRole}
                disabled={!newRole.name}
                className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPermissionsModal(false)}>
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="text-lg font-black text-gray-900 dark:text-white">Role Permissions</h3>
                 <p className="text-[12px] font-medium text-[#999]">Manage access control for <span className="font-bold text-[#7C3AED]">{selectedRole}</span></p>
              </div>
              <button onClick={() => setShowPermissionsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                    <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider">Module</th>
                    <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider text-center">View</th>
                    <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider text-center">Add</th>
                    <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider text-center">Edit</th>
                    <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(permissions).map(([module, actions]) => (
                    <tr key={module} className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-[13px] font-black text-[#1A1A1A] dark:text-white">{module}</td>
                      {(['view', 'add', 'edit', 'delete'] as const).map(action => (
                        <td key={action} className="p-4 text-center">
                          <button 
                            onClick={() => handleTogglePermission(module, action)}
                            className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors ${actions[action] ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'}`}
                          >
                            {actions[action] && <span className="text-[14px]">✓</span>}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[#F0EAF0] dark:border-slate-800">
              <button 
                onClick={() => setShowPermissionsModal(false)}
                className="px-6 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => setShowPermissionsModal(false)}
                className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-purple-200/50"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
