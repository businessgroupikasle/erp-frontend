import fs from 'fs';

const filePath = 'src/app/production/batches/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Rewrite the Packing Queue tab entirely
const packingQueueReplacement = `
        <div className="space-y-4 md:space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 md:py-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Packing <span className="text-slate-400 font-medium ml-1 tracking-tighter italic">Queue</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium uppercase tracking-widest text-[7px] md:text-[9px]">
                Pending Packing • Packing • Packed • Bulk Storage • Dispatched
              </p>
            </div>
          </header>

          <div className="bg-white dark:bg-card/40 backdrop-blur-md rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-lg mb-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Batches Ready for Packing</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    {["Batch", "Product", "Available Bulk", "Packed", "Status", "Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/[0.03]">
                  {batches.filter(b => b.qcStatus === 'APPROVED' && b.packagingStatus !== 'PACKAGED').map((batch: any, i: number) => {
                    const availableBulk = Math.max(0, batch.quantity - (batch.packagedQty || 0));
                    return (
                      <tr key={batch.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-mono">
                          {batch.batchCode ? formatERPNumber("PRD", batch.batchCode, batch.createdAt) : "—"}
                        </td>
                        <td className="px-4 py-3 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">
                          {batch.product?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[11px] font-bold text-slate-900 tabular-nums">
                          {availableBulk} <span className="text-[9px] text-slate-400">{batch.product?.unit || 'KG'}</span>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-bold text-slate-900 tabular-nums">
                          {batch.packagedQty || 0} <span className="text-[9px] text-slate-400">{batch.product?.unit || 'KG'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx("px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider", 
                            batch.packagingStatus === 'PARTIALLY_PACKED' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {batch.packagingStatus === 'PARTIALLY_PACKED' ? "Partially Packed" : "Ready for Packing"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setPackBatch(batch); setShowPackModal(true); }}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm"
                          >
                            Pack
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {batches.filter(b => b.qcStatus === 'APPROVED' && b.packagingStatus !== 'PACKAGED').length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        No pending batches for packing
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-card/40 backdrop-blur-md rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Generated Packing Lots</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                    {["Lot Number / Batch", "Product", "Packet Size", "Packets", "Total Weight", "Created"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/[0.03]">
                  {packagings.map((pkg: any) => (
                    <tr key={pkg.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-mono">
                        {pkg.barcode}
                        <br/><span className="text-[8px] text-slate-400">Batch: {formatERPNumber("PRD", pkg.batch?.batchCode, pkg.batch?.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        {pkg.batch?.product?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-900 tabular-nums">
                        {pkg.packetSize}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-900 tabular-nums">
                        {pkg.quantityPackets}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-900 tabular-nums">
                        {pkg.totalWeight} <span className="text-[9px] text-slate-400">KG</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-500 tabular-nums">
                        {new Date(pkg.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {packagings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        No Packing Lots Generated Yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>`;

content = content.replace(
  /<div className="space-y-4 md:space-y-8">\s*<header className="flex flex-col md:flex-row[\s\S]*?<\/table>\s*<\/div>\s*<\/div>\s*<\/div>/,
  packingQueueReplacement
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Updated Packing Queue tab");
