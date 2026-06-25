'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, CheckCircle2, XCircle, AlertCircle, 
  Thermometer, Droplets, Package, History, ArrowRight,
  ClipboardCheck, Trash2, RefreshCw, Eye, Sparkles, Layers,
  Compass, ShieldCheck
} from 'lucide-react';
import { qcApi, productionApi } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function QCClient() {
  const [activeTab, setActiveTab] = useState<'GRN' | 'PRODUCTION'>('GRN');
  
  // GRN State
  const [grnItems, setGrnItems] = useState<any[]>([]);
  const [selectedGrnItem, setSelectedGrnItem] = useState<any>(null);

  // Production State
  const [prodBatches, setProdBatches] = useState<any[]>([]);
  const [selectedProdBatch, setSelectedProdBatch] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // GRN Form State
  const [grnInspection, setGrnInspection] = useState({
    approvedQty: 0,
    rejectedQty: 0,
    scrapQty: 0,
    actionTaken: 'APPROVE' as any,
    remarks: '',
    temperature: '',
    moistureContent: '',
    packagingOk: true
  });

  // Production Form State
  const [prodInspection, setProdInspection] = useState({
    qcStatus: 'APPROVED',
    moistureCheck: '',
    colorCheck: 'Match Standard',
    textureCheck: 'Smooth',
    rejectionQty: 0,
    remarks: ''
  });

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'GRN') {
        const res = await qcApi.getPending();
        setGrnItems(res.data || []);
        if (res.data?.length > 0 && !selectedGrnItem) {
          setSelectedGrnItem(res.data[0]);
        }
      } else {
        const res = await productionApi.getPendingQC();
        setProdBatches(res.data || []);
        if (res.data?.length > 0 && !selectedProdBatch) {
          setSelectedProdBatch(res.data[0]);
        }
      }
    } catch (err) {
      toast.error('Failed to load pending quality checks');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedGrnItem, selectedProdBatch]);

  useEffect(() => {
    fetchPending();
  }, [activeTab]);

  // Sync GRN form when item changes
  useEffect(() => {
    if (selectedGrnItem) {
      setGrnInspection(prev => ({
        ...prev,
        approvedQty: selectedGrnItem.receivedQty,
        rejectedQty: 0,
        scrapQty: 0,
        actionTaken: 'APPROVE'
      }));
    }
  }, [selectedGrnItem]);

  // Sync Production form when batch changes
  useEffect(() => {
    if (selectedProdBatch) {
      setProdInspection({
        qcStatus: 'APPROVED',
        moistureCheck: '',
        colorCheck: 'Match Standard',
        textureCheck: 'Smooth',
        rejectionQty: 0,
        remarks: ''
      });
    }
  }, [selectedProdBatch]);

  const handleGrnQtyChange = (field: string, val: number) => {
    const total = selectedGrnItem?.receivedQty || 0;
    let newApproved = grnInspection.approvedQty;
    let newRejected = grnInspection.rejectedQty;

    if (field === 'approvedQty') {
      newApproved = val;
      newRejected = Math.max(0, total - val);
    } else {
      newRejected = val;
      newApproved = Math.max(0, total - val);
    }

    setGrnInspection(prev => ({
      ...prev,
      approvedQty: newApproved,
      rejectedQty: newRejected,
      actionTaken: newRejected > 0 ? (prev.actionTaken === 'APPROVE' ? 'REJECT_RETURN' : prev.actionTaken) : 'APPROVE'
    }));
  };

  const handleProdRejectionChange = (val: number) => {
    const total = selectedProdBatch?.quantity || 0;
    const cleanVal = Math.min(total, Math.max(0, val));
    setProdInspection(prev => ({
      ...prev,
      rejectionQty: cleanVal
    }));
  };

  const handleGrnSubmit = async () => {
    if (!selectedGrnItem) return;
    
    try {
      setIsSubmitting(true);
      await qcApi.inspect({
        grnItemId: selectedGrnItem.id,
        approvedQty: Number(grnInspection.approvedQty),
        rejectedQty: Number(grnInspection.rejectedQty),
        actionTaken: grnInspection.actionTaken,
        remarks: grnInspection.remarks,
        temperature: grnInspection.temperature ? Number(grnInspection.temperature) : undefined,
        moistureContent: grnInspection.moistureContent ? Number(grnInspection.moistureContent) : undefined,
        packagingOk: grnInspection.packagingOk
      });
      
      toast.success('Material inspection recorded successfully');
      setSelectedGrnItem(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to record material inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProdSubmit = async () => {
    if (!selectedProdBatch) return;

    try {
      setIsSubmitting(true);
      await productionApi.inspectBatch(selectedProdBatch.id, {
        qcStatus: prodInspection.qcStatus,
        moistureCheck: prodInspection.moistureCheck ? Number(prodInspection.moistureCheck) : undefined,
        colorCheck: prodInspection.colorCheck,
        textureCheck: prodInspection.textureCheck,
        rejectionQty: Number(prodInspection.rejectionQty)
      });

      toast.success('Production QC audit finalized!');
      setSelectedProdBatch(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit production QC audit');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items
  const filteredGrnItems = grnItems.filter(item => 
    item.inventoryItem?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.vendorBatchNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProdBatches = prodBatches.filter(batch => 
    batch.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.batchCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 p-4 md:p-6 overflow-hidden bg-slate-950 -m-6 md:-m-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6 border-b border-slate-900 bg-slate-900/20">
        <div>
          <h1 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight flex items-center gap-2 uppercase">
            <ShieldCheck className="text-emerald-400" />
            Quality Control Center
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">Enterprise Inspection Workflow & Material Release</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dual Tabs */}
          <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => { setActiveTab('GRN'); setSelectedGrnItem(null); setSearchQuery(''); }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'GRN' ? 'bg-[#F97316] text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Inward Materials (GRN)
            </button>
            <button
              onClick={() => { setActiveTab('PRODUCTION'); setSelectedProdBatch(null); setSearchQuery(''); }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'PRODUCTION' ? 'bg-[#F97316] text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Production Batches
            </button>
          </div>

          <button 
            onClick={fetchPending}
            className="p-2 bg-slate-900 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden px-6 pb-6">
        
        {/* Left Side: List Panel */}
        <div className="w-full md:w-1/3 flex flex-col bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="p-4 border-b border-slate-900 bg-slate-900/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder={activeTab === 'GRN' ? 'Search materials or batches...' : 'Search finished goods or batches...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && (activeTab === 'GRN' ? grnItems.length === 0 : prodBatches.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retrieving queue...</p>
              </div>
            ) : (activeTab === 'GRN' ? filteredGrnItems.length === 0 : filteredProdBatches.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/20" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Queue is completely clear!</p>
              </div>
            ) : activeTab === 'GRN' ? (
              filteredGrnItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedGrnItem(item)}
                  className={`p-4 border-b border-slate-900/60 cursor-pointer transition-all hover:bg-slate-900/30 ${selectedGrnItem?.id === item.id ? 'bg-[#F97316]/10 border-l-4 border-l-[#F97316]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">GRN-{item.grn?.id.substring(0, 8)}</span>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[9px] rounded-full font-black uppercase tracking-wider">M-Hold</span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-xs">{item.inventoryItem?.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase">
                      <Package className="w-3 h-3 text-slate-400" />
                      {item.receivedQty} {item.inventoryItem?.unit}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredProdBatches.map((batch) => (
                <div 
                  key={batch.id}
                  onClick={() => setSelectedProdBatch(batch)}
                  className={`p-4 border-b border-slate-900/60 cursor-pointer transition-all hover:bg-slate-900/30 ${selectedProdBatch?.id === batch.id ? 'bg-[#F97316]/10 border-l-4 border-l-[#F97316]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-mono text-slate-450 uppercase">{batch.batchCode}</span>
                    <span className="px-2 py-0.5 bg-[#F97316]/10 text-[#F97316] text-[9px] rounded-full font-black uppercase tracking-wider font-mono">P-HOLD</span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-xs">{batch.product?.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase">
                      <Package className="w-3 h-3 text-slate-400" />
                      Yield: {batch.quantity} {batch.product?.unit || 'units'}
                    </div>
                    {batch.production?.recipe?.name && (
                      <div className="text-[9px] text-slate-450 font-bold uppercase truncate max-w-[120px]">
                        Formula: {batch.production.recipe.name}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="flex-1 flex flex-col bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden backdrop-blur-xl relative">
          
          {activeTab === 'GRN' ? (
            /* GRN QC Form */
            !selectedGrnItem ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-12 text-center">
                <ClipboardCheck className="w-14 h-14 text-slate-800 mb-4 animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-450">Ready for Material QC</h2>
                <p className="max-w-xs text-[10px] text-slate-500 font-semibold uppercase mt-1">Select an inward GRN material consignment to inspect.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-900 bg-slate-900/40 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#F97316] font-mono text-xs tracking-widest uppercase font-black">Material Verification</span>
                      <ArrowRight className="w-4 h-4 text-slate-650" />
                      <span className="text-slate-400 text-xs font-semibold">{selectedGrnItem.grn?.procurementOrder?.vendor?.name}</span>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedGrnItem.inventoryItem?.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-[9px] font-mono text-slate-400">Batch: {selectedGrnItem.vendorBatchNo || 'N/A'}</div>
                      <div className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-[9px] font-mono text-slate-400">PO: {selectedGrnItem.grn?.procurementOrder?.poNumber || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Total Received</div>
                    <div className="text-2xl font-black text-white">{selectedGrnItem.receivedQty} <span className="text-xs text-slate-500">{selectedGrnItem.inventoryItem?.unit}</span></div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  
                  {/* Physical Parameters */}
                  <section>
                    <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-[#F97316]" /> Physical Parameters
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-black uppercase">Temperature (°C)</label>
                        <input 
                          type="number"
                          placeholder="24.5"
                          value={grnInspection.temperature}
                          onChange={(e) => setGrnInspection({...grnInspection, temperature: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-black uppercase">Moisture Content (%)</label>
                        <input 
                          type="number"
                          placeholder="12.0"
                          value={grnInspection.moistureContent}
                          onChange={(e) => setGrnInspection({...grnInspection, moistureContent: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-black uppercase">Packaging Integrity</label>
                        <button 
                          onClick={() => setGrnInspection({...grnInspection, packagingOk: !grnInspection.packagingOk})}
                          className={`w-full py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${grnInspection.packagingOk ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-450'}`}
                        >
                          {grnInspection.packagingOk ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {grnInspection.packagingOk ? 'Intact & Sealed' : 'Damaged / Leaked'}
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Quantity Tally */}
                  <section>
                    <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#F97316]" /> Accepted vs Rejected
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-850">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <label className="text-emerald-400 uppercase">Accepted Quantity</label>
                          <span className="text-slate-500">Usable Stock</span>
                        </div>
                        <input 
                          type="number"
                          value={grnInspection.approvedQty}
                          onChange={(e) => handleGrnQtyChange('approvedQty', Number(e.target.value))}
                          className="w-full text-3xl font-black bg-transparent outline-none text-white focus:text-[#F97316]"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <label className="text-rose-400 uppercase">Rejected Quantity</label>
                          <span className="text-slate-500">Deducted Stock</span>
                        </div>
                        <input 
                          type="number"
                          value={grnInspection.rejectedQty}
                          onChange={(e) => handleGrnQtyChange('rejectedQty', Number(e.target.value))}
                          className="w-full text-3xl font-black bg-transparent outline-none text-white focus:text-rose-400"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Final Disposition */}
                  <section>
                    <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-[#F97316]" /> Final Disposition
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { id: 'APPROVE', label: 'Release Stock', icon: CheckCircle2, activeColor: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
                        { id: 'REJECT_RETURN', label: 'Return Vendor', icon: Trash2, activeColor: 'border-amber-500 text-amber-400 bg-amber-500/10' },
                        { id: 'REJECT_SCRAP', label: 'Scrap/Destroy', icon: XCircle, activeColor: 'border-rose-500 text-rose-400 bg-rose-500/10' },
                        { id: 'REWORK', label: 'Internal Rework', icon: RefreshCw, activeColor: 'border-sky-500 text-sky-400 bg-sky-500/10' }
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => setGrnInspection({...grnInspection, actionTaken: btn.id})}
                          className={`flex flex-col items-center gap-3 p-4 rounded-2xl border text-[10px] font-bold uppercase transition-all ${grnInspection.actionTaken === btn.id ? btn.activeColor : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800'}`}
                        >
                          <btn.icon className="w-5 h-5" />
                          <span>{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Remarks */}
                  <section className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Inspection Remarks</label>
                    <textarea 
                      rows={3}
                      placeholder="Enter remarks..."
                      value={grnInspection.remarks}
                      onChange={(e) => setGrnInspection({...grnInspection, remarks: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 text-white resize-none"
                    />
                  </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-900/30 border-t border-slate-900 flex justify-end gap-4">
                  <button 
                    onClick={() => setSelectedGrnItem(null)}
                    className="px-6 py-3 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleGrnSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                    Record Inspection
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Production QC Form */
            !selectedProdBatch ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-12 text-center">
                <Layers className="w-14 h-14 text-slate-800 mb-4 animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-450">Ready for Production QC</h2>
                <p className="max-w-xs text-[10px] text-slate-500 font-semibold uppercase mt-1">Select a finished goods batch from the schedule to release to inventory.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-900 bg-slate-900/40 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#F97316] font-mono text-xs tracking-widest uppercase font-black">Finished Goods Verification</span>
                      <ArrowRight className="w-4 h-4 text-slate-650" />
                      <span className="text-slate-400 text-xs font-semibold">{selectedProdBatch.franchise?.name || 'Central Facility'}</span>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedProdBatch.product?.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-[9px] font-mono text-slate-400">Batch Code: {selectedProdBatch.batchCode}</div>
                      {selectedProdBatch.production?.recipe?.name && (
                        <div className="px-2 py-1 bg-slate-950 border border-slate-850 rounded text-[9px] font-mono text-slate-400">Formula: {selectedProdBatch.production.recipe.name}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Declared Output Yield</div>
                    <div className="text-2xl font-black text-white">{selectedProdBatch.quantity} <span className="text-xs text-slate-500">{selectedProdBatch.product?.unit || 'units'}</span></div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  
                  {/* QA Quality Parameters */}
                  <section>
                    <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#F97316]" /> QA Quality Parameters
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-black uppercase">Moisture Content (%)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 8.2"
                          value={prodInspection.moistureCheck}
                          onChange={(e) => setProdInspection({...prodInspection, moistureCheck: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-black uppercase">Color Consistency</label>
                        <input 
                          type="text"
                          value={prodInspection.colorCheck}
                          onChange={(e) => setProdInspection({...prodInspection, colorCheck: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 font-black uppercase">Texture Profile</label>
                        <input 
                          type="text"
                          value={prodInspection.textureCheck}
                          onChange={(e) => setProdInspection({...prodInspection, textureCheck: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 text-white"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Quantity Discrepancy (Rejections) */}
                  <section>
                    <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#F97316]" /> Yield Accounting
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-3xl border border-slate-850">
                      
                      <div className="space-y-3">
                        <label className="text-[10px] text-slate-500 font-black uppercase block">Wastage / Rejection Quantity</label>
                        <input 
                          type="number"
                          value={prodInspection.rejectionQty || ""}
                          onChange={(e) => handleProdRejectionChange(Number(e.target.value))}
                          placeholder="0.00"
                          className="w-full text-3xl font-black bg-transparent outline-none text-rose-400 focus:ring-0 focus:outline-none"
                        />
                        <p className="text-[9px] font-semibold text-slate-500 uppercase">Discarded due to contamination or QA fail</p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] text-[#F97316] font-black uppercase block">Approved Intake Quantity</label>
                        <div className="text-3xl font-black text-emerald-400 py-1">
                          {(selectedProdBatch.quantity - prodInspection.rejectionQty).toFixed(2)}
                          <span className="text-xs text-slate-550 ml-1.5 uppercase font-bold">{selectedProdBatch.product?.unit || 'units'}</span>
                        </div>
                        <p className="text-[9px] font-semibold text-slate-500 uppercase">Released directly to finished goods inventory</p>
                      </div>

                    </div>
                  </section>

                  {/* QC Status Toggle */}
                  <section>
                    <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-[#F97316]" /> Final Status Decision
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        onClick={() => setProdInspection({...prodInspection, qcStatus: 'APPROVED'})}
                        className={`py-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${prodInspection.qcStatus === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800'}`}
                      >
                        <CheckCircle2 size={16} />
                        Pass & Release
                      </button>
                      <button
                        onClick={() => setProdInspection({...prodInspection, qcStatus: 'REWORK'})}
                        className={`py-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${prodInspection.qcStatus === 'REWORK' ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800'}`}
                      >
                        <RefreshCw size={16} />
                        Send for Rework
                      </button>
                      <button
                        onClick={() => setProdInspection({...prodInspection, qcStatus: 'REJECTED'})}
                        className={`py-4 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${prodInspection.qcStatus === 'REJECTED' ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-lg' : 'bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-800'}`}
                      >
                        <XCircle size={16} />
                        Reject Batch
                      </button>
                    </div>
                  </section>

                  {/* Remarks */}
                  <section className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase">QA Inspector Notes</label>
                    <textarea 
                      rows={3}
                      placeholder="Add QA inspection logs, variance notes..."
                      value={prodInspection.remarks}
                      onChange={(e) => setProdInspection({...prodInspection, remarks: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 text-white resize-none"
                    />
                  </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-900/30 border-t border-slate-900 flex justify-end gap-4">
                  <button 
                    onClick={() => setSelectedProdBatch(null)}
                    className="px-6 py-3 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleProdSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#F97316] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2 animate-pulse"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                    Finalize QA Release
                  </button>
                </div>
              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}
