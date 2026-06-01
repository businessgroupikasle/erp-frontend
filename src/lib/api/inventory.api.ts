import api from './base';

// --- Products & Recipes ---
export const productsApi = {
  getAll: (params: any = {}) => api.get('/api/products', { params }),
  create: (data: any) => api.post('/api/products', data),
};

export const productsFullApi = {
  getAll: (params: any = {}) => api.get('/api/products', { params }),
  getById: (id: string) => api.get(`/api/products/${id}`),
  create: (data: any) => api.post('/api/products', data),
  update: (id: string, data: any) => api.patch(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
};

export const recipesApi = {
  getAll: () => api.get('/api/recipes'),
  getById: (id: string) => api.get(`/api/recipes/${id}`),
  getByProduct: (productId: string) => api.get(`/api/recipes/product/${productId}`),
  upsert: (data: any) => api.post('/api/recipes', data),
  calculateCost: (id: string) => api.post(`/api/recipes/${id}/cost`),
  delete: (id: string) => api.delete(`/api/recipes/${id}`),
};

// --- Raw Materials ---
export const rawMaterialsApi = {
  getAll: (includeInactive = false, franchiseId?: string) => 
    api.get('/api/raw-materials', { params: { includeInactive, franchiseId } }),
  getById: (id: string) => api.get(`/api/raw-materials/${id}`),
  create: (data: any) => api.post('/api/raw-materials', data),
  update: (id: string, data: any) => api.patch(`/api/raw-materials/${id}`, data),
  deactivate: (id: string) => api.patch(`/api/raw-materials/${id}/deactivate`),
  activate: (id: string) => api.patch(`/api/raw-materials/${id}/activate`),
  delete: (id: string) => api.delete(`/api/raw-materials/${id}`),
};

// --- Inventory & Stock ---
export const inventoryApi = {
  getInventory: (franchiseId?: string) => api.get('/api/inventory', { params: { franchiseId } }),
  getRawMaterialStockSummary: (franchiseId?: string) => api.get('/api/inventory/raw-materials/summary', { params: { franchiseId } }),
  getRawMaterialConsumption: (franchiseId?: string) => api.get('/api/inventory/raw-materials/consumption', { params: { franchiseId } }),
  getRawMaterialLedger: (itemId?: string, franchiseId?: string) => api.get('/api/inventory/raw-materials/ledger', { params: { itemId, franchiseId } }),
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
  getWarehouses: () => api.get('/api/warehouses'),
  createWarehouse: (data: { name: string, location?: string, type?: string }) => 
    api.post('/api/warehouses', data),
  updateWarehouse: (id: string, data: { name?: string, location?: string, type?: string }) => 
    api.patch(`/api/warehouses/${id}`, data),
  deleteWarehouse: (id: string) => 
    api.delete(`/api/warehouses/${id}`),
};

// --- Production Workflow ---
export const productionApi = {
  getHistory: (franchiseId?: string) => api.get('/api/production/history', { params: { franchiseId } }),
  startBatch: (data: any) => api.post('/api/production/batch', data),
  stopBatch: (id: string) => api.post(`/api/production/${id}/stop`),
  approveBatch: (id: string, data?: { actualYield?: number }) => api.post(`/api/production/${id}/approve`, data),
  updateStatus: (id: string, status: string) => api.patch(`/api/production/${id}/status`, { status }),
};

export const productBatchesApi = {
  getAll: (params: { productId?: string; franchiseId?: string } = {}) =>
    api.get('/api/production/batches', { params }),
};
