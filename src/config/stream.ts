import type { StreamConfig, VideoPlayerConfig } from '../types';

export const DEFAULT_STREAM_CONFIG: StreamConfig = {
  url: 'ws://154.64.248.106:31984/api/ws?src=home',
  codecs: 'avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus'
};

export const DEFAULT_VIDEO_CONFIG: VideoPlayerConfig = {
  autoplay: true,
  muted: true,
  playsinline: true,
  style: 'width: 80vw; height: auto;'
};

export const WEBSOCKET_CONFIG = {
  maxReconnectAttempts: 3,
  reconnectDelay: 1000,
  binaryType: 'arraybuffer' as BinaryType
};

export const MSE_CONFIG = {
  sourceBufferMode: 'segments',
  bufferSeekOffset: 0.5,
  pauseSeekOffset: 0.1
};