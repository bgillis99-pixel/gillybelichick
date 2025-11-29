/**
 * API Service
 * Connects to carb-clean-truck-api Cloud Run service via Global Load Balancer
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://YOUR_LOAD_BALANCER_URL';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class CarbApiService {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // VIN Operations
  async checkVIN(vin: string) {
    return this.request<{
      vin: string;
      compliant: boolean;
      details: string[];
    }>('/api/vin/check', {
      method: 'POST',
      body: JSON.stringify({ vin }),
    });
  }

  async getVINHistory(userId: string) {
    return this.request<Array<{
      vin: string;
      timestamp: string;
      result: 'PASS' | 'FAIL';
    }>>(`/api/vin/history/${userId}`);
  }

  // Test Operations
  async saveTest(testData: {
    vin: string;
    customer_name: string;
    customer_phone: string;
    result: 'PASS' | 'FAIL';
    photos?: string[];
    notes?: string;
  }) {
    return this.request('/api/tests', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }

  // User Operations
  async getUserProfile(userId: string) {
    return this.request(`/api/users/${userId}`);
  }

  async updateUserProfile(userId: string, data: any) {
    return this.request(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const carbApi = new CarbApiService();
