"use client";

import { useState } from "react";
import {
  Workflow,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  ArrowRight,
  FileText,
  ShieldCheck,
  ChevronRight,
  IndianRupee,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Send,
  Building,
  User,
  Plus,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "react-hot-toast";

// ─── TYPES & DATA DEFINITIONS ──────────────────────────────────────────────────

type RoleType = "PURCHASE_MANAGER" | "FACTORY_MANAGER" | "QC_AUDITOR" | "ACCOUNTS_REVIEWER" | "SUPER_ADMIN";

const ROLE_DETAILS: Record<RoleType, { label: string; desc: string; color: string }> = {
  PURCHASE_MANAGER: { label: "Purchase Manager", desc: "Approves purchase requests & logs orders", color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200" },
  FACTORY_MANAGER: { label: "Factory Manager", desc: "Approves production plans & execution logs", color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200" },
  QC_AUDITOR: { label: "QC Auditor", desc: "Performs batch quality inspections & release", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200" },
  ACCOUNTS_REVIEWER: { label: "Accounts Reviewer", desc: "Verifies GRN, logs expense approvals & releases payments", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200" },
  SUPER_ADMIN: { label: "Super Admin (HQ)", desc: "Bypasses approvals & manages system permissions", color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200" },
};

// Workflow stage configurations
interface Stage {
  key: string;
  label: string;
  roleRequired: RoleType;
  desc: string;
}

const PURCHASE_STAGES: Stage[] = [
  { key: "REQUEST", label: "Purchase Request", roleRequired: "SUPER_ADMIN", desc: "Logged by procurement department" },
  { key: "MANAGER_APPROVE", label: "Manager Approval", roleRequired: "PURCHASE_MANAGER", desc: "Verify necessity and quantity limits" },
  { key: "ORDER", label: "Purchase Order", roleRequired: "PURCHASE_MANAGER", desc: "PO dispatched to vendor" },
  { key: "GRN", label: "GRN Receipt", roleRequired: "FACTORY_MANAGER", desc: "Received at warehouse and verified" },
  { key: "ACCOUNTS_VERIFY", label: "Accounts Review", roleRequired: "ACCOUNTS_REVIEWER", desc: "Verify invoice against GRN checklist" },
  { key: "PAYMENT", label: "Vendor Payment", roleRequired: "ACCOUNTS_REVIEWER", desc: "Funds released to vendor bank account" },
];

const PRODUCTION_STAGES: Stage[] = [
  { key: "PLAN", label: "Production Plan", roleRequired: "SUPER_ADMIN", desc: "Production target scheduled" },
  { key: "FACTORY_APPROVE", label: "Factory Approval", roleRequired: "FACTORY_MANAGER", desc: "Check raw material sufficiency" },
  { key: "EXECUTION", label: "Execution", roleRequired: "FACTORY_MANAGER", desc: "Manufacturing batch underway" },
  { key: "QC", label: "QC Verification", roleRequired: "QC_AUDITOR", desc: "Sample testing and validation" },
  { key: "FINISHED_ENTRY", label: "Finished Goods Entry", roleRequired: "SUPER_ADMIN", desc: "Items added to inventory" },
];

const EXPENSE_STAGES: Stage[] = [
  { key: "ENTRY", label: "Expense Entry", roleRequired: "SUPER_ADMIN", desc: "Operational invoice received" },
  { key: "DEPT_APPROVE", label: "Dept Approval", roleRequired: "FACTORY_MANAGER", desc: "Head of department validation" },
  { key: "ACCOUNTS_APPROVE", label: "Accounts Approval", roleRequired: "ACCOUNTS_REVIEWER", desc: "General ledger classification review" },
  { key: "PAYMENT_RELEASE", label: "Payment Release", roleRequired: "ACCOUNTS_REVIEWER", desc: "Disbursement completed" },
];

// Seed items
interface WorkflowItem {
  id: string;
  title: string;
  category: "PURCHASE" | "PRODUCTION" | "EXPENSE";
  amount?: number;
  currentStage: string; // key of stage
  initiatedBy: string;
  dateInitiated: string;
  details: Record<string, string>;
  history: { stage: string; timestamp: string; user: string; notes: string }[];
}

const INITIAL_ITEMS: WorkflowItem[] = [
  {
    id: "WF-PUR-101",
    title: "Raw Sugar - 5 Tons Procurement",
    category: "PURCHASE",
    amount: 180000,
    currentStage: "MANAGER_APPROVE",
    initiatedBy: "Nikhil Sharma (Procurement Lead)",
    dateInitiated: "2026-06-24",
    details: {
      "Target Vendor": "Madhur Sugar Refineries Ltd",
      "Urgency": "High (Stock depletion in 8 days)",
      "Linked Recipe": "ChocoDelight Bars, Milk Chocolate slabs",
      "Warehouse Destination": "HQ Central Silo 2",
    },
    history: [
      { stage: "REQUEST", timestamp: "2026-06-24 10:15 AM", user: "Nikhil Sharma", notes: "Raw Sugar reorder level crossed. Requesting 5 metric tons." },
    ],
  },
  {
    id: "WF-PUR-102",
    title: "Organic Cocoa Butter - 500 KG",
    category: "PURCHASE",
    amount: 350000,
    currentStage: "ACCOUNTS_VERIFY",
    initiatedBy: "Rajesh Patil (Procurement Specialist)",
    dateInitiated: "2026-06-22",
    details: {
      "Target Vendor": "West African Cocoa Exporters",
      "GRN Ref": "GRN-2026-0492",
      "Warehouse Location": "Cold Storage Unit A",
      "Invoice Amount Match": "Verified: ₹3,50,000",
    },
    history: [
      { stage: "REQUEST", timestamp: "2026-06-22 09:00 AM", user: "Rajesh Patil", notes: "Premium cocoa butter restocking request." },
      { stage: "MANAGER_APPROVE", timestamp: "2026-06-22 02:30 PM", user: "Ananya Roy (Purchasing Mgr)", notes: "Price matches contract. Approved purchase order." },
      { stage: "ORDER", timestamp: "2026-06-23 11:00 AM", user: "Ananya Roy", notes: "PO-0994 dispatched to vendor." },
      { stage: "GRN", timestamp: "2026-06-24 04:00 PM", user: "Harish Gupta (WH Manager)", notes: "Goods arrived. Quality inspection cleared. Stored in cold unit." },
    ],
  },
  {
    id: "WF-PROD-201",
    title: "ChocoDelight Bar Batch #902",
    category: "PRODUCTION",
    currentStage: "FACTORY_APPROVE",
    initiatedBy: "Amit Deshmukh (Production Planner)",
    dateInitiated: "2026-06-25",
    details: {
      "Planned Quantity": "10,000 Bars (Yield target)",
      "Recipe Name": "ChocoDelight Standard Recipe v2",
      "Target Location": "Main Packaging Line 3",
      "Required Ingredients": "Sugar (250KG), Milk Solids (120KG), Cocoa (400KG)",
    },
    history: [
      { stage: "PLAN", timestamp: "2026-06-25 08:30 AM", user: "Amit Deshmukh", notes: "Created production plan based on sales demand forecasting." },
    ],
  },
  {
    id: "WF-PROD-202",
    title: "Milk Chocolate Slab Batch #894",
    category: "PRODUCTION",
    currentStage: "QC",
    initiatedBy: "Amit Deshmukh (Production Planner)",
    dateInitiated: "2026-06-23",
    details: {
      "Output Units": "4,200 Slabs",
      "Execution Date": "2026-06-24",
      "Actual Yield %": "98.5%",
      "Wastage Logs": "Scrap chocolate: 1.5% re-processed",
    },
    history: [
      { stage: "PLAN", timestamp: "2026-06-23 10:00 AM", user: "Amit Deshmukh", notes: "Weekly slab plan." },
      { stage: "FACTORY_APPROVE", timestamp: "2026-06-23 04:15 PM", user: "Vipul Shah (Factory Mgr)", notes: "All ingredients reserved. Line capacity confirmed." },
      { stage: "EXECUTION", timestamp: "2026-06-24 09:00 AM", user: "Rohan Patil (Floor Supervisor)", notes: "Batch manufacturing finished. Packed into boxes. Sent to QC bay." },
    ],
  },
  {
    id: "WF-EXP-301",
    title: "Boiler Maintenance & Spares Replacement",
    category: "EXPENSE",
    amount: 82000,
    currentStage: "DEPT_APPROVE",
    initiatedBy: "Vikram Sen (Maintenance Engineer)",
    dateInitiated: "2026-06-24",
    details: {
      "Expense Department": "Engineering & Utilities",
      "GL Category": "Repairs & Maintenance",
      "Description": "Replacement of steam valve actuators & boiler safety valve gasket calibration.",
    },
    history: [
      { stage: "ENTRY", timestamp: "2026-06-24 03:00 PM", user: "Vikram Sen", notes: "Safety audit recommended actuator swap immediately." },
    ],
  },
  {
    id: "WF-EXP-302",
    title: "July Production Floor Electricity Bill",
    category: "EXPENSE",
    amount: 145000,
    currentStage: "ACCOUNTS_APPROVE",
    initiatedBy: "Priya Nair (Admin Exec)",
    dateInitiated: "2026-06-20",
    details: {
      "Expense Department": "Operations",
      "GL Category": "Power & Fuel",
      "Billing Cycle": "May 15 - June 15",
    },
    history: [
      { stage: "ENTRY", timestamp: "2026-06-20 11:00 AM", user: "Priya Nair", notes: "State electricity utility bill received." },
      { stage: "DEPT_APPROVE", timestamp: "2026-06-21 02:00 PM", user: "Vipul Shah (Factory Mgr)", notes: "Bill verified against plant meter logs." },
    ],
  },
];

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"PURCHASE" | "PRODUCTION" | "EXPENSE">("PURCHASE");
  const [userRole, setUserRole] = useState<RoleType>("SUPER_ADMIN");
  const [items, setItems] = useState<WorkflowItem[]>(INITIAL_ITEMS);
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);

  // Filter items by category
  const filteredItems = items.filter((x) => x.category === activeTab);

  // Helper to retrieve stage configuration
  const getStagesForCategory = (cat: "PURCHASE" | "PRODUCTION" | "EXPENSE"): Stage[] => {
    if (cat === "PURCHASE") return PURCHASE_STAGES;
    if (cat === "PRODUCTION") return PRODUCTION_STAGES;
    return EXPENSE_STAGES;
  };

  const getStageIndex = (stages: Stage[], stageKey: string) => {
    return stages.findIndex((s) => s.key === stageKey);
  };

  // Check if current user role is authorized to approve this stage
  const isAuthorizedToApprove = (item: WorkflowItem) => {
    if (userRole === "SUPER_ADMIN") return true;
    const stages = getStagesForCategory(item.category);
    const curIdx = getStageIndex(stages, item.currentStage);
    if (curIdx === -1) return false;
    const requiredRole = stages[curIdx].roleRequired;
    return userRole === requiredRole;
  };

  // Perform workflow advancement
  const handleApprove = (itemId: string, notes: string = "") => {
    const item = items.find((x) => x.id === itemId);
    if (!item) return;

    if (!isAuthorizedToApprove(item)) {
      toast.error(`Unauthorized! This stage requires '${ROLE_DETAILS[getStagesForCategory(item.category).find(s => s.key === item.currentStage)?.roleRequired || "SUPER_ADMIN"].label}' authorization.`);
      return;
    }

    const stages = getStagesForCategory(item.category);
    const curIdx = getStageIndex(stages, item.currentStage);

    if (curIdx === -1 || curIdx === stages.length - 1) {
      toast.error("Workflow is already at the final stage.");
      return;
    }

    const nextStage = stages[curIdx + 1];
    const updatedItems = items.map((x) => {
      if (x.id === itemId) {
        const timestamp = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " Today";
        return {
          ...x,
          currentStage: nextStage.key,
          history: [
            ...x.history,
            {
              stage: x.currentStage,
              timestamp,
              user: `${ROLE_DETAILS[userRole].label} (Simulated)`,
              notes: notes || `Advanced workflow to ${nextStage.label}.`,
            },
          ],
        };
      }
      return x;
    });

    setItems(updatedItems);
    
    // Update selected item reference in drawer
    const nextItemRef = updatedItems.find((x) => x.id === itemId);
    if (nextItemRef) setSelectedItem(nextItemRef);

    toast.success(`Success! Advanced '${item.title}' to stage: ${nextStage.label}.`);
  };

  // Reset demo state
  const handleReset = () => {
    setItems(INITIAL_ITEMS);
    setSelectedItem(null);
    toast.success("Workflow demo state reset.");
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white p-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Workflow size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Approval Workflow System</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Control operational accountability & sign-off gates</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all text-slate-600 dark:text-slate-300"
          >
            <RefreshCw size={14} /> Reset State
          </button>
        </div>
      </div>

      {/* Role Simulator Selector Block */}
      <div className="bg-white dark:bg-card/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <ShieldCheck className="text-indigo-500" size={18} />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Security Role Simulator</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Select a mock department role to test permission enforcement. The workflow blocks advance only when the corresponding auditor reviews the items.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(Object.keys(ROLE_DETAILS) as RoleType[]).map((r) => {
            const active = userRole === r;
            return (
              <button
                key={r}
                onClick={() => setUserRole(r)}
                className={clsx(
                  "p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between",
                  active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/10"
                    : "bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <User size={14} className={clsx(active ? "text-white" : "text-indigo-500")} />
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider">{ROLE_DETAILS[r].label}</p>
                  <p className="text-[8px] opacity-70 mt-0.5 line-clamp-1">{ROLE_DETAILS[r].desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workflow Switch Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-px">
        {[
          { key: "PURCHASE", label: "Purchase Approvals", desc: "Procurement & vendor chain" },
          { key: "PRODUCTION", label: "Production Approvals", desc: "Formulation to finished goods" },
          { key: "EXPENSE", label: "Expense Approvals", desc: "Operational spending releases" },
        ].map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={clsx(
                "pb-3.5 px-4 text-left border-b-2 font-black text-xs uppercase tracking-wider transition-all",
                active
                  ? "border-indigo-500 text-indigo-500 dark:text-white"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <span>{tab.label}</span>
              <span className="block text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 capitalize tracking-normal">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Workflow Steps Panel */}
      <div className="bg-slate-50 dark:bg-white/[0.01] rounded-3xl p-6 border border-slate-100 dark:border-white/5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pipeline Steps Flow</h3>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {getStagesForCategory(activeTab).map((s, idx, arr) => {
            const isLast = idx === arr.length - 1;
            return (
              <div key={s.key} className="flex-1 flex items-center gap-3 min-w-[160px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200">{s.label}</p>
                    <p className="text-[8px] text-slate-400 uppercase tracking-wide font-black mt-0.5">Role: {ROLE_DETAILS[s.roleRequired]?.label || "Any Role"}</p>
                  </div>
                </div>
                {!isLast && <ChevronRight size={14} className="text-slate-300 dark:text-white/10 hidden md:block" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid of Work items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Active Request Queue ({filteredItems.length})
            </h3>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white dark:bg-card/40 border border-slate-100 dark:border-white/5 rounded-3xl p-12 text-center text-slate-400">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold uppercase tracking-wide">All cleared!</p>
              <p className="text-xs text-slate-400 mt-1">No pending workflow requests in this pipeline.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const stages = getStagesForCategory(item.category);
                const curIdx = getStageIndex(stages, item.currentStage);
                const progressPct = ((curIdx) / (stages.length - 1)) * 100;
                const nextAuthorized = isAuthorizedToApprove(item);
                const isFinished = curIdx === stages.length - 1;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={clsx(
                      "bg-white dark:bg-card/40 border rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden group",
                      selectedItem?.id === item.id ? "border-indigo-500 ring-2 ring-indigo-500/10" : "border-slate-100 dark:border-white/5"
                    )}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[9px] font-black font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded">
                          {item.id}
                        </span>
                        {item.amount != null && (
                          <span className="text-xs font-black text-slate-800 dark:text-emerald-400 flex items-center">
                            <IndianRupee size={11} /> {item.amount.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors uppercase leading-tight line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Initiated by {item.initiatedBy}</p>
                    </div>

                    <div className="space-y-3">
                      {/* Current Stage Badge */}
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">CURRENT GATE:</span>
                        <span className={clsx(
                          "px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider text-[9px]",
                          isFinished 
                            ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                            : "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        )}>
                          {stages[curIdx]?.label}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              "h-full rounded-full transition-all duration-500",
                              isFinished ? "bg-emerald-500" : "bg-indigo-500"
                            )}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <span>{stages[0].label}</span>
                          <span>{stages[stages.length - 1].label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar size={10} /> {item.dateInitiated}
                      </span>

                      {!isFinished ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(item.id);
                          }}
                          className={clsx(
                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all",
                            nextAuthorized
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                              : "bg-slate-100 text-slate-400 dark:bg-white/5 cursor-not-allowed"
                          )}
                          title={nextAuthorized ? "Click to approve" : `Requires ${ROLE_DETAILS[stages[curIdx].roleRequired]?.label}`}
                        >
                          Approve <ArrowRight size={10} />
                        </button>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Signed Off
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Item Detail Panel Drawer */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-card/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm sticky top-6">
            {selectedItem ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black font-mono bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2.5 py-1 rounded">
                      {selectedItem.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedItem.category} FLOW</span>
                  </div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white uppercase leading-snug">
                    {selectedItem.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-bold">Initiated on {selectedItem.dateInitiated} by {selectedItem.initiatedBy}</p>
                </div>

                <div className="h-[1px] bg-slate-100 dark:bg-white/5" />

                {/* Metadata Fields */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Metadata Parameters</h4>
                  <div className="space-y-1.5">
                    {Object.entries(selectedItem.details).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-white/[0.01] rounded-xl border border-slate-100 dark:border-white/5">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">{key}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-black">{val}</span>
                      </div>
                    ))}
                    {selectedItem.amount != null && (
                      <div className="flex justify-between items-center text-xs p-2 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                        <span className="text-emerald-500 font-bold uppercase text-[9px]">Total Value</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center"><IndianRupee size={12} /> {selectedItem.amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit History Log */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Approval Audit Log</h4>
                  <div className="relative border-l border-slate-200 dark:border-white/10 ml-2.5 space-y-4">
                    {selectedItem.history.map((hist, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                            {getStagesForCategory(selectedItem.category).find(s => s.key === hist.stage)?.label || hist.stage}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">{hist.timestamp} · by {hist.user}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">"{hist.notes}"</p>
                        </div>
                      </div>
                    ))}

                    {/* Pending next action marker */}
                    {getStageIndex(getStagesForCategory(selectedItem.category), selectedItem.currentStage) < getStagesForCategory(selectedItem.category).length - 1 && (
                      <div className="relative pl-6">
                        <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 animate-pulse" />
                        <div>
                          <p className="text-xs font-black text-amber-500 uppercase tracking-tight">
                            Pending: {getStagesForCategory(selectedItem.category).find(s => s.key === selectedItem.currentStage)?.label}
                          </p>
                          <p className="text-[9px] text-slate-400 font-black uppercase mt-0.5 tracking-wider">
                            Required Role: {ROLE_DETAILS[getStagesForCategory(selectedItem.category).find(s => s.key === selectedItem.currentStage)?.roleRequired || "SUPER_ADMIN"].label}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Advance Area */}
                {getStageIndex(getStagesForCategory(selectedItem.category), selectedItem.currentStage) < getStagesForCategory(selectedItem.category).length - 1 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                    {isAuthorizedToApprove(selectedItem) ? (
                      <div className="space-y-3">
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-2 rounded-xl">
                          <ShieldCheck size={12} /> You are authorized to approve this gate.
                        </p>
                        <button
                          onClick={() => handleApprove(selectedItem.id, `Approved by ${ROLE_DETAILS[userRole].label}.`)}
                          className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                          Sign & Release To Next Gate <ArrowRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl space-y-2">
                        <div className="flex gap-2 text-slate-400">
                          <Info size={16} className="shrink-0 text-amber-500" />
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal">
                            Your active role ({ROLE_DETAILS[userRole].label}) does not match the required gatekeepers role ({ROLE_DETAILS[getStagesForCategory(selectedItem.category).find(s => s.key === selectedItem.currentStage)?.roleRequired || "SUPER_ADMIN"].label}). Switch roles above to proceed.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Info size={36} className="text-slate-300 dark:text-white/10 mx-auto mb-3" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">No Request Selected</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">Click on any request card from the queue to view its metadata parameters and complete audit timeline.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
