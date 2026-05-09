'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, CheckCircle2, XCircle, AlertCircle, 
  Thermometer, Droplets, Package, History, ArrowRight,
  ClipboardCheck, Trash2, RefreshCw, Eye
} from 'lucide-react';
import { qcApi } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function QCClient() {
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [inspectionData, setInspectionData] = useState({
    approvedQty: 0,
    rejectedQty: 0,
    scrapQty: 0,
    actionTaken: 'APPROVE' as any,
    remarks: '',
    temperature: '',
    moistureContent: '',
    packagingOk: true
  });

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await qcApi.getPending();
      setPendingItems(res.data);
      if (res.data.length > 0 && !selectedItem) {
        setSelectedItem(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load pending inspections');
    } finally {
      setLoading(false);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  useEffect(() => {
    if (selectedItem) {
      setInspectionData(prev => ({
        ...prev,
        approvedQty: selectedItem.receivedQty,
        rejectedQty: 0,
        scrapQty: 0,
        actionTaken: 'APPROVE'
      }));
    }
  }, [selectedItem]);

  const handleQtyChange = (field: string, val: number) => {
    const total = selectedItem?.receivedQty || 0;
    let newApproved = inspectionData.approvedQty;
    let newRejected = inspectionData.rejectedQty;

    if (field === 'approvedQty') {
      newApproved = val;
      newRejected = Math.max(0, total - val);
    } else {
      newRejected = val;
      newApproved = Math.max(0, total - val);
    }

    setInspectionData(prev => ({
      ...prev,
      approvedQty: newApproved,
      rejectedQty: newRejected,
      actionTaken: newRejected > 0 ? (prev.actionTaken === 'APPROVE' ? 'REJECT_RETURN' : prev.actionTaken) : 'APPROVE'
    }));
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;
    
    try {
      setIsSubmitting(true);
      await qcApi.inspect({
        grnItemId: selectedItem.id,
        approvedQty: Number(inspectionData.approvedQty),
        rejectedQty: Number(inspectionData.rejectedQty),
        actionTaken: inspectionData.actionTaken,
        remarks: inspectionData.remarks,
        temperature: inspectionData.temperature ? Number(inspectionData.temperature) : undefined,
        moistureContent: inspectionData.moistureContent ? Number(inspectionData.moistureContent) : undefined,
        packagingOk: inspectionData.packagingOk
      });
      
      toast.success('Inspection recorded successfully');
      setSelectedItem(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
            Quality Control Center
          </h1>
          <p className="text-slate-400 mt-1">Enterprise Inspection Workflow & Material Release</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-amber-400">{pendingItems.length} Pending Inspection(s)</span>
          </div>
          <button 
            onClick={fetchPending}
            className="p-2 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* List Panel */}
        <div className="w-1/3 flex flex-col bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-800/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search GRNs or Batches..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && pendingItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <p>Loading pending items...</p>
              </div>
            ) : pendingItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500 p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/20" />
                <p>No pending inspections found. All material batches are clear.</p>
              </div>
            ) : (
              pendingItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 border-b border-slate-800/50 cursor-pointer transition-all hover:bg-slate-800/30 ${selectedItem?.id === item.id ? 'bg-emerald-500/5 border-l-4 border-l-emerald-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-slate-500">GRN-{item.grn?.id.substring(0, 8)}</span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded-full font-bold uppercase tracking-wider">QC Hold</span>
                  </div>
                  <h4 className="font-bold text-slate-200">{item.inventoryItem?.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Package className="w-3.5 h-3.5" />
                      {item.receivedQty} {item.inventoryItem?.unit}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <History className="w-3.5 h-3.5" />
                      {format(new Date(item.grn?.createdAt), 'MMM dd')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inspection Form Panel */}
        <div className="flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl relative">
          {!selectedItem ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-12 text-center">
              <ClipboardCheck className="w-16 h-16 text-slate-800 mb-4" />
              <h2 className="text-xl font-bold text-slate-400">Ready for Inspection</h2>
              <p className="max-w-xs mt-2">Select a pending batch from the list to begin the quality control process.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-500 font-mono text-sm tracking-widest uppercase">Material Verification</span>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-400 text-sm">{selectedItem.grn?.procurementOrder?.vendor?.name}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedItem.inventoryItem?.name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="px-2 py-1 bg-slate-800 rounded text-xs font-mono text-slate-300">Batch: {selectedItem.vendorBatchNo || 'N/A'}</div>
                    <div className="px-2 py-1 bg-slate-800 rounded text-xs font-mono text-slate-300">PO: {selectedItem.grn?.procurementOrder?.poNumber || 'N/A'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Received</div>
                  <div className="text-3xl font-black text-white">{selectedItem.receivedQty} <span className="text-lg text-slate-500">{selectedItem.inventoryItem?.unit}</span></div>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                {/* 1. Industry Metrics */}
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" /> Physical Parameters
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500">Temperature (°C)</label>
                      <input 
                        type="number"
                        placeholder="24.5"
                        value={inspectionData.temperature}
                        onChange={(e) => setInspectionData({...inspectionData, temperature: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500">Moisture Content (%)</label>
                      <input 
                        type="number"
                        placeholder="12.0"
                        value={inspectionData.moistureContent}
                        onChange={(e) => setInspectionData({...inspectionData, moistureContent: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-500">Packaging Integrity</label>
                      <button 
                        onClick={() => setInspectionData({...inspectionData, packagingOk: !inspectionData.packagingOk})}
                        className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${inspectionData.packagingOk ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}
                      >
                        {inspectionData.packagingOk ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {inspectionData.packagingOk ? 'Intact & Sealed' : 'Damaged / Leaked'}
                      </button>
                    </div>
                  </div>
                </section>

                {/* 2. Quantity Tally */}
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Accepted vs Rejected
                  </h3>
                  <div className="grid grid-cols-2 gap-8 bg-slate-800/20 p-6 rounded-3xl border border-slate-800">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-emerald-400">Accepted Quantity</label>
                        <span className="text-xs text-slate-500">Usable Stock</span>
                      </div>
                      <input 
                        type="number"
                        value={inspectionData.approvedQty}
                        onChange={(e) => handleQtyChange('approvedQty', Number(e.target.value))}
                        className="w-full text-4xl font-black bg-transparent outline-none text-white focus:text-emerald-400 transition-colors"
                      />
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500" 
                          style={{ width: `${(inspectionData.approvedQty / selectedItem.receivedQty) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-red-400">Rejected Quantity</label>
                        <span className="text-xs text-slate-500">Non-Usable</span>
                      </div>
                      <input 
                        type="number"
                        value={inspectionData.rejectedQty}
                        onChange={(e) => handleQtyChange('rejectedQty', Number(e.target.value))}
                        className="w-full text-4xl font-black bg-transparent outline-none text-white focus:text-red-400 transition-colors"
                      />
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500 h-full transition-all duration-500" 
                          style={{ width: `${(inspectionData.rejectedQty / selectedItem.receivedQty) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Action Logic */}
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Final Disposition
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { id: 'APPROVE', label: 'Release to Stock', icon: CheckCircle2, color: 'emerald' },
                      { id: 'REJECT_RETURN', label: 'Return to Vendor', icon: Trash2, color: 'amber' },
                      { id: 'REJECT_SCRAP', label: 'Scrap / Destroy', icon: XCircle, color: 'red' },
                      { id: 'REWORK', label: 'Internal Rework', icon: RefreshCw, color: 'blue' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setInspectionData({...inspectionData, actionTaken: btn.id})}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${inspectionData.actionTaken === btn.id ? `bg-${btn.color}-500/20 border-${btn.color}-500 text-${btn.color}-400 shadow-lg shadow-${btn.color}-500/10` : 'bg-slate-800/30 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                      >
                        <btn.icon className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* 4. Remarks */}
                <section className="space-y-2">
                  <label className="text-xs text-slate-500">Inspection Remarks & Observations</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe any issues, moisture variances, or reasons for rejection..."
                    value={inspectionData.remarks}
                    onChange={(e) => setInspectionData({...inspectionData, remarks: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none"
                  />
                </section>

              </div>

              {/* Footer Actions */}
              <div className="p-6 bg-slate-800/20 border-t border-slate-800 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="px-6 py-3 text-slate-400 font-bold hover:text-white transition-colors"
                >
                  Discard Changes
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-10 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl shadow-xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ClipboardCheck className="w-5 h-5" />}
                  Finalize Inspection Record
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
