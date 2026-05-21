// Shared design system for all Sales pages — consistent ERP styling

export const S = {
  // ── Page layouts ─────────────────────────────────────────────────────────
  page:     "min-h-screen bg-[#F5F6FA] flex flex-col",
  formPage: "flex flex-col h-screen bg-[#F5F6FA] overflow-hidden",

  // ── Page header ──────────────────────────────────────────────────────────
  pageHeader:   "bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0",
  pageTitleWrap:"flex items-center gap-2",
  pageTitle:    "text-base font-semibold text-gray-800",
  pageSubtitle: "text-xs text-gray-400",

  // ── Filter bar ───────────────────────────────────────────────────────────
  filterBar:    "bg-white border-b border-gray-100 px-6 py-2 flex items-center gap-3 flex-wrap shrink-0",
  filterLabel:  "text-xs text-gray-400 font-medium shrink-0",
  filterBtn:    "flex items-center gap-1 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors cursor-pointer select-none",

  // ── Stats ────────────────────────────────────────────────────────────────
  statsBar:    "px-6 py-4 flex gap-3 flex-wrap",
  statCard:    "bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm min-w-[160px]",
  statLabel:   "text-[11px] text-gray-400 font-medium mb-0.5",
  statValue:   "text-xl font-bold text-gray-800",
  statMeta:    "text-[11px] text-gray-400 mt-0.5",

  // ── Content ──────────────────────────────────────────────────────────────
  contentWrap:  "flex-1 px-6 pb-6",
  tableCard:    "bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-1",
  th:           "px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100",
  tr:           "border-b border-gray-50 hover:bg-blue-50/20 transition-colors",
  td:           "px-4 py-3 text-sm text-gray-700",
  tdMuted:      "px-4 py-3 text-sm text-gray-400",

  // ── Buttons ───────────────────────────────────────────────────────────────
  btnPrimary:   "flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
  btnSecondary: "flex items-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors",
  btnGhost:     "flex items-center gap-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm px-3 py-2 rounded-lg transition-colors",
  btnSuccess:   "flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors",
  btnDanger:    "flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium px-4 py-2 rounded-lg transition-colors",
  btnIcon:      "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",

  // ── Badges ────────────────────────────────────────────────────────────────
  badgeBase: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
  badge: {
    DRAFT:     "bg-gray-100 text-gray-600 border-gray-200",
    SENT:      "bg-blue-50 text-blue-700 border-blue-200",
    ACCEPTED:  "bg-green-50 text-green-700 border-green-200",
    REJECTED:  "bg-red-50 text-red-600 border-red-200",
    CONVERTED: "bg-purple-50 text-purple-700 border-purple-200",
    EXPIRED:   "bg-amber-50 text-amber-700 border-amber-200",
    PAID:      "bg-green-50 text-green-700 border-green-200",
    PARTIAL:   "bg-amber-50 text-amber-700 border-amber-200",
    PENDING:   "bg-yellow-50 text-yellow-700 border-yellow-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    DISPATCHED:"bg-indigo-50 text-indigo-700 border-indigo-200",
    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
    OPEN:      "bg-sky-50 text-sky-700 border-sky-200",
    SUCCESS:   "bg-green-50 text-green-700 border-green-200",
  } as Record<string, string>,

  // ── Form page ─────────────────────────────────────────────────────────────
  formHeader:    "bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0",
  formBody:      "flex-1 overflow-y-auto",
  formSection:   "bg-[#F5F6FA] px-6 py-3 flex flex-wrap items-start gap-4",
  formCard:      "bg-white border border-gray-200 rounded-xl p-5 shadow-sm",
  formActionBar: "bg-white border-t border-gray-200 px-6 py-2.5 flex items-center justify-end gap-2 shrink-0",

  // ── Form fields ───────────────────────────────────────────────────────────
  label:  "text-[11px] font-medium text-gray-500 mb-1 block",
  input:  "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white w-full transition-colors",
  select: "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 bg-white cursor-pointer w-full transition-colors",

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyWrap:  "flex-1 flex flex-col items-center justify-center py-24 text-center px-4",
  emptyTitle: "text-sm font-semibold text-gray-700 mt-4 mb-1",
  emptySub:   "text-xs text-gray-400 mb-5",

  // ── Customer dropdown ─────────────────────────────────────────────────────
  custDropWrap:  "relative",
  custDropBox:   "flex items-center gap-2 bg-white border rounded-lg px-3 py-2 cursor-pointer min-w-[220px] transition-colors",
  custDropPanel: "absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto",
  custDropItem:  "w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left transition-colors",

  // ── Items table ───────────────────────────────────────────────────────────
  itemsTable: "w-full text-sm border-collapse bg-white",
  itemsThRow: "bg-gray-50 border-y border-gray-200 text-[11px] font-semibold text-gray-500 uppercase",
  itemsTh:    "px-3 py-2.5 border-r border-gray-200",
  itemsRow:   "border-b border-gray-100 hover:bg-gray-50/50 group",
  itemsTd:    "border-r border-gray-100",
  itemsInput: "w-full text-sm text-gray-700 outline-none bg-transparent px-2 py-1.5",
  itemsFoot:  "border-t border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-500",
};

// ── Constants shared across all forms ────────────────────────────────────────

export const UNITS = [
  { label: "NONE",              code: "NONE" },
  { label: "BAGS (BAG)",        code: "BAG"  },
  { label: "BOTTLES (BTL)",     code: "BTL"  },
  { label: "BOX (BOX)",         code: "BOX"  },
  { label: "BUNDLES (BDL)",     code: "BDL"  },
  { label: "GRAMS (GRM)",       code: "GRM"  },
  { label: "KILOGRAMS (KGS)",   code: "KGS"  },
  { label: "LITERS (LTR)",      code: "LTR"  },
  { label: "METERS (MTR)",      code: "MTR"  },
  { label: "NUMBERS (NOS)",     code: "NOS"  },
  { label: "PACKS (PKT)",       code: "PKT"  },
  { label: "PIECES (PCS)",      code: "PCS"  },
  { label: "ROLLS",             code: "ROLL" },
  { label: "SQUARE FEET (SQF)", code: "SQF"  },
  { label: "TONS (TNE)",        code: "TNE"  },
  { label: "UNITS (UNT)",       code: "UNT"  },
];

export const TAX_OPTIONS = [
  { label: "None (0%)",  value: 0  },
  { label: "GST @ 5%",  value: 5  },
  { label: "GST @ 12%", value: 12 },
  { label: "GST @ 18%", value: 18 },
  { label: "GST @ 28%", value: 28 },
];

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
  "Jammu & Kashmir","Ladakh",
];

export const PERIOD_OPTIONS = [
  { label: "This Month",   value: "this_month"   },
  { label: "Last Month",   value: "last_month"   },
  { label: "This Quarter", value: "this_quarter" },
  { label: "This Year",    value: "this_year"    },
];

export function getPeriodDates(period: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (period === "last_month")   return { start: iso(new Date(y, m - 1, 1)), end: iso(new Date(y, m, 0)) };
  if (period === "this_quarter") { const q = Math.floor(m / 3); return { start: iso(new Date(y, q*3, 1)), end: iso(new Date(y, q*3+3, 0)) }; }
  if (period === "this_year")    return { start: iso(new Date(y, 0, 1)), end: iso(new Date(y, 11, 31)) };
  return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)) };
}

export function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

export function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// ── Line item helpers ─────────────────────────────────────────────────────────

export interface LineItem {
  id:          string;
  productId:   string;
  itemSearch:  string;
  qty:         number;
  unit:        string;
  rate:        number;
  discountPct: number;
  taxPct:      number;
}

export function makeItem(): LineItem {
  return { id: Math.random().toString(36).slice(2), productId:"", itemSearch:"", qty:1, unit:"NONE", rate:0, discountPct:0, taxPct:0 };
}

export function computeRow(item: LineItem, withTax = false) {
  const gross   = item.qty * item.rate;
  const discAmt = parseFloat((gross * item.discountPct / 100).toFixed(2));
  if (withTax) {
    const netAmt = gross - discAmt;
    const taxAmt = parseFloat((netAmt * item.taxPct / (100 + item.taxPct)).toFixed(2));
    return { discAmt, taxAmt, amount: parseFloat(netAmt.toFixed(2)) };
  }
  const taxable = gross - discAmt;
  const taxAmt  = parseFloat((taxable * item.taxPct / 100).toFixed(2));
  return { discAmt, taxAmt, amount: parseFloat((taxable + taxAmt).toFixed(2)) };
}

export function sumItems(items: LineItem[], withTax = false) {
  const rows    = items.map(i => computeRow(i, withTax));
  const totalQty    = items.reduce((s, i) => s + i.qty, 0);
  const totalDisc   = parseFloat(rows.reduce((s, r) => s + r.discAmt, 0).toFixed(2));
  const totalTax    = parseFloat(rows.reduce((s, r) => s + r.taxAmt, 0).toFixed(2));
  const totalAmount = parseFloat(rows.reduce((s, r) => s + r.amount, 0).toFixed(2));
  return { rows, totalQty, totalDisc, totalTax, totalAmount };
}
