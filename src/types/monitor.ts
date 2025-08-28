export interface Monitor {
  id: string;
  name: string;
  url: string;
  rtspUrl?: string;
  isActive: boolean;
  createdAt: number;
}

export interface MonitorGridConfig {
  layout: '1x1' | '2x2' | '3x3' | '4x4' | '5x5';
  selectedMonitors: string[];
}

export type GridLayout = '1x1' | '2x2' | '3x3' | '4x4' | '5x5';