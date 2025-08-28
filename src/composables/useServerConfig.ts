import { ref, computed } from 'vue';
import type { ServerConfig } from '../types/server';

const serverConfig = ref<ServerConfig | null>(null);

export function useServerConfig() {
  const isConfigured = computed(() => serverConfig.value !== null);
  
  const baseUrl = computed(() => {
    if (!serverConfig.value) return '';
    return `http://${serverConfig.value.host}:${serverConfig.value.port}`;
  });

  const wsBaseUrl = computed(() => {
    if (!serverConfig.value) return '';
    return `ws://${serverConfig.value.host}:${serverConfig.value.wsPort || serverConfig.value.port}`;
  });

  const updateConfig = (config: ServerConfig): void => {
    serverConfig.value = { ...config };
    saveToLocalStorage();
  };

  const clearConfig = (): void => {
    serverConfig.value = null;
    localStorage.removeItem('server_config');
  };

  const saveToLocalStorage = (): void => {
    if (serverConfig.value) {
      localStorage.setItem('server_config', JSON.stringify(serverConfig.value));
    }
  };

  const loadFromLocalStorage = (): boolean => {
    const saved = localStorage.getItem('server_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        // 验证配置完整性
        if (config && config.host && config.port) {
          serverConfig.value = config;
          return true;
        }
      } catch (error) {
        console.error('Failed to load server config from localStorage:', error);
      }
    }
    return false;
  };

  const getStreamWebSocketUrl = (streamName: string): string => {
    if (!serverConfig.value) return '';
    return `${wsBaseUrl.value}/api/ws?src=${encodeURIComponent(streamName)}`;
  };

  const validateConfig = (config: Partial<ServerConfig>): boolean => {
    return !!(config.host && config.port && config.host.trim() && config.port > 0);
  };

  return {
    serverConfig,
    isConfigured,
    baseUrl,
    wsBaseUrl,
    updateConfig,
    clearConfig,
    loadFromLocalStorage,
    getStreamWebSocketUrl,
    validateConfig
  };
}