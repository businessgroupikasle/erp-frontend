import api from './base';

export const dashboardApi = {
  getSummary: (params?: any) => api.get('/api/dashboard/summary', { params }),
};
