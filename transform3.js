import fs from 'fs';

const filePath = 'src/app/production/batches/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Pack Modal replacement
const packModalReplacement = `
      {/* Packing Modal */}
      {showPackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Pack Batch</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{packBatch?.product?.name} ({packBatch?.batchCode ? formatERPNumber("PRD", packBatch.batchCode) : "—"})</p>
              </div>
              <button onClick={() => setShowPackModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Packet Size / Type</label>
                <div className="flex gap-2 mb-3">
                  {["500 g", "1 Kg", "5 Kg"].map(size => (
                    <button
                      key={size}
                      onClick={() => setPackSize(size)}
                      className={clsx("flex-1 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        packSize === size ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={packSize}
                  onChange={e => setPackSize(e.target.value)}
                  placeholder="Or enter custom size (e.g. 2.5 Kg, 250 g)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Enter Quantity (Packets)</label>
                <input
                  type="number"
                  value={packQty}
                  onChange={e => setPackQty(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>

              {(() => {
                const parseWeight = (size: string) => {
                  const match = size.match(/^(\\d+(\\.\\d+)?)\\s*(g|kg|l|ml|pcs|unit)$/i);
                  if (!match) return 1.0;
                  const val = parseFloat(match[1]);
                  const unit = match[3].toLowerCase();
                  if (unit === 'g' || unit === 'ml') return val / 1000;
                  return val;
                };

                const qtyNum = parseInt(packQty) || 0;
                const weightPerPacket = parseWeight(packSize);
                const calcBulk = qtyNum * weightPerPacket;
                const availableBulk = Math.max(0, packBatch?.quantity - (packBatch?.packagedQty || 0));
                const remaining = availableBulk - calcBulk;
                const isValid = calcBulk > 0 && calcBulk <= availableBulk;

                return (
                  <div className="bg-slate-50 rounded-xl p-4 mt-4 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulk Required</span>
                      <span className={clsx("text-sm font-black tabular-nums", calcBulk > availableBulk ? "text-rose-500" : "text-slate-900")}>
                        {calcBulk.toFixed(2)} KG
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Bulk</span>
                      <span className="text-sm font-black text-slate-900 tabular-nums">
                        {availableBulk.toFixed(2)} KG
                      </span>
                    </div>
                    <div className="h-px bg-slate-200 w-full my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining</span>
                      <span className={clsx("text-sm font-black tabular-nums", remaining < 0 ? "text-rose-500" : "text-emerald-600")}>
                        {remaining.toFixed(2)} KG
                      </span>
                    </div>

                    <button
                      disabled={!isValid || isSubmitting}
                      onClick={async () => {
                        setIsSubmitting(true);
                        try {
                          await productionApi.packageBatch(packBatch.id, {
                            packetSize: packSize,
                            quantityPackets: qtyNum
                          });
                          toast.success("Packing Lot created successfully!");
                          setShowPackModal(false);
                          setPackQty("");
                          fetchBatches(productFilter || undefined, selectedFranchiseId || undefined);
                        } catch (e: any) {
                          toast.error(e.response?.data?.error || "Failed to pack");
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className={clsx(
                        "w-full mt-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-colors",
                        isValid && !isSubmitting ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? "Processing..." : "Confirm & Pack"}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* QC Modal */}
      {showQCModal && qcBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">QC Approval</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{qcBatch?.product?.name} ({qcBatch?.batchCode ? formatERPNumber("PRD", qcBatch.batchCode) : "—"})</p>
              </div>
              <button onClick={() => setShowQCModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">QC Decision</label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setQcStatus("APPROVED")}
                    className={clsx("flex-1 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      qcStatus === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setQcStatus("REJECTED")}
                    className={clsx("flex-1 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      qcStatus === "REJECTED" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Reject (Scrap)
                  </button>
                </div>
              </div>

              <button
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await productionApi.inspectBatch(qcBatch.id, {
                      qcStatus: qcStatus
                    });
                    toast.success("QC status updated successfully!");
                    setShowQCModal(false);
                    fetchBatches(productFilter || undefined, selectedFranchiseId || undefined);
                  } catch (e: any) {
                    toast.error(e.response?.data?.error || "Failed to update QC");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className={clsx(
                  "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-colors text-white",
                  qcStatus === "APPROVED" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                )}
              >
                {isSubmitting ? "Processing..." : "Confirm QC"}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  /\{\/\* Packing Modal \*\/\}([\s\S]*?)\{\/\* Batch Details SlideOver \*\/\}/,
  packModalReplacement + '\n      {/* Batch Details SlideOver */}'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Updated Modals");
