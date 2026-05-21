const fs = require('fs');

function patch(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Patched:', filePath);
  } else {
    console.log('Nothing to patch in:', filePath);
  }
}

// ── 1. Fix height calc on ALL create views (56px -> 104px) ───────────────────
// Payment-In
patch('src/app/sales/payment-in/page.tsx', [
  [
    `<div className="flex flex-col bg-gray-50 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>`,
    `<div className="flex flex-col bg-[#f1f5f9] overflow-hidden text-slate-800" style={{ height: 'calc(100vh - 104px)' }}>`
  ],
  // Top bar
  [
    `<div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-4 shrink-0">
          <span className="text-base font-semibold text-gray-800">Payment-In</span>
        </div>`,
    `<div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800">Payment-In</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Receipt No: <strong className="text-[#f58220] font-bold">Auto</strong></span>
        </div>`
  ],
  // Body wrapper
  [
    `<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">`,
    `<div className="flex-1 overflow-y-auto p-6 space-y-6">`
  ],
  // Party+date row wrapper
  [
    `<div className="flex flex-wrap gap-4 items-start">`,
    `<div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex flex-wrap gap-4 items-start">`
  ],
  // Payment details card
  [
    `<div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">`,
    `<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">`
  ],
  // Total display card
  [
    `<div className="bg-orange-50 border border-orange-200 rounded-lg px-5 py-3 flex items-center justify-between">`,
    `<div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex items-center justify-between">`
  ],
  // Amount label color
  [
    `<span className="text-sm font-semibold text-blue-700">Amount to be Received</span>`,
    `<span className="text-sm font-semibold text-slate-600">Amount to be Received</span>`
  ],
  [
    `<span className="text-lg font-bold text-blue-800">`,
    `<span className="text-lg font-bold text-[#f58220]">`
  ],
  // Save bar
  [
    `<div className="bg-white border-t border-gray-200 px-6 py-2.5 flex items-center justify-end gap-3 shrink-0">`,
    `<div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-end gap-3 shrink-0 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">`
  ],
  // Calendar icon color
  [
    `<Calendar size={13} className="text-blue-500 shrink-0" />`,
    `<Calendar size={13} className="text-[#f58220] shrink-0" />`
  ],
  // Party dropdown border on focus
  [
    `showCustomerDrop ? "border-blue-500" : "border-gray-300"`,
    `showCustomerDrop ? "border-[#f58220]" : "border-slate-300"`
  ],
  // Amount focus color
  [
    `focus-within:border-blue-500`,
    `focus-within:border-[#f58220]`
  ],
  [
    `focus:border-blue-500`,
    `focus:border-[#f58220]`
  ],
]);

// ── 2. Fix Proforma Invoice height ────────────────────────────────────────────
patch('src/app/sales/proforma-invoice/page.tsx', [
  [
    `<div className="flex flex-col bg-gray-50 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>`,
    `<div className="flex flex-col bg-[#f1f5f9] overflow-hidden text-slate-800" style={{ height: 'calc(100vh - 104px)' }}>`
  ],
  // Top bar
  [
    `<div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 shrink-0">
          <span className="text-base font-semibold text-gray-800">Proforma Invoice</span>
        </div>`,
    `<div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800">Proforma Invoice</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Proforma No: <strong className="text-[#f58220] font-bold">Auto</strong></span>
        </div>`
  ],
  // Body wrapper
  [
    `<div className="flex-1 overflow-y-auto">`,
    `<div className="flex-1 overflow-y-auto p-6 space-y-6">`
  ],
  // Customer row wrapper
  [
    `<div className="bg-gray-50 px-6 py-4 flex flex-wrap items-start gap-4">`,
    `<div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex flex-wrap items-start gap-4">`
  ],
]);

// ── 3. Fix Estimation height + colors + add phone number ──────────────────────
patch('src/app/sales/estimation/page.tsx', [
  [
    `<div className="flex flex-col bg-gray-50 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>`,
    `<div className="flex flex-col bg-[#f1f5f9] overflow-hidden text-slate-800" style={{ height: 'calc(100vh - 104px)' }}>`
  ],
  // Top bar
  [
    `<div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <span className="text-base font-semibold text-gray-800">Estimate/Quotation</span>
          </div>
        </div>`,
    `<div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">Estimate / Quotation</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Ref No: <strong className="text-[#f58220] font-bold">Auto</strong></span>
        </div>`
  ],
  // Body wrapper
  [
    `<div className="flex-1 overflow-y-auto min-h-0 pb-16">`,
    `<div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">`
  ],
  // Customer + meta row wrapper
  [
    `<div className="bg-gray-50 px-6 py-4 flex flex-wrap items-start justify-between gap-4">`,
    `<div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex flex-wrap items-start justify-between gap-4">`
  ],
  // Border on customer dropdown focus
  [
    `showCustomerDrop ? "border-blue-500" : "border-gray-300"`,
    `showCustomerDrop ? "border-[#f58220]" : "border-slate-300"`
  ],
]);

// ── 4. Fix Sales Orders height + icon color ───────────────────────────────────
patch('src/app/sales/orders/page.tsx', [
  [
    `style={{ height: "calc(100vh - 56px)" }}`,
    `style={{ height: "calc(100vh - 104px)" }}`
  ],
  // Icon color in create view header (ClipboardList blue -> orange)
  [
    `<ClipboardList className="h-5 w-5 text-blue-600" />`,
    `<ClipboardList className="h-5 w-5 text-[#f58220]" />`
  ],
  // Save button color (blue -> orange)
  [
    `className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-r-xl shadow-lg shadow-blue-100 transition-all disabled:opacity-50"`,
    `className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-[#f58220] hover:bg-[#e8740e] text-white rounded-r-xl shadow-lg shadow-orange-100 transition-all disabled:opacity-50"`
  ],
  // Share button color (blue -> orange)
  [
    `className="px-4 py-2.5 text-sm font-bold border border-blue-200 hover:bg-orange-50 rounded-l-xl text-blue-600 transition-colors shadow-sm"`,
    `className="px-4 py-2.5 text-sm font-bold border border-orange-200 hover:bg-orange-50 rounded-l-xl text-[#f58220] transition-colors shadow-sm"`
  ],
  // Order No in header (blue -> orange)
  [
    `<strong className="text-blue-600 font-bold">{orderNo}</strong>`,
    `<strong className="text-[#f58220] font-bold">{orderNo}</strong>`
  ],
]);

// ── 5. Fix Returns height ─────────────────────────────────────────────────────
patch('src/app/sales/returns/page.tsx', [
  [
    `style={{ height: "calc(100vh - 56px)" }}`,
    `style={{ height: "calc(100vh - 104px)" }}`
  ],
]);

console.log('\nAll done!');
