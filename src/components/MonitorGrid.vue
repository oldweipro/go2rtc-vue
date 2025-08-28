<template>
  <div class="monitor-grid" :class="`grid-${layout}`">
    <div
      v-for="(monitorId, index) in displayMonitors"
      :key="`${monitorId}-${index}`"
      class="grid-item"
      :class="{ highlighted: monitorId && monitorId === highlightedMonitor }"
    >
      <div v-if="monitorId" class="monitor-container">
        <!-- 始终可见的标题 -->
        <div class="monitor-title-bar">
          <div class="monitor-title">{{ getMonitorName(monitorId) }}</div>
        </div>
        
        <!-- hover时显示的操作层 -->
        <div class="monitor-overlay">
          <div class="monitor-actions">
            <button 
              class="action-btn remove-btn" 
              @click.stop="removeFromGrid(index)"
              title="移除监控"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="monitor-status-indicator">
            <div class="status-dot online"></div>
            <span class="status-text">实时</span>
          </div>
        </div>
        <MonitorPlayer 
          :monitor-id="monitorId"
          :url="getMonitorUrl(monitorId)"
        />
      </div>
      <div v-else class="empty-slot" @click="selectMonitorForSlot(index)">
        <div class="empty-content">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14m-7-7h14"/>
            </svg>
          </div>
          <div class="empty-text">点击添加监控</div>
          <div class="empty-hint">选择要在此位置显示的监控视频</div>
        </div>
        <div class="slot-indicator">{{ index + 1 }}</div>
      </div>
    </div>

    <!-- 监控选择对话框 -->
    <div v-if="showMonitorSelector" class="dialog-overlay" @click="cancelSelection">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <div class="header-info">
            <h4>选择监控</h4>
            <p class="header-subtitle">为位置 {{ selectedSlotIndex + 1 }} 选择要显示的监控</p>
          </div>
          <button class="close-btn" @click="cancelSelection">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="monitor-options">
          <div v-if="availableMonitors.length === 0" class="no-monitors">
            <div class="no-monitors-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="no-monitors-text">
              <h5>暂无可用监控</h5>
              <p>所有监控都已添加到网格中，或没有在线的监控可用</p>
            </div>
          </div>
          <button
            v-for="monitor in availableMonitors"
            :key="monitor.id"
            class="monitor-option"
            @click="selectMonitor(monitor.id)"
          >
            <div class="option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div class="monitor-info">
              <div class="monitor-name">{{ monitor.name }}</div>
              <div class="monitor-status" :class="{ online: monitor.isActive }">
                <div class="status-dot"></div>
                {{ monitor.isActive ? '在线' : '离线' }}
              </div>
            </div>
            <div class="option-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMonitors } from '../composables/useMonitors';
import MonitorPlayer from './MonitorPlayer.vue';
import type { GridLayout } from '../types/monitor';

interface Props {
  layout: GridLayout;
  selectedMonitors: (string | null)[];
  highlightedMonitor?: string | null;
}

interface Emits {
  (e: 'update:selectedMonitors', monitors: (string | null)[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { monitors, getMonitorById } = useMonitors();

const showMonitorSelector = ref(false);
const selectedSlotIndex = ref<number>(-1);

const gridSizes = {
  '1x1': 1,
  '2x2': 4,
  '3x3': 9,
  '4x4': 16,
  '5x5': 25
};

const displayMonitors = computed(() => {
  const size = gridSizes[props.layout];
  const result = new Array(size).fill(null);
  
  props.selectedMonitors.forEach((monitorId, index) => {
    if (index < size) {
      result[index] = monitorId;
    }
  });
  
  return result;
});

const availableMonitors = computed(() => 
  monitors.value.filter(monitor => 
    monitor.isActive && !displayMonitors.value.includes(monitor.id)
  )
);


const getMonitorName = (monitorId: string): string => {
  const monitor = getMonitorById(monitorId);
  return monitor?.name ?? '未知监控';
};

const getMonitorUrl = (monitorId: string): string => {
  const monitor = getMonitorById(monitorId);
  return monitor?.url ?? '';
};

const selectMonitorForSlot = (index: number): void => {
  selectedSlotIndex.value = index;
  showMonitorSelector.value = true;
};

const selectMonitor = (monitorId: string): void => {
  const newSelection = [...displayMonitors.value];
  newSelection[selectedSlotIndex.value] = monitorId;
  
  emit('update:selectedMonitors', newSelection);
  
  cancelSelection();
};

const removeFromGrid = (index: number): void => {
  const newSelection = [...displayMonitors.value];
  newSelection[index] = null;
  
  emit('update:selectedMonitors', newSelection);
};

const cancelSelection = (): void => {
  showMonitorSelector.value = false;
  selectedSlotIndex.value = -1;
};

watch(() => props.layout, () => {
  const maxSize = gridSizes[props.layout];
  if (props.selectedMonitors.length > maxSize) {
    const trimmed = props.selectedMonitors.slice(0, maxSize);
    emit('update:selectedMonitors', trimmed);
  } else if (props.selectedMonitors.length < maxSize) {
    const expanded = [...props.selectedMonitors];
    while (expanded.length < maxSize) {
      expanded.push(null);
    }
    emit('update:selectedMonitors', expanded);
  }
});
</script>

<style scoped>
.monitor-grid {
  display: grid;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.grid-1x1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.grid-2x2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.grid-3x3 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.grid-4x4 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

.grid-5x5 {
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
}

.grid-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.grid-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--accent-primary);
}

.grid-item.highlighted {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.2), 0 8px 24px rgba(16, 163, 127, 0.15);
  animation: highlight-pulse 2s ease-in-out;
}

@keyframes highlight-pulse {
  0% { 
    box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.4), 0 8px 24px rgba(16, 163, 127, 0.2);
  }
  50% { 
    box-shadow: 0 0 0 6px rgba(16, 163, 127, 0.2), 0 12px 32px rgba(16, 163, 127, 0.25);
  }
  100% { 
    box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.2), 0 8px 24px rgba(16, 163, 127, 0.15);
  }
}

.monitor-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--bg-primary);
}

/* 始终可见的标题栏 */
.monitor-title-bar {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  pointer-events: none;
  display: inline-block;
}

.monitor-title {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 70%, transparent 100%);
  color: var(--text-light);
  padding: 4px 12px 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  max-width: 200px;
  display: inline-block;
}

/* hover时显示的操作层 */
.monitor-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 15;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.monitor-container:hover .monitor-overlay {
  opacity: 1;
}

.monitor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  padding: 12px;
  pointer-events: auto;
}

.action-btn {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 8px;
  color: var(--text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.action-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.remove-btn:hover {
  background: var(--accent-danger);
}

.monitor-status-indicator {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  margin: 12px;
  border-radius: 6px;
  pointer-events: auto;
  backdrop-filter: blur(8px);
  align-self: flex-start;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-danger);
}

.status-dot.online {
  background: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.3);
}

.status-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.empty-slot {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: var(--bg-primary);
}

.empty-slot:hover {
  border-color: var(--accent-primary);
  background: rgba(16, 163, 127, 0.05);
  transform: scale(0.98);
  box-shadow: inset 0 0 0 1px var(--accent-primary);
}

.empty-content {
  text-align: center;
  color: var(--text-muted);
  padding: 20px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: var(--bg-secondary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.empty-icon svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
  color: var(--text-secondary);
}

.empty-slot:hover .empty-icon {
  background: var(--accent-primary);
  transform: scale(1.1);
}

.empty-slot:hover .empty-icon svg {
  color: var(--text-light);
}

.empty-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.slot-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.empty-slot:hover .slot-indicator {
  background: var(--accent-primary);
  color: var(--text-light);
  border-color: var(--accent-primary);
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border-light);
}

.header-info h4 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.header-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.monitor-options {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 24px;
}

.no-monitors {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.no-monitors-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: var(--bg-secondary);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-monitors-icon svg {
  width: 32px;
  height: 32px;
  stroke-width: 1.5;
}

.no-monitors-text h5 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.no-monitors-text p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.monitor-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-primary);
  cursor: pointer;
  margin-bottom: 8px;
  text-align: left;
  transition: all 0.2s ease;
}

.monitor-option:hover {
  border-color: var(--accent-primary);
  background: rgba(16, 163, 127, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.monitor-option:last-child {
  margin-bottom: 0;
}

.option-icon {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-icon svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
  color: var(--text-secondary);
}

.monitor-option:hover .option-icon {
  background: var(--accent-primary);
}

.monitor-option:hover .option-icon svg {
  color: var(--text-light);
}

.monitor-info {
  flex: 1;
  overflow: hidden;
}

.monitor-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.monitor-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-danger);
}

.monitor-status.online .status-dot {
  background: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.2);
}

.option-arrow {
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.option-arrow svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.monitor-option:hover .option-arrow {
  color: var(--accent-primary);
  transform: translateX(2px);
}
</style>