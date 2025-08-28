<template>
  <div class="dashboard fade-in">
    <!-- 侧边栏 -->
    <MonitorSidebar 
      v-model:selectedMonitors="selectedMonitors"
      @highlightMonitor="handleHighlightMonitor"
      class="slide-in"
    />
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="layout-controls">
            <label class="layout-label">布局</label>
            <div class="layout-selector">
              <button 
                v-for="layout in gridLayouts" 
                :key="layout.value"
                class="layout-btn"
                :class="{ active: currentLayout === layout.value }"
                @click="currentLayout = layout.value"
                :title="layout.label"
              >
                <div class="layout-preview" :class="`preview-${layout.value}`">
                  <div v-for="n in getGridSize(layout.value)" :key="n" class="preview-cell"></div>
                </div>
                <span class="layout-text">{{ layout.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="toolbar-center">
          <h1 class="page-title">
            <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            监控大屏
          </h1>
          <div class="connection-status">
            <div class="status-dot" :class="{ online: isConnected, pulse: !isConnected }"></div>
            <span class="status-text">{{ isConnected ? '已连接' : '连接中...' }}</span>
          </div>
        </div>

        <div class="toolbar-right">
          <button 
            class="btn-icon action-btn" 
            @click="toggleFullscreen" 
            :title="isFullscreen ? '退出全屏' : '进入全屏'"
          >
            <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/>
              <path d="M3 16.2V21m0 0h4.8M3 21l6-6"/>
              <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/>
              <path d="M3 7.8V3m0 0h4.8M3 3l6 6"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"/>
              <path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"/>
              <path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
            </svg>
          </button>
          <button 
            class="btn-icon action-btn" 
            @click="showServerSettings = true" 
            title="服务器设置"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <div class="user-menu">
            <div class="user-info">
              <div class="user-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span class="username">{{ currentUser?.username }}</span>
            </div>
            <button 
              class="btn-secondary logout-btn" 
              @click="handleLogout"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              退出登录
            </button>
          </div>
        </div>
      </div>

      <!-- 监控网格区域 -->
      <div class="monitor-area" :class="{ fullscreen: isFullscreen }" ref="monitorAreaRef">
        <MonitorGrid
          :layout="currentLayout"
          v-model:selectedMonitors="selectedMonitors"
          :highlightedMonitor="highlightedMonitor"
        />
      </div>
    </div>

    <ServerSettings 
      v-model="showServerSettings"
      @configChanged="handleServerConfigChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useMonitors } from '../composables/useMonitors';
import { useServerConfig } from '../composables/useServerConfig';
import MonitorSidebar from '../components/MonitorSidebar.vue';
import MonitorGrid from '../components/MonitorGrid.vue';
import ServerSettings from '../components/ServerSettings.vue';
import type { GridLayout } from '../types/monitor';

const router = useRouter();
const { currentUser, logout } = useAuth();
const { loadMonitorsFromServer } = useMonitors();
const { isConfigured, loadFromLocalStorage: loadServerConfig } = useServerConfig();

const currentLayout = ref<GridLayout>('2x2');
const selectedMonitors = ref<(string | null)[]>([]);
const showServerSettings = ref(false);
const isFullscreen = ref(false);
const isConnected = ref(true);
const highlightedMonitor = ref<string | null>(null);
const monitorAreaRef = ref<HTMLElement>();

const gridLayouts = [
  { value: '1x1' as GridLayout, label: '单屏' },
  { value: '2x2' as GridLayout, label: '四分屏' },
  { value: '3x3' as GridLayout, label: '九分屏' },
  { value: '4x4' as GridLayout, label: '十六分屏' },
  { value: '5x5' as GridLayout, label: '二十五分屏' }
];

const getGridSize = (layout: GridLayout): number => {
  const sizes = { '1x1': 1, '2x2': 4, '3x3': 9, '4x4': 16, '5x5': 25 };
  return sizes[layout];
};

const handleLogout = async (): Promise<void> => {
  logout();
  await router.push('/login');
};

const handleServerConfigChanged = async (): Promise<void> => {
  // 配置更新后，重新加载监控
  if (isConfigured.value) {
    await loadMonitorsFromServer();
  }
};

const handleHighlightMonitor = (monitorId: string): void => {
  highlightedMonitor.value = monitorId;
  // 2秒后清除高亮效果
  setTimeout(() => {
    highlightedMonitor.value = null;
  }, 2000);
};

const toggleFullscreen = (): void => {
  if (!document.fullscreenElement) {
    monitorAreaRef.value?.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};

// 监听全屏状态变化
const handleFullscreenChange = (): void => {
  isFullscreen.value = !!document.fullscreenElement;
};

onMounted(async () => {
  const configLoaded = loadServerConfig();
  
  // 如果没有配置，自动打开设置对话框
  if (!configLoaded || !isConfigured.value) {
    showServerSettings.value = true;
    return;
  }
  
  // 有配置才加载监控
  await loadMonitorsFromServer();
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.layout-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layout-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.layout-selector {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-light);
}

.layout-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
}

.layout-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.layout-btn.active {
  background: var(--accent-primary);
  color: var(--text-light);
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.3);
}

.layout-preview {
  display: grid;
  gap: 1px;
  width: 16px;
  height: 16px;
}

.preview-1x1 { grid-template-columns: 1fr; grid-template-rows: 1fr; }
.preview-2x2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.preview-3x3 { grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); }
.preview-4x4 { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); }
.preview-5x5 { grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); }

.preview-cell {
  background: currentColor;
  border-radius: 1px;
  opacity: 0.7;
}

.layout-text {
  font-size: 11px;
  font-weight: 500;
}

.toolbar-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.title-icon {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-danger);
  transition: all 0.3s ease;
}

.status-dot.online {
  background: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.2);
}

.status-text {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  position: relative;
  overflow: hidden;
}

.action-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-light);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-avatar svg {
  width: 14px;
  height: 14px;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 8px 12px;
}

.logout-btn svg {
  width: 14px;
  height: 14px;
}

/* 监控区域 */
.monitor-area {
  flex: 1;
  padding: 20px;
  background: var(--bg-secondary);
  min-height: 0;
  overflow: hidden;
}

.monitor-area.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: #000;
  padding: 0;
}

.monitor-area.fullscreen .monitor-grid {
  width: 100%;
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    flex-direction: column;
  }
  
  .main-content {
    order: -1;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .user-menu {
    justify-content: space-between;
    width: 100%;
  }
  
  .monitor-area {
    padding: 12px;
  }
}

</style>