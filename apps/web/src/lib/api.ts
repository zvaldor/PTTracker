const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ptapi-production.up.railway.app';

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    console.log('💾 Setting token:', token ? `${token.substring(0, 20)}...` : 'null');
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
      console.log('✅ Token saved to localStorage');
    } else {
      localStorage.removeItem('accessToken');
      console.log('🗑️ Token removed from localStorage');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('accessToken');
      console.log('📦 Getting token from localStorage:', this.token ? `${this.token.substring(0, 20)}...` : 'null');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token available for request to', endpoint);
    }

    console.log('🔐 Making request to', endpoint, 'with token:', token ? 'present' : 'missing');

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      console.error('❌ Request failed:', endpoint, response.status, error);

      // If 401 Unauthorized, token might be expired - force logout
      if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        console.warn('🔓 Token expired or invalid, logging out...');
        // Import authStore dynamically to avoid circular dependency
        import('@/stores/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        });
      }

      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: any) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestMagicLink(email: string) {
    return this.request('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyMagicLink(token: string) {
    return this.request(`/auth/magic-verify?token=${token}`, {
      method: 'GET',
    });
  }

  // Tasks
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(data: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getAnalytics(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/analytics?${query}`);
  }

  // Sync
  async sync(data: any) {
    return this.request('/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
