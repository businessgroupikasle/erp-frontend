import api from './base';

// --- Accounts & Money Workflow ---
export const accountingApi = {
  getPayments: (params?: any) => api.get('/api/accounting/payments', { params }),
  recordPayment: (data: any) => api.post('/api/accounting/payments', data),
  getExpenses: (params?: any) => api.get('/api/accounting/expenses', { params }),
  getExpenseById: (id: string) => api.get(`/api/accounting/expenses/${id}`),
  recordExpense: (data: any) => api.post('/api/accounting/expenses', data),
  recordExpensePayment: (id: string, data: { amount: number, accountId: string, paymentMode: string, note?: string }) => 
    api.post(`/api/accounting/expenses/${id}/payment`, data),
  deleteExpense: (id: string) => api.delete(`/api/accounting/expenses/${id}`),
  getCashFlow: () => api.get('/api/finance/cash-flow'),
  getAccounts: () => api.get('/api/accounts'),
  transferFunds: (data: any) => api.post('/api/accounting/transfers', data),
  cancelPayment: (id: string) => api.post(`/api/accounting/payments/${id}/cancel`),
  getLedgerSummary: (params?: any) => api.get('/api/accounting/ledger-summary', { params }),
};

export const accountsApi = {
  getAll: () => api.get('/api/accounts'),
  getById: (id: string) => api.get(`/api/accounts/${id}`),
  create: (data: { name: string, type: 'CASH' | 'BANK' | 'UPI', balance?: number, franchiseId?: string, isActive?: boolean }) => api.post('/api/accounts', data),
  delete: (id: string) => api.delete(`/api/accounts/${id}`),
};

// --- Reports & Analytics (Financial & Operational) ---
export const reportsApi = {
  getInventoryValue: (franchiseId?: string) => api.get('/api/reports/inventory-value', { params: { franchiseId } }),
  getSales: (params?: any) => api.get('/api/reports/sales', { params }),
  getExpenses: (params?: any) => api.get('/api/reports/expenses', { params }),
  getProfit: (params?: any) => api.get('/api/reports/profit', { params }),
  getDetailedProfit: (params?: any) => api.get('/api/reports/profit', { params: { ...params, detailed: 'true' } }),
};

export const chequesApi = {
  getAll: (params?: any) => api.get('/api/cheques', { params }),
  getStats: (params?: any) => api.get('/api/cheques/stats', { params }),
  create: (data: any) => api.post('/api/cheques', data),
  updateStatus: (id: string, status: string) => api.patch(`/api/cheques/${id}/status`, { status }),
};
