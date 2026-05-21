const fs = require('fs');
const file = 'src/app/sales/proforma-invoice/page.tsx';
let c = fs.readFileSync(file, 'utf-8');

// 1. imports
c = c.replace('FilePlus2, Plus, RefreshCw, ChevronDown, X, Calendar,', 'FilePlus2, Plus, RefreshCw, ChevronDown, X, Calendar,\n  Search, ArrowLeft, ArrowRight,');

// 2. Add MiniCalendar & Constants
const miniCalSrc = fs.readFileSync('src/app/sales/estimation/page.tsx', 'utf-8');
const mcStart = miniCalSrc.indexOf('const MONTH_NAMES');
const mcEnd = miniCalSrc.indexOf('// ── Main', mcStart);
const miniCalendarCode = miniCalSrc.substring(mcStart, mcEnd).trim();

const insertPoint = '// ── Main ──────────────────────────────────────────────────────────────────────';
c = c.replace(insertPoint, miniCalendarCode + '\n\n' + insertPoint);

// 3. Add state
const stateInsert = `  // filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState(getPeriodDates("this_month").start);
  const [dateTo, setDateTo] = useState(getPeriodDates("this_month").end);
  const [showFromCal, setShowFromCal] = useState(false);
  const [showToCal, setShowToCal] = useState(false);
  const fromCalRef = useRef<HTMLDivElement>(null);
  const toCalRef = useRef<HTMLDivElement>(null);
`;
c = c.replace('  // list state', stateInsert + '\n  // list state');

// 4. Update fetchData dependency and click outside
c = c.replace('if (priceDropRef.current && !priceDropRef.current.contains(e.target as Node)) setShowPriceDrop(false);', `if (priceDropRef.current && !priceDropRef.current.contains(e.target as Node)) setShowPriceDrop(false);
      if (fromCalRef.current && !fromCalRef.current.contains(e.target as Node)) setShowFromCal(false);
      if (toCalRef.current && !toCalRef.current.contains(e.target as Node)) setShowToCal(false);`);

// 5. Add handleDeleteDraft
const handleDeleteDraft = `
  const handleDeleteDraft = (id: string) => {
    try {
      const draftsStr = localStorage.getItem("sale_proforma_invoices_drafts");
      if (draftsStr) {
        const drafts = JSON.parse(draftsStr);
        const newDrafts = drafts.filter((d: any) => d.id !== id);
        localStorage.setItem("sale_proforma_invoices_drafts", JSON.stringify(newDrafts));
        showToast("Draft deleted", "success");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };
`;
c = c.replace('  const loadDraft = (draft: any) => {', handleDeleteDraft + '\n  const loadDraft = (draft: any) => {');

// 6. Update filtered
const filteredInsert = `
  const filtered = proformas.filter((p: any) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "DRAFT" && p.status !== "DRAFT") return false;
      if (statusFilter === "CONVERTED" && p.status !== "CONVERTED") return false;
      if (statusFilter === "SENT" && p.status !== "SENT") return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const entityName = (p.customer?.name || "").toLowerCase();
      const num = (p.quotationNumber || "").toLowerCase();
      if (!entityName.includes(q) && !num.includes(q)) return false;
    }
    
    // date filter
    const d = new Date(p.quotationDate || p.createdAt || "2000-01-01");
    const dFrom = new Date(dateFrom);
    const dTo = new Date(dateTo);
    dTo.setHours(23, 59, 59, 999);
    if (d < dFrom || d > dTo) return false;
    
    return true;
  });
`;
c = c.replace('  const totalConverted = proformas.filter', filteredInsert + '\n  const totalConverted = filtered.filter');
c = c.replace('proformas.filter((p: any) => p.status !== "CONVERTED")', 'filtered.filter((p: any) => p.status !== "CONVERTED")');
c = c.replace('proformas.reduce((s: number, p: any)', 'filtered.reduce((s: number, p: any)');

// 7. Replace LIST VIEW completely
const listViewIndex = c.indexOf('  // ── LIST VIEW ──────────────────────────────────────────────────────────────');
if (listViewIndex !== -1) {
  const replacement = `  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <FilePlus2 className="h-5 w-5 text-[#f58220]" />
          Proforma Invoices
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#f58220] hover:bg-[#e8740e] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> New Proforma
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-5 space-y-5">

        {/* ── Summary Strip ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Quotations", value: \`₹\${grandTotal.toLocaleString("en-IN")}\`, color: "text-gray-700", dot: "bg-gray-400" },
            { label: "Converted",        value: \`₹\${totalConverted.toLocaleString("en-IN")}\`,  color: "text-emerald-600", dot: "bg-emerald-500" },
            { label: "Open",             value: \`₹\${totalOpen.toLocaleString("en-IN")}\`,       color: "text-[#f58220]",   dot: "bg-[#f58220]" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
              <div className={clsx("w-2.5 h-2.5 rounded-full", s.dot)} />
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={clsx("text-lg font-bold", s.color)}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters Row ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search proforma or customer..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#f58220] bg-white"
            />
          </div>

          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            {["ALL", "SENT", "CONVERTED", "DRAFT"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  "px-3 py-2 text-xs font-medium transition-colors",
                  statusFilter === s ? "bg-[#f58220] text-white" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {s === "ALL" ? "All" : s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-700 relative">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900" onClick={() => setShowFromCal(v => !v)}>
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{fmt(dateFrom)}</span>
            </div>
            {showFromCal && (
              <div className="absolute top-full left-0 mt-1 z-50" ref={fromCalRef}>
                <MiniCalendar value={dateFrom} onChange={setDateFrom} onClose={() => setShowFromCal(false)} />
              </div>
            )}
            <span className="text-gray-300 px-1">to</span>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900" onClick={() => setShowToCal(v => !v)}>
              <span className="font-medium">{fmt(dateTo)}</span>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            {showToCal && (
              <div className="absolute top-full right-0 mt-1 z-50" ref={toCalRef}>
                <MiniCalendar value={dateTo} onChange={setDateTo} onClose={() => setShowToCal(false)} />
              </div>
            )}
          </div>

          <div className="flex-1" />
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>

        {/* ── Empty State ── */}
        {loading ? (
          <div className="py-20 flex justify-center"><RefreshCw className="h-8 w-8 animate-spin text-orange-400 opacity-50" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
              <FilePlus2 className="h-8 w-8 text-[#f58220]" />
            </div>
            <div>
              <p className="text-gray-800 font-semibold">No Proformas Found</p>
              <p className="text-gray-500 text-sm mt-1">Create a proforma invoice to share with your customers.</p>
            </div>
            <button
              onClick={openCreate}
              className="px-5 py-2.5 bg-[#f58220] hover:bg-[#e8740e] text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Create Proforma
            </button>
          </div>
        ) : (
          /* ── Table ── */
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-200 uppercase">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Proforma No.</th>
                  <th className="text-left px-4 py-3">Party Name</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p: any) => {
                  const isDraft = p.status === "DRAFT";
                  const isConverted = p.status === "CONVERTED";
                  return (
                    <tr 
                      key={p.id} 
                      className={clsx(
                        "transition-colors",
                        isDraft ? "hover:bg-orange-50/50 cursor-pointer bg-orange-50/30" : "hover:bg-gray-50"
                      )}
                      onClick={() => {
                        if (isDraft) loadDraft(p);
                      }}
                    >
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {p.quotationDate ? new Date(p.quotationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800 text-xs">
                        {p.quotationNumber || p.id?.substring(0, 8).toUpperCase() || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium text-gray-800">
                          {p.customer?.name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        ₹ {(p.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx("inline-block px-2 py-0.5 rounded text-[11px] font-semibold border uppercase",
                          isConverted ? "bg-green-100 text-green-700 border-green-200" :
                          isDraft ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-orange-100 text-[#f58220] border-orange-200"
                        )}>
                          {isConverted ? "Converted" : isDraft ? "Draft" : "Open"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isDraft ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteDraft(p.id); }}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Draft"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                title="Print"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                title="Share"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
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
    </div>
  );
}
`;
  c = c.substring(0, listViewIndex) + replacement;
  fs.writeFileSync(file, c);
  console.log('Proforma list patched successfully.');
} else {
  console.log('List view index not found.');
}
