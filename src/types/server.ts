export interface ServerConfig {
  host: string;
  port: number;
  wsPort?: number;
}

export interface Stream {
  name: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}