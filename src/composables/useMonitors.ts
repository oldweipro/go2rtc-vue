import { ref, computed } from 'vue';
import { apiService } from '../services/api';
import { useServerConfig } from './useServerConfig';
import type { Monitor } from '../types/monitor';

const monitors = ref<Monitor[]>([]);

export function useMonitors() {
  const { getStreamWebSocketUrl } = useServerConfig();
  
  const activeMonitors = computed(() => 
    monitors.value.filter(monitor => monitor.isActive)
  );

  const loadMonitorsFromServer = async (): Promise<void> => {
    try {
      const response = await apiService.getStreams();
      if (response.success && response.data) {
        const serverStreams = response.data;
        const newMonitors: Monitor[] = [];

        Object.entries(serverStreams).forEach(([streamName]) => {
          const monitor: Monitor = {
            id: streamName,
            name: streamName,
            url: getStreamWebSocketUrl(streamName),
            isActive: true,
            createdAt: Date.now()
          };
          newMonitors.push(monitor);
        });

        monitors.value = newMonitors;
        saveToLocalStorage();
      }
    } catch (error) {
      console.error('Failed to load monitors from server:', error);
      loadFromLocalStorage();
    }
  };

  const addMonitor = async (name: string, rtspUrl: string): Promise<boolean> => {
    try {
      const response = await apiService.addStream(name, rtspUrl);
      if (response.success) {
        const newMonitor: Monitor = {
          id: name,
          name,
          url: getStreamWebSocketUrl(name),
          rtspUrl,
          isActive: true,
          createdAt: Date.now()
        };
        monitors.value.push(newMonitor);
        saveToLocalStorage();
        return true;
      }
    } catch (error) {
      console.error('Failed to add monitor:', error);
    }
    return false;
  };

  const removeMonitor = async (id: string): Promise<boolean> => {
    try {
      const response = await apiService.deleteStream(id);
      if (response.success) {
        const index = monitors.value.findIndex(monitor => monitor.id === id);
        if (index !== -1) {
          monitors.value.splice(index, 1);
          saveToLocalStorage();
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to remove monitor:', error);
    }
    return false;
  };

  const updateMonitor = (id: string, updates: Partial<Monitor>): void => {
    const monitor = monitors.value.find(m => m.id === id);
    if (monitor) {
      Object.assign(monitor, updates);
      saveToLocalStorage();
    }
  };

  const getMonitorById = (id: string): Monitor | undefined => {
    return monitors.value.find(monitor => monitor.id === id);
  };

  const saveToLocalStorage = (): void => {
    localStorage.setItem('monitors', JSON.stringify(monitors.value));
  };

  const loadFromLocalStorage = (): void => {
    const saved = localStorage.getItem('monitors');
    if (saved) {
      try {
        const savedMonitors = JSON.parse(saved);
        // Update URLs based on current server config
        monitors.value = savedMonitors.map((monitor: Monitor) => ({
          ...monitor,
          url: getStreamWebSocketUrl(monitor.id)
        }));
      } catch (error) {
        console.error('Failed to load monitors from localStorage:', error);
      }
    }
  };

  const refreshMonitors = async (): Promise<void> => {
    await loadMonitorsFromServer();
  };

  return {
    monitors,
    activeMonitors,
    addMonitor,
    removeMonitor,
    updateMonitor,
    getMonitorById,
    loadFromLocalStorage,
    loadMonitorsFromServer,
    refreshMonitors
  };
}