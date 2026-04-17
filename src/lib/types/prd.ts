export type Role = 'ADMIN' | 'MANAGER' | 'FRANCHISEE' | 'STAFF' | 'KITCHEN' | 'DELIVERY';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  franchiseId?: string;
}

export interface Franchise {
  id: string;
  name: string;
  location: string;
  ownerName: string;
  contactNum: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type ItemCategory = 'RAW_MATERIAL' | 'SEMI_FINISHED' | 'FINISHED_GOOD' | 'PACKAGING';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  minStockLevel: number;
  expiryDate?: Date;
  franchiseId: string;
}

export interface Transaction {
  id: string;
  invoiceNum: string;
  franchiseId: string;
  customerName?: string;
  customerPhone?: string;
  subTotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD';
  status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  category?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
}
