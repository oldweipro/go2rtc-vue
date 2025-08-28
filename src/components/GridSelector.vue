<template>
  <div class="grid-selector">
    <div class="selector-header">
      <h4>布局选择</h4>
    </div>
    <div class="grid-options">
      <button
        v-for="option in gridOptions"
        :key="option.layout"
        class="grid-option"
        :class="{ active: currentLayout === option.layout }"
        @click="selectLayout(option.layout)"
        :title="option.description"
      >
        <div class="grid-preview" :class="`preview-${option.layout}`">
          <div
            v-for="cell in option.cells"
            :key="cell"
            class="grid-cell"
          />
        </div>
        <span class="grid-label">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GridLayout } from '../types/monitor';

interface Props {
  currentLayout: GridLayout;
}

interface Emits {
  (e: 'update:currentLayout', layout: GridLayout): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const gridOptions = [
  {
    layout: '1x1' as GridLayout,
    label: '单屏',
    description: '1x1 单个监控画面',
    cells: 1
  },
  {
    layout: '2x2' as GridLayout,
    label: '四分屏',
    description: '2x2 四个监控画面',
    cells: 4
  },
  {
    layout: '3x3' as GridLayout,
    label: '九分屏',
    description: '3x3 九个监控画面',
    cells: 9
  }
];

const selectLayout = (layout: GridLayout): void => {
  emit('update:currentLayout', layout);
};
</script>

<style scoped>
.grid-selector {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.selector-header {
  margin-bottom: 12px;
}

.selector-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.grid-options {
  display: flex;
  gap: 12px;
}

.grid-option {
  flex: 1;
  padding: 12px 8px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.grid-option:hover {
  border-color: #3498db;
  background: #f8f9ff;
}

.grid-option.active {
  border-color: #3498db;
  background: #e3f2fd;
}

.grid-preview {
  display: grid;
  gap: 2px;
  width: 32px;
  height: 32px;
}

.preview-1x1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.preview-2x2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.preview-3x3 {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

.grid-cell {
  background: #3498db;
  border-radius: 1px;
}

.grid-option.active .grid-cell {
  background: #2980b9;
}

.grid-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.grid-option.active .grid-label {
  color: #2980b9;
}
</style>