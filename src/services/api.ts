import { useServerConfig } from '../composables/useServerConfig';
import type { Stream, ApiResponse } from '../types/server';

class ApiService {
  private getBaseUrl(): string {
    const { baseUrl, isConfigured } = useServerConfig();
    if (!isConfigured.value) {
      throw new Error('Server configuration not found');
    }
    return baseUrl.value;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.getBaseUrl()}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data: T;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses, return the text or handle as needed
        data = (await response.text()) as unknown as T;
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getStreams(): Promise<ApiResponse<Record<string, Stream>>> {
    return this.request<Record<string, Stream>>('/api/streams');
  }

  async addStream(name: string, src: string): Promise<ApiResponse<any>> {
    const encodedSrc = encodeURIComponent(src);
    return this.request(`/api/streams?name=${encodeURIComponent(name)}&src=${encodedSrc}`, {
      method: 'PUT',
    });
  }

  async deleteStream(streamName: string): Promise<ApiResponse<any>> {
    return this.request(`/api/streams?src=${encodeURIComponent(streamName)}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();