<template>
  <div class="monitor-sidebar">
    <div class="sidebar-header">
      <button class="new-monitor-btn" @click="showAddDialog = true">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 5v14m-7-7h14"/>
        </svg>
        新建监控
      </button>
    </div>

    <div class="monitor-list">
      <div
        v-for="monitor in monitors"
        :key="monitor.id"
        class="monitor-item"
        :class="{ active: selectedMonitors.filter(id => id !== null).includes(monitor.id) }"
        @click="highlightMonitorInGrid(monitor.id)"
      >
        <div class="monitor-info">
          <div class="monitor-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div class="monitor-details">
            <div class="monitor-name">{{ monitor.name }}</div>
            <div class="monitor-status" :class="{ online: monitor.isActive }">
              <div class="status-indicator"></div>
              {{ monitor.isActive ? '在线' : '离线' }}
            </div>
          </div>
        </div>
        <div class="monitor-actions">
          <button
            class="action-btn"
            @click.stop="handleRemoveMonitor(monitor.id)"
            :disabled="deletingMonitors.has(monitor.id)"
            title="删除监控"
          >
            <svg v-if="!deletingMonitors.has(monitor.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            <div v-else class="loading-spinner"></div>
          </button>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <button class="refresh-btn btn-icon" @click="handleRefresh" :disabled="refreshing" title="刷新列表">
        <svg class="refresh-icon" :class="{ spinning: refreshing }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
      </button>
      <div class="monitor-count">
        {{ monitors.length }} 个监控
      </div>
    </div>

    <!-- 添加监控对话框 -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="cancelAdd">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h4>添加新监控</h4>
          <button class="close-btn" @click="cancelAdd">×</button>
        </div>
        <form @submit.prevent="handleAddMonitor" class="dialog-form">
          <div class="form-group">
            <label class="form-label">监控名称</label>
            <input
              v-model="newMonitor.name"
              type="text"
              required
              placeholder="请输入监控名称"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">RTSP 地址</label>
            <input
              v-model="newMonitor.rtspUrl"
              type="text"
              required
              placeholder="rtsp://admin:password@192.168.1.100:554/Streaming/Channels/101"
              class="form-input"
            />
            <small class="form-help">
              请输入 RTSP 流地址，系统会自动处理连接
            </small>
          </div>
          <div class="dialog-actions">
            <button type="button" @click="cancelAdd" class="btn-secondary">
              取消
            </button>
            <button type="submit" class="btn-primary" :disabled="adding">
              {{ adding ? '添加中...' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMonitors } from '../composables/useMonitors';

interface Props {
  selectedMonitors: (string | null)[];
}

interface Emits {
  (e: 'update:selectedMonitors', monitors: (string | null)[]): void;
  (e: 'highlightMonitor', monitorId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { monitors, addMonitor, removeMonitor, refreshMonitors } = useMonitors();

const showAddDialog = ref(false);
const adding = ref(false);
const refreshing = ref(false);
const deletingMonitors = ref(new Set<string>());

const newMonitor = ref({
  name: '',
  rtspUrl: ''
});

const highlightMonitorInGrid = (monitorId: string): void => {
  // 只有当监控在右侧网格中时，才触发高亮效果
  if (props.selectedMonitors.includes(monitorId)) {
    emit('highlightMonitor', monitorId);
  }
};

const handleAddMonitor = async (): Promise<void> => {
  adding.value = true;
  try {
    const success = await addMonitor(newMonitor.value.name, newMonitor.value.rtspUrl);
    if (success) {
      cancelAdd();
    } else {
      alert('添加监控失败，请检查输入信息或服务器连接');
    }
  } catch (error) {
    console.error('Failed to add monitor:', error);
    alert('添加监控时发生错误');
  } finally {
    adding.value = false;
  }
};

const handleRemoveMonitor = async (id: string): Promise<void> => {
  if (!confirm('确定要删除这个监控吗？')) return;
  
  deletingMonitors.value.add(id);
  try {
    const success = await removeMonitor(id);
    if (!success) {
      alert('删除监控失败，请稍后重试');
    }
  } catch (error) {
    console.error('Failed to remove monitor:', error);
    alert('删除监控时发生错误');
  } finally {
    deletingMonitors.value.delete(id);
  }
};

const handleRefresh = async (): Promise<void> => {
  refreshing.value = true;
  try {
    await refreshMonitors();
  } catch (error) {
    console.error('Failed to refresh monitors:', error);
  } finally {
    refreshing.value = false;
  }
};

const cancelAdd = (): void => {
  showAddDialog.value = false;
  newMonitor.value = { name: '', rtspUrl: '' };
};
</script>

<style scoped>
/* 监控侧边栏 */
.monitor-sidebar {
  width: 260px;
  height: 100vh;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.new-monitor-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--accent-primary);
  border: none;
  border-radius: 10px;
  color: var(--text-light);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.2);
}

.new-monitor-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
}

.new-monitor-btn .btn-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

/* 监控列表 */
.monitor-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.monitor-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.monitor-item:hover {
  background: var(--bg-hover);
}

.monitor-item.active {
  background: var(--accent-primary);
  color: var(--text-light);
  border: 1px solid rgba(16, 163, 127, 0.3);
}

.monitor-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.monitor-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.monitor-icon svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  color: var(--text-secondary);
}

.monitor-item.active .monitor-icon {
  background: rgba(255, 255, 255, 0.15);
}

.monitor-item.active .monitor-icon svg {
  color: var(--text-light);
}

.monitor-details {
  flex: 1;
  overflow: hidden;
}

.monitor-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.monitor-item.active .monitor-name {
  color: var(--text-light);
}

.monitor-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-danger);
  transition: all 0.3s ease;
}

.monitor-status.online .status-indicator {
  background: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.2);
}

.monitor-item.active .monitor-status {
  color: rgba(255, 255, 255, 0.8);
}

.monitor-item.active .monitor-status.online .status-indicator {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.monitor-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
}

.monitor-item:hover .monitor-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.action-btn svg {
  width: 14px;
  height: 14px;
  stroke-width: 2;
}

.action-btn:hover {
  background: var(--bg-hover);
  color: var(--accent-danger);
  transform: scale(1.05);
}

.monitor-item.active .action-btn {
  color: rgba(255, 255, 255, 0.7);
}

.monitor-item.active .action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-btn {
  position: relative;
  border-radius: 8px;
}

.refresh-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  transition: transform 0.3s ease;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

.monitor-count {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid var(--border-light);
}

.dialog-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 18px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dialog-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text-primary);
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-help {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

</style>