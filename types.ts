
export enum AppMode {
  STRATEGY = 'STRATEGY',
  CREATIVE = 'CREATIVE',
  CONTENT = 'CONTENT',
  LIVE = 'LIVE'
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  type?: 'text' | 'image' | 'video' | 'audio';
  metadata?: any;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

// Window interface for Veo key selection
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
