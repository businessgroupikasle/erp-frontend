import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      if (refreshToken) {
        try {
          console.log('🔄 Attempting token refresh...');
          const response = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, { refreshToken });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ Refresh token invalid or expired');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// --- Auth Services ---
export const authApi = {
  login: (data: any) => api.post('/api/auth/login', data),
  logout: (refreshToken: string) => api.post('/api/auth/logout', { refreshToken }),
  me: () => api.get('/api/auth/me'),
};

// --- User Management ---
export const usersApi = {
  getAll: (skip = 0, take = 20) => api.get(`/api/users?skip=${skip}&take=${take}`),
  getById: (id: string) => api.get(`/api/users/${id}`),
  create: (data: any) => api.post('/api/users', data),
  update: (id: string, data: any) => api.patch(`/api/users/${id}`, data),
  delete: (id: string) => api.delete(`/api/users/${id}`),
};

// --- Billing & POS ---
export const posApi = {
  checkout: (data: any) => api.post('/api/orders', data),
  getOrders: (params: any = {}) => api.get('/api/orders', { params }),
  getOrderById: (id: string) => api.get(`/api/orders/${id}`),
  getInvoice: (orderId: string) => api.get(`/api/invoices/${orderId}`),
  updateStatus: (id: string, status: string) => api.patch(`/api/orders/${id}/status`, { status }),
  addPayment: (id: string, data: any) => api.post(`/api/orders/${id}/payment`, data),
};

// --- Products & Recipes ---
export const productsApi = {
  getAll: (params: any = {}) => api.get('/api/products', { params }),
  create: (data: any) => api.post('/api/products', data),
};

export const recipesApi = {
  getAll: () => api.get('/api/recipes'),
  getById: (id: string) => api.get(`/api/recipes/${id}`),
  getByProduct: (productId: string) => api.get(`/api/recipes/product/${productId}`),
  upsert: (data: any) => api.post('/api/recipes', data),
  calculateCost: (id: string) => api.post(`/api/recipes/${id}/cost`),
  delete: (id: string) => api.delete(`/api/recipes/${id}`),
};

// --- Production Workflow ---
export const productionApi = {
  getHistory: (franchiseId?: string) => api.get('/api/production/history', { params: { franchiseId } }),
  startBatch: (data: any) => api.post('/api/production/batch', data),
  updateStatus: (id: string, status: string) => api.patch(`/api/production/${id}/status`, { status }),
};

// --- Logistics & Transfers ---
export const logisticsApi = {
  getRequests: (params: any = {}) => api.get('/api/logistics/requests', { params }),
  createRequest: (data: any) => api.post('/api/logistics/requests', data),
  approveRequest: (id: string, approvedItems: any[]) => 
    api.patch(`/api/logistics/requests/${id}/approve`, { approvedItems }),
  
  getTransfers: (params: any = {}) => api.get('/api/logistics/transfers', { params }),
  initiateTransfer: (data: any) => api.post('/api/logistics/transfers', data),
  completeTransfer: (id: string) => api.patch(`/api/logistics/transfers/${id}/complete`),
};

export const inventoryApi = {
  getInventory: (franchiseId?: string) => api.get('/api/inventory', { params: { franchiseId } }),
  getItem: (id: string) => api.get(`/api/inventory/items/${id}`),
  createItem: (data: any) => api.post('/api/inventory/items', data),
  stockIn: (data: { itemId: string, quantity: number, type: string, note?: string }) =>
    api.post('/api/inventory/stock-in', data),
  stockOut: (data: { itemId: string, quantity: number, type: string, note?: string }) =>
    api.post('/api/inventory/stock-out', data),
  adjustment: (data: { itemId: string, newQuantity: number, note?: string }) =>
    api.post('/api/inventory/adjustment', data),
  getMovements: (params?: any) => api.get('/api/inventory/movements', { params }),
  getAlerts: () => api.get('/api/inventory/alerts'),
};

// --- Franchise Management & Governance ---
export const franchiseApi = {
  getAll: () => api.get('/api/franchise'),
  getById: (id: string) => api.get(`/api/franchise/${id}`),
  create: (data: any) => api.post('/api/franchise', data),
  update: (id: string, data: any) => api.patch(`/api/franchise/${id}`, data),
  delete: (id: string) => api.delete(`/api/franchise/${id}`),
  
  // User Management within Franchise
  getUsers: (id: string) => api.get(`/api/franchise/${id}/users`),
  
  // Logistics Compatibility
  getRequests: (params?: any) => api.get('/api/logistics/requests', { params }),
  createRequest: (data: any) => api.post('/api/logistics/requests', data),
  approveRequest: (id: string, approvedItems: any[]) =>
    api.patch(`/api/logistics/requests/${id}/approve`, { approvedItems }),
  getTransfers: (params?: any) => api.get('/api/logistics/transfers', { params }),
  initiateTransfer: (data: any) => api.post('/api/logistics/transfers', data),
  completeTransfer: (id: string) => api.patch(`/api/logistics/transfers/${id}/complete`),
};

// --- User Governance (Admin Only) ---
export const userGovernanceApi = {
  getAll: (skip = 0, take = 20) => api.get(`/api/users?skip=${skip}&take=${take}`),
  create: (data: any) => api.post('/api/users', data),
  update: (id: string, data: any) => api.patch(`/api/users/${id}`, data),
  resetPassword: (id: string, data: { password: string }) => 
    api.patch(`/api/users/${id}/reset-password`, data),
  delete: (id: string) => api.delete(`/api/users/${id}`),
};

// --- Customer Management ---
export const customersApi = {
  getAll: (params: any = {}) => api.get('/api/customers', { params }),
  getById: (id: string) => api.get(`/api/customers/${id}`),
  search: (query: string) => api.get(`/api/customers`, { params: { search: query } }),
  create: (data: any) => api.post('/api/customers', data),
  update: (id: string, data: any) => api.patch(`/api/customers/${id}`, data),
  delete: (id: string) => api.delete(`/api/customers/${id}`),
};

// --- Dashboard ---
export const dashboardApi = {
  getSummary: (params?: any) => api.get('/api/dashboard/summary', { params }),
};

// --- Products (full CRUD) ---
export const productsFullApi = {
  getAll: (params: any = {}) => api.get('/api/products', { params }),
  getById: (id: string) => api.get(`/api/products/${id}`),
  create: (data: any) => api.post('/api/products', data),
  update: (id: string, data: any) => api.patch(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
};

// --- Vendors ---
export const vendorsApi = {
  getAll: () => api.get('/api/vendors'),
  getSummary: () => api.get('/api/vendors/summary'),
  filterVendors: (params: any) => api.get('/api/vendors/filter', { params }),
  getById: (id: string) => api.get(`/api/vendors/${id}`),
  create: (data: any) => api.post('/api/vendors', data),
  update: (id: string, data: any) => api.patch(`/api/vendors/${id}`, data),
  delete: (id: string) => api.delete(`/api/vendors/${id}`),
  linkMaterial: (data: { vendorId: string; materialId: string; price: number }) =>
    api.post('/api/vendors/link-material', data),
  getLedger: (id: string, params: any = {}) => api.get(`/api/vendors/${id}/ledger`, { params }),
  recordPayment: (id: string, data: { amount: number; note: string }) => api.post(`/api/vendors/${id}/payment`, data),
  recordAdjustment: (id: string, data: { amount: number; type: 'CREDIT' | 'DEBIT'; note: string }) => api.post(`/api/vendors/${id}/adjustment`, data),
};

// --- Purchase Orders (with advance/balance tracking) ---
export const purchaseOrdersApi = {
  getAll: () => api.get('/api/purchase-orders'),
  getById: (id: string) => api.get(`/api/purchase-orders/${id}`),
  create: (data: { 
    vendorId: string; 
    advancePaid?: number; 
    expectedDeliveryDate?: string;
    notes?: string;
    items: { inventoryItemId: string; quantity: number; price: number }[] 
  }) => api.post('/api/purchase-orders', data),
  receive: (id: string) => api.post(`/api/purchase-orders/${id}/receive`),
  recordAdvance: (id: string, advancePaid: number) =>
    api.patch(`/api/purchase-orders/${id}/advance`, { advancePaid }),
  applyAdvance: (id: string) =>
    api.post(`/api/purchase-orders/${id}/apply-advance`),
  cancel: (id: string) => api.patch(`/api/purchase-orders/${id}/cancel`),
  delete: (id: string) => api.delete(`/api/purchase-orders/${id}`),
};

// --- Raw Materials ---
export const rawMaterialsApi = {
  getAll: () => api.get('/api/raw-materials'),
  create: (data: any) => api.post('/api/raw-materials', data),
  update: (id: string, data: any) => api.patch(`/api/raw-materials/${id}`, data),
  delete: (id: string) => api.delete(`/api/raw-materials/${id}`),
};

// --- Franchise Product Requests (franchise → home house) ---
export const franchiseProductRequestsApi = {
  getAll: () => api.get('/api/franchise/product-requests'),
  create: (data: { franchiseId: string; products: { productId?: string; productName: string; quantity: number; unit: string }[] }) =>
    api.post('/api/franchise/product-requests', data),
  update: (id: string, data: { status: string; adminResponse?: string }) =>
    api.patch(`/api/franchise/product-requests/${id}`, data),
  delete: (id: string) => api.delete(`/api/franchise/product-requests/${id}`),
};


// --- Goods Receipt Notes (GRN) ---
export const grnApi = {
  getAll: (params: any = {}) => api.get('/api/grn', { params }),
  getById: (id: string) => api.get(`/api/grn/${id}`),
  createFromPO: (poId: string, data: { items: any[], receivedBy?: string }) => 
    api.post(`/api/grn/from-po/${poId}`, data),
  approve: (id: string) => api.patch(`/api/grn/${id}/approve`),
  cancel: (id: string) => api.patch(`/api/grn/${id}/cancel`),
};

// --- Vendor Invoices & Matching ---
export const vendorInvoicesApi = {
  getAll: (params: any = {}) => api.get('/api/vendor-invoices', { params }),
  create: (data: any) => api.post('/api/vendor-invoices', data),
  match: (id: string) => api.post(`/api/vendor-invoices/${id}/match`),
  updateStatus: (id: string, status: string) => api.patch(`/api/vendor-invoices/${id}/status`, { status }),
};
