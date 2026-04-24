"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";

export interface LineItem {
  id: string;
  materialId: string;
  name: string;
  quantity: number;
  price: number;
  gstRate: number;
}

export interface Vendor {
  id: string;
  name: string;
  phone?: string;
  advanceBalance: number;
  balanceDue: number;
  suppliedMaterials?: { materialId: string; price: number }[];
}

interface PurchaseOrderContextType {
  selectedVendor: Vendor | null;
  setSelectedVendor: (vendor: Vendor | null) => void;
  items: LineItem[];
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<LineItem>) => void;
  useAdvance: boolean;
  setUseAdvance: (use: boolean) => void;
  notes: string;
  setNotes: (notes: string) => void;
  totals: {
    subtotal: number;
    totalGst: number;
    total: number;
    appliedAdvance: number;
    balanceDue: number;
  };
  isValid: boolean;
  errors: string[];
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  getVendorPrice: (materialId: string) => number | null;
}

const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined);

export function PurchaseOrderProvider({ children }: { children: React.ReactNode }) {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", materialId: "", name: "", quantity: 0, price: 0, gstRate: 5 }
  ]);
  const [useAdvance, setUseAdvance] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), materialId: "", name: "", quantity: 0, price: 0, gstRate: 5 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    } else {
      // Reset the single item instead of removing
      setItems([{ id: "1", materialId: "", name: "", quantity: 0, price: 0, gstRate: 5 }]);
    }
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Returns the vendor-linked price for a material, or null if not found
  const getVendorPrice = (materialId: string): number | null => {
    if (!selectedVendor?.suppliedMaterials) return null;
    const linked = selectedVendor.suppliedMaterials.find(sm => sm.materialId === materialId);
    return linked ? linked.price : null;
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const totalGst = items.reduce((acc, item) => acc + (item.quantity * item.price * (item.gstRate / 100)), 0);
    const total = subtotal + totalGst;
    
    let appliedAdvance = 0;
    if (useAdvance && selectedVendor && selectedVendor.advanceBalance > 0) {
      appliedAdvance = Math.min(selectedVendor.advanceBalance, total);
    }
    
    const balanceDue = total - appliedAdvance;
    
    return {
      subtotal,
      totalGst,
      total,
      appliedAdvance,
      balanceDue
    };
  }, [items, useAdvance, selectedVendor]);

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!selectedVendor) errs.push("Please select a vendor");
    if (items.length === 0 || (items.length === 1 && !items[0].materialId && items[0].quantity === 0)) {
        errs.push("Please add at least one item");
    }
    if (items.some(i => i.quantity <= 0)) errs.push("One or more items have invalid quantity");
    if (items.some(i => i.price <= 0)) errs.push("One or more items have invalid price");
    return errs;
  }, [selectedVendor, items]);

  const isValid = errors.length === 0;

  return (
    <PurchaseOrderContext.Provider value={{
      selectedVendor,
      setSelectedVendor,
      items,
      addItem,
      removeItem,
      updateItem,
      useAdvance,
      setUseAdvance,
      notes,
      setNotes,
      totals,
      isValid,
      errors,
      isSubmitting,
      setIsSubmitting,
      getVendorPrice,
    }}>
      {children}
    </PurchaseOrderContext.Provider>
  );
}

export function usePurchaseOrder() {
  const context = useContext(PurchaseOrderContext);
  if (context === undefined) {
    throw new Error("usePurchaseOrder must be used within a PurchaseOrderProvider");
  }
  return context;
}
