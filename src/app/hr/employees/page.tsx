"use client";

import { useState, useEffect } from "react";
import { Plus, Search, User, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Employee {
  id: string;
  employeeCode: string;
  department?: string;
  designation?: string;
  dateOfJoining: string;
  user: { fullName: string; email: string; phone?: string };
  salaryStructure?: { name: string };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    userId: "", department: "", designation: "", dateOfJoining: "",
    gender: "", address: "", bankAccount: "", ifscCode: "", panNumber: "", pfNumber: "", esiNumber: ""
  });

  async function loadData() {
    setLoading(true);
    try {
      const [empRes, userRes] = await Promise.all([
        api.get("/api/employees", { params: { search, department } }),
        api.get("/api/users")
      ]);
      setEmployees(empRes.data);
      setUsers(userRes.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [search, department]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/employees", form);
      setShowForm(false);
      setForm({ userId: "", department: "", designation: "", dateOfJoining: "", gender: "", address: "", bankAccount: "", ifscCode: "", panNumber: "", pfNumber: "", esiNumber: "" });
      loadData();
    } catch {}
  }

  const departments = Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employee master data</p>
        </div>
        <div className="flex gap-2">
          <Link href="/hr/leaves" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Leave Requests</Link>
          <Link href="/hr/shifts" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Shifts</Link>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{employees.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Employees</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
          <div className="text-xs text-gray-500 mt-1">Departments</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{employees.filter(e => e.salaryStructure).length}</div>
          <div className="text-xs text-gray-500 mt-1">With Salary Structure</div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d!}>{d}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-gray-400">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-400">No employees found</div>
        ) : employees.map((emp) => (
          <Link key={emp.id} href={`/hr/employees/${emp.id}`} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{emp.user.fullName}</div>
                <div className="text-xs text-gray-500">{emp.employeeCode}</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Building2 className="w-3 h-3" />
                  {emp.department || "—"} • {emp.designation || "—"}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  Joined {new Date(emp.dateOfJoining).toLocaleDateString()}
                </div>
              </div>
            </div>
            {emp.salaryStructure && (
              <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                Salary: {emp.salaryStructure.name}
              </div>
            )}
          </Link>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl my-4">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Add Employee</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Account *</label>
                <select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select user...</option>
                  {users.map((u: any) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining *</label>
                  <input required type="date" value={form.dateOfJoining} onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PF Number</label>
                  <input value={form.pfNumber} onChange={(e) => setForm({ ...form, pfNumber: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ESI Number</label>
                  <input value={form.esiNumber} onChange={(e) => setForm({ ...form, esiNumber: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                  <input value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add Employee</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
