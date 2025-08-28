<template>
  <div class="monitor-player">
    <video 
      ref="videoMse" 
      :autoplay="videoConfig.autoplay"
      :muted="videoConfig.muted"
      :playsinline="videoConfig.playsinline"
      class="monitor-video"
    />
    <div v-if="lastError" class="error-message">
      {{ lastError.message }}
    </div>
    <div v-if="!isConnected" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">连接中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { WebSocketService } from '../services/websocket';
import { useMSE } from '../composables/useMSE';
import { useErrorHandler } from '../composables/useErrorHandler';
import { DEFAULT_STREAM_CONFIG, DEFAULT_VIDEO_CONFIG } from '../config/stream';
import type { WebSocketMessage } from '../types';

interface Props {
  monitorId: string;
  url: string;
}

const props = defineProps<Props>();

const videoMse = ref<HTMLVideoElement | null>(null);
const videoConfig = { 
  ...DEFAULT_VIDEO_CONFIG
};

const isConnected = ref(false);

const { 
  initMediaSource, 
  setupSourceBuffer, 
  handlePacket, 
  handleVideoEvents, 
  cleanup 
} = useMSE(videoMse);

const { 
  lastError, 
  handleConnectionError, 
  handleMediaError, 
  handleBufferError, 
  shouldReload 
} = useErrorHandler();

let wsService: WebSocketService | null = null;

const handleWebSocketMessage = (data: string | ArrayBuffer): void => {
  try {
    if (typeof data === 'string') {
      const message: WebSocketMessage = JSON.parse(data);
      setupSourceBuffer(message.value);
      isConnected.value = true;
    } else {
      handlePacket(data);
    }
  } catch (error) {
    isConnected.value = false;
    if (error instanceof Error) {
      handleMediaError(`Failed to process message: ${error.message}`);
    } else {
      handleMediaError('Unknown error processing message');
    }
    
    if (shouldReload()) {
      window.location.reload();
    }
  }
};

const startStream = (streamUrl: string): void => {
  if (wsService) {
    wsService.disconnect();
  }
  
  isConnected.value = false;
  
  try {
    const mediaSource = initMediaSource();
    
    mediaSource.addEventListener('sourceopen', () => {
      wsService = new WebSocketService(
        streamUrl,
        handleWebSocketMessage,
        (error) => {
          isConnected.value = false;
          handleConnectionError(error.message);
        }
      );
      
      wsService.connect(DEFAULT_STREAM_CONFIG.codecs);
    });
  } catch (error) {
    isConnected.value = false;
    if (error instanceof Error) {
      handleBufferError(`Failed to start stream: ${error.message}`);
    } else {
      handleBufferError('Unknown error starting stream');
    }
  }
};

watch(() => props.url, (newUrl) => {
  if (newUrl && videoMse.value) {
    startStream(newUrl);
  }
});

onMounted(() => {
  if (videoMse.value) {
    handleVideoEvents();
    const streamUrl = props.url || DEFAULT_STREAM_CONFIG.url;
    startStream(streamUrl);
  }
});

onUnmounted(() => {
  wsService?.disconnect();
  cleanup();
});
</script>

<style scoped>
.monitor-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.monitor-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.error-message {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  background-color: rgba(255, 238, 238, 0.95);
  border: 1px solid #fcc;
  border-radius: 4px;
  padding: 6px 8px;
  color: #c33;
  font-size: 12px;
  z-index: 10;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 5;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>