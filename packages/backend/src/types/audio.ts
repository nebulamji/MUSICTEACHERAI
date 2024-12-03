export interface SimpleAudioBuffer {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  length: number;
  data: Float32Array;
}

export interface ProcessedAudio {
  transcription?: {
    notes: Array<{
      pitch: number;
      startTime: number;
      endTime: number;
      velocity: number;
    }>;
    timing: {
      start: number;
      end: number;
    };
  };
  melody?: {
    notes: Array<{
      pitch: number;
      startTime: number;
      endTime: number;
      velocity: number;
    }>;
    pattern: string;
  };
  harmony?: {
    chords: string[];
    progression: string[];
  };
  originalBuffer: SimpleAudioBuffer;
}

export type AudioSourceType = "buffer" | "file" | "stream" | "youtube" | "spotify" | "appleMusic";

export interface AudioSource {
  type: AudioSourceType;
  buffer?: SimpleAudioBuffer;
  data?: ArrayBuffer;
  stream?: any; // MediaStream in browser, custom type in Node
  url?: string;
}

// Browser-specific types for Node environment
export interface AudioContext {
  createMediaStreamSource(stream: any): any;
  createScriptProcessor(
    bufferSize: number,
    numberOfInputChannels: number,
    numberOfOutputChannels: number,
  ): any;
  decodeAudioData(audioData: ArrayBuffer): Promise<any>;
  sampleRate: number;
}

export interface AudioProcessingEvent {
  inputBuffer: {
    getChannelData(channel: number): Float32Array;
  };
}

declare global {
  interface Window {
    AudioContext: {
      new (): AudioContext;
    };
  }
}
