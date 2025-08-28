export interface StreamConfig {
  url: string;
  codecs: string;
}

export interface WebSocketMessage {
  type: string;
  value: string;
}

export interface MSEState {
  sourceBuffer: SourceBuffer | null;
  queue: ArrayBuffer[];
  streamingStarted: boolean;
  mediaSource: MediaSource | null;
}

export interface VideoPlayerConfig {
  autoplay?: boolean;
  muted?: boolean;
  playsinline?: boolean;
  style?: string;
}

export interface StreamError {
  type: 'connection' | 'media' | 'buffer' | 'unknown';
  message: string;
  timestamp: number;
}