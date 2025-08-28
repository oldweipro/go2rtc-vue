import type { WebSocketMessage, StreamError } from '../types';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: (data: string | ArrayBuffer) => void;
  private onError: (error: StreamError) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000;

  constructor(
    url: string,
    onMessage: (data: string | ArrayBuffer) => void,
    onError: (error: StreamError) => void
  ) {
    this.url = url;
    this.onMessage = onMessage;
    this.onError = onError;
  }

  connect(codecs: string): void {
    try {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        const message: WebSocketMessage = {
          type: 'mse',
          value: codecs
        };
        this.ws?.send(JSON.stringify(message));
      };

      this.ws.onmessage = (event) => {
        this.onMessage(event.data);
      };

      this.ws.onclose = () => {
        this.handleConnectionLoss();
      };

      this.ws.onerror = () => {
        this.onError({
          type: 'connection',
          message: 'WebSocket connection failed',
          timestamp: Date.now()
        });
      };
    } catch (error) {
      this.onError({
        type: 'connection',
        message: `Failed to create WebSocket: ${error}`,
        timestamp: Date.now()
      });
    }
  }

  private handleConnectionLoss(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect('avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus');
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.onError({
        type: 'connection',
        message: 'Maximum reconnection attempts reached',
        timestamp: Date.now()
      });
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}