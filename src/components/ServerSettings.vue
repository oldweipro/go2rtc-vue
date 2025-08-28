<template>
  <div v-if="showSettings" class="settings-overlay" @click="closeSettings">
    <div class="settings-dialog" @click.stop>
      <div class="settings-header">
        <div class="header-content">
          <h4>{{ isConfigured ? '服务器设置' : '首次配置' }}</h4>
          <p v-if="!isConfigured" class="config-hint">
            请配置您的 go2rtc 服务器信息以开始使用监控系统
          </p>
        </div>
        <button v-if="isConfigured" class="close-btn" @click="closeSettings">×</button>
      </div>
      
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label>服务器地址</label>
          <input
            v-model="localConfig.host"
            type="text"
            required
            placeholder="例如：192.168.1.100 或 localhost"
          />
        </div>
        
        <div class="form-group">
          <label>HTTP 端口</label>
          <input
            v-model.number="localConfig.port"
            type="number"
            required
            placeholder="1984"
            min="1"
            max="65535"
          />
        </div>
        
        <div class="form-group">
          <label>WebSocket 端口</label>
          <input
            v-model.number="localConfig.wsPort"
            type="number"
            placeholder="留空则使用 HTTP 端口"
            min="1"
            max="65535"
          />
          <small class="form-help">
            如果 WebSocket 端口与 HTTP 端口不同，请填写此项
          </small>
        </div>

        <div v-if="isConfigured" class="current-config">
          <h5>当前配置</h5>
          <div class="config-item">
            <strong>HTTP API:</strong> {{ baseUrl }}
          </div>
          <div class="config-item">
            <strong>WebSocket:</strong> {{ wsBaseUrl }}
          </div>
        </div>
        
        <div v-if="!isConfigured" class="setup-guide">
          <h5>配置说明</h5>
          <ul>
            <li>请确保 go2rtc 服务器正在运行</li>
            <li>服务器地址填写服务器的IP地址或域名</li>
            <li>HTTP端口通常是 go2rtc 的默认端口（如1984）</li>
            <li>WebSocket端口通常与HTTP端口相同</li>
          </ul>
        </div>
        
        <div class="settings-actions">
          <button v-if="isConfigured" type="button" @click="handleClear" class="clear-btn">
            清除配置
          </button>
          <div class="primary-actions">
            <button v-if="isConfigured" type="button" @click="closeSettings" class="cancel-btn">
              取消
            </button>
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? '保存中...' : (isConfigured ? '保存' : '开始使用') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useServerConfig } from '../composables/useServerConfig';
import type { ServerConfig } from '../types/server';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'configChanged'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { serverConfig, isConfigured, baseUrl, wsBaseUrl, updateConfig, clearConfig, validateConfig } = useServerConfig();

const showSettings = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const saving = ref(false);
const localConfig = ref<ServerConfig>({
  host: '',
  port: 1984,
  wsPort: 1984
});

// Update local config when server config changes
watch(serverConfig, (newConfig) => {
  if (newConfig) {
    localConfig.value = { ...newConfig };
  }
}, { deep: true, immediate: true });

const handleSave = async (): Promise<void> => {
  saving.value = true;
  try {
    // 验证配置
    if (!validateConfig(localConfig.value)) {
      alert('请填写完整的服务器配置信息');
      return;
    }
    
    updateConfig(localConfig.value);
    emit('configChanged');
    closeSettings();
  } catch (error) {
    console.error('Failed to save server config:', error);
    alert('保存配置失败，请重试');
  } finally {
    saving.value = false;
  }
};

const handleClear = (): void => {
  if (confirm('确定要清除服务器配置吗？这将需要重新配置。')) {
    clearConfig();
    localConfig.value = { host: '', port: 1984, wsPort: 1984 };
  }
};

const closeSettings = (): void => {
  // 如果没有配置，不允许关闭设置对话框
  if (!isConfigured.value) {
    alert('请先配置服务器信息后再继续');
    return;
  }
  
  showSettings.value = false;
  // Reset local config to server config on close without saving
  if (serverConfig.value) {
    localConfig.value = { ...serverConfig.value };
  }
};
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  color: #333;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 15px 20px;
  border-bottom: 1px solid #eee;
}

.header-content h4 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.config-hint {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-btn:hover {
  color: #333;
}

.settings-dialog form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.form-help {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 12px;
}

.current-config {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #3498db;
}

.current-config h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.config-item {
  margin-bottom: 4px;
  font-size: 13px;
  word-break: break-all;
}

.config-item:last-child {
  margin-bottom: 0;
}

.setup-guide {
  background: #e8f4fd;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #3498db;
}

.setup-guide h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.setup-guide ul {
  margin: 0;
  padding-left: 20px;
}

.setup-guide li {
  margin-bottom: 4px;
  font-size: 13px;
  color: #555;
}

.settings-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.primary-actions {
  display: flex;
  gap: 10px;
}

.clear-btn,
.cancel-btn,
.save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.clear-btn {
  background: #e74c3c;
  color: white;
}

.clear-btn:hover {
  background: #c0392b;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.save-btn {
  background: #3498db;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #2980b9;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>