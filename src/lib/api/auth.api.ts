import api from './base';

export const authApi = {
  login: (data: any) => api.post('/api/auth/login', data),
  logout: (refreshToken: string) => api.post('/api/auth/logout', { refreshToken }),
  me: () => api.get('/api/auth/me'),
};
