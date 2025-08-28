import { ref, type Ref } from 'vue';
import type { MSEState } from '../types';

export function useMSE(videoElement: Ref<HTMLVideoElement | null>) {
  const state = ref<MSEState>({
    sourceBuffer: null,
    queue: [],
    streamingStarted: false,
    mediaSource: null
  });

  const initMediaSource = (): MediaSource => {
    const mediaSource = new MediaSource();
    if (videoElement.value) {
      videoElement.value.src = URL.createObjectURL(mediaSource);
      videoElement.value.play();
    }
    state.value.mediaSource = mediaSource;
    return mediaSource;
  };

  const setupSourceBuffer = (codecInfo: string): void => {
    if (state.value.mediaSource) {
      try {
        state.value.sourceBuffer = state.value.mediaSource.addSourceBuffer(codecInfo);
        state.value.sourceBuffer.mode = 'segments';
        state.value.sourceBuffer.addEventListener('updateend', pushPacket);
      } catch (error) {
        throw new Error(`Failed to create SourceBuffer: ${error}`);
      }
    }
  };

  const pushPacket = (): void => {
    if (state.value.sourceBuffer && !state.value.sourceBuffer.updating) {
      if (state.value.queue.length > 0) {
        const packet = state.value.queue.shift();
        if (packet) {
          try {
            state.value.sourceBuffer.appendBuffer(packet);
          } catch (error) {
            console.error('Failed to append buffer:', error);
          }
        }
      } else {
        state.value.streamingStarted = false;
      }
    }
    
    if (videoElement.value?.buffered && videoElement.value.buffered.length > 0) {
      if (typeof document.hidden !== 'undefined' && document.hidden) {
        const bufferedEnd = videoElement.value.buffered.end(videoElement.value.buffered.length - 1);
        videoElement.value.currentTime = bufferedEnd - 0.5;
      }
    }
  };

  const handlePacket = (packet: ArrayBuffer): void => {
    if (!state.value.streamingStarted && state.value.sourceBuffer) {
      try {
        state.value.sourceBuffer.appendBuffer(packet);
        state.value.streamingStarted = true;
      } catch (error) {
        throw new Error(`Failed to append initial packet: ${error}`);
      }
      return;
    }

    if (state.value.sourceBuffer) {
      state.value.queue.push(packet);
      if (!state.value.sourceBuffer.updating) {
        pushPacket();
      }
    }
  };

  const cleanup = (): void => {
    if (state.value.sourceBuffer) {
      state.value.sourceBuffer.removeEventListener('updateend', pushPacket);
    }
    if (state.value.mediaSource) {
      try {
        if (state.value.mediaSource.readyState === 'open') {
          state.value.mediaSource.endOfStream();
        }
      } catch (error) {
        console.error('Error ending media source stream:', error);
      }
    }
    if (videoElement.value) {
      videoElement.value.src = '';
      videoElement.value.load();
    }
    state.value = {
      sourceBuffer: null,
      queue: [],
      streamingStarted: false,
      mediaSource: null
    };
  };

  const handleVideoEvents = (): void => {
    if (!videoElement.value) return;

    videoElement.value.addEventListener('pause', () => {
      if (videoElement.value?.buffered && videoElement.value.buffered.length > 0) {
        const currentTime = videoElement.value.currentTime;
        const bufferedEnd = videoElement.value.buffered.end(videoElement.value.buffered.length - 1);
        
        if (currentTime > bufferedEnd) {
          videoElement.value.currentTime = bufferedEnd - 0.1;
          videoElement.value.play();
        }
      }
    });
  };

  return {
    state,
    initMediaSource,
    setupSourceBuffer,
    handlePacket,
    handleVideoEvents,
    cleanup
  };
}