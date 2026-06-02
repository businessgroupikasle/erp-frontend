"use client";

import { useState, useEffect } from "react";
import { 
  Barcode, Printer, History, Search, Layers, RefreshCw, 
  Tag, Calendar, Sparkles, Check, ArrowRight 
} from "lucide-react";
import { productionApi, franchiseApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface PackagingRecord {
  id: string;
  packetSize: string;
  quantityPackets: number;
  totalWeight: number;
  barcode: string;
  createdAt: string;
  batch: {
    batchCode: string;
    expiryDate: string;
    product: {
      name: string;
      sku: string;
    };
  };
}

export default function LabelsBarcodesPage() {
  const [packagings, setPackagings] = useState<PackagingRecord[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PackagingRecord | null>(null);

  useEffect(() => {
    async function initData() {
      try {
        const fRes = await franchiseApi.getAll();
        setFranchises(fRes.data || []);
        if (fRes.data?.length > 0) {
          setSelectedFranchiseId(fRes.data[0].id);
        }
      } catch (err) {
        toast.error("Failed to load franchises");
      }
    }
    initData();
  }, []);

  const loadRecords = async () => {
    if (!selectedFranchiseId) return;
    setLoading(true);
    try {
      const res = await productionApi.getPackagings(selectedFranchiseId);
      setPackagings(res.data || []);
      if (res.data?.length > 0) {
        setSelectedRecord(res.data[0]);
      }
    } catch (err) {
      toast.error("Failed to load packaging history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [selectedFranchiseId]);

  const handlePrintLabel = () => {
    window.print();
  };

  const filteredRecords = packagings.filter(p => 
    p.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.batch?.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 print:bg-white print:p-0">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F97316] rounded-xl shadow-lg shadow-orange-600/20 text-white">
              <Barcode size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Labels & <span className="text-[#F97316]">Barcodes</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-semibold tracking-wider uppercase">
                Generate and print retail compliance stickers for packaged goods
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFranchiseId}
            onChange={(e) => setSelectedFranchiseId(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider focus:outline-none"
          >
            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Packaging log list */}
        <div className="lg:col-span-2 space-y-6 print:hidden">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <History size={16} className="text-[#F97316]" />
                Packaging Run Logs
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search barcode or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl text-xs focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning logs...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-20 text-center text-slate-400 uppercase text-[10px] font-bold">
                No packaging logs found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="py-4 px-6">Product Details</th>
                      <th className="py-4 px-4 text-center">Pack Size</th>
                      <th className="py-4 px-4 text-right">Pack Qty</th>
                      <th className="py-4 px-4">Barcode ID</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-semibold text-slate-750 dark:text-slate-250">
                    {filteredRecords.map((rec) => {
                      const isSelected = selectedRecord?.id === rec.id;
                      
                      return (
                        <tr key={rec.id} className={`hover:bg-slate-55/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer ${isSelected ? 'bg-[#F97316]/5' : ''}`} onClick={() => setSelectedRecord(rec)}>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 dark:text-white">{rec.batch?.product?.name}</div>
                            <div className="text-[9px] font-mono text-slate-450 mt-1 uppercase">Batch: {rec.batch?.batchCode}</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded text-[10px] font-bold text-slate-600 dark:text-slate-350">
                              {rec.packetSize}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-slate-700 dark:text-slate-350">
                            {rec.quantityPackets} packs
                          </td>
                          <td className="py-4 px-4 font-mono text-[10px] text-slate-500">
                            {rec.barcode}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecord(rec);
                                setTimeout(handlePrintLabel, 100);
                              }}
                            >
                              <Printer size={15} />
                            </button>
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

        {/* Right 1 Column: Visual label previewer */}
        <div className="lg:col-span-1">
          {selectedRecord ? (
            <div className="space-y-6">
              
              {/* Label sheet visual mockup container */}
              <div id="print-label-sticker" className="bg-white text-slate-950 border-2 border-dashed border-slate-300 rounded-3xl p-6 shadow-xl space-y-4 max-w-sm mx-auto print:border-none print:shadow-none print:p-0 print:m-0">
                <div className="text-center border-b-2 border-slate-900 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#F97316]">Kiddos Food HQ</span>
                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 mt-0.5">
                    {selectedRecord.batch?.product?.name}
                  </h4>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                    Pack Size: {selectedRecord.packetSize}
                  </div>
                </div>

                <div className="space-y-2 text-[10px] font-semibold text-slate-800">
                  <div className="flex justify-between">
                    <span className="uppercase text-slate-400">SKU Ref:</span>
                    <span className="font-mono">{selectedRecord.batch?.product?.sku}-{selectedRecord.packetSize.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase text-slate-400">Batch Code:</span>
                    <span className="font-mono">{selectedRecord.batch?.batchCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase text-slate-400">Expiry Date:</span>
                    <span>{selectedRecord.batch?.expiryDate ? format(new Date(selectedRecord.batch.expiryDate), 'dd/MM/yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase text-slate-400">Intake Date:</span>
                    <span>{format(new Date(selectedRecord.createdAt), 'dd/MM/yyyy')}</span>
                  </div>
                </div>

                {/* Simulated scan barcode graphics */}
                <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center gap-2 border border-slate-100">
                  <div className="h-12 w-full flex items-center justify-center gap-[2px]">
                    {/* Simulated vertical barcode stripes */}
                    {[2,1,3,1,2,1,4,1,2,3,1,2,1,3,2,1,4,1,2,1,3,1,2,4,1,2].map((w, idx) => (
                      <div 
                        key={idx} 
                        className={`h-full bg-slate-950`}
                        style={{ width: `${w}px`, opacity: idx % 3 === 0 ? 0.35 : 1 }}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] font-mono tracking-widest font-black text-slate-700">
                    {selectedRecord.barcode}
                  </div>
                </div>

                <div className="text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Licensed Product of Kiddos Food LLP
                </div>
              </div>

              {/* Action controller */}
              <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 space-y-4 print:hidden">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-450">Labeling Actions</h4>
                
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintLabel}
                    className="flex-1 py-3 bg-[#F97316] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Printer size={14} />
                    Print Sticker
                  </button>
                </div>

                <p className="text-[9px] font-semibold text-slate-500 uppercase leading-relaxed">
                  Sticker is rendered to standard 4&quot; x 3&quot; thermal label dimensions. Ensure the printer margins are set to none.
                </p>
              </div>

            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center py-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center p-6 print:hidden">
              <Barcode size={32} className="text-slate-300 dark:text-slate-700 mb-3 animate-pulse" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a record to preview compliance label</p>
            </div>
          )}
        </div>

      </div>

      {/* Styled inline sheet print CSS rules */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-label-sticker, #print-label-sticker * {
            visibility: visible;
          }
          #print-label-sticker {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
