import * as mm from "@magenta/music";

import { MusicAnalyzer } from "../music/analysis/musicAnalyzer";
import {
  AudioContext,
  AudioProcessingEvent,
  AudioSource,
  ProcessedAudio,
  SimpleAudioBuffer,
} from "../types/audio";

// Type declaration for Node.js environment
declare const process: {
  env: {
    [key: string]: string | undefined;
  };
  browser: boolean;
};

export class AudioProcessor {
  private musicAnalyzer: MusicAnalyzer;
  private audioContext: AudioContext | null = null;
  private isNode: boolean;

  constructor() {
    console.log("Audio processor initialized");
    this.musicAnalyzer = new MusicAnalyzer();
    this.isNode = typeof process !== "undefined" && !process.browser;
  }

  async processAudioStream(audioBuffer: SimpleAudioBuffer): Promise<ProcessedAudio> {
    try {
      // Get transcription and analysis from Magenta
      const analysis = await this.musicAnalyzer.transcribe(audioBuffer);

      return {
        originalBuffer: audioBuffer,
        transcription: {
          notes: analysis.notes,
          timing: {
            start: 0,
            end: audioBuffer.duration,
          },
        },
        melody: {
          notes: analysis.notes,
          pattern: this.detectMelodicPattern(analysis.notes),
        },
        harmony: {
          chords: this.detectChords(analysis.notes),
          progression: this.analyzeProgression(analysis.notes),
        },
      };
    } catch (error) {
      console.error("Error processing audio stream:", error);
      throw error;
    }
  }

  async processAudioSource(source: AudioSource): Promise<ProcessedAudio> {
    try {
      let audioBuffer: SimpleAudioBuffer;

      switch (source.type) {
        case "buffer":
          if (!source.buffer) {
            throw new Error("Buffer not provided");
          }
          audioBuffer = source.buffer;
          break;

        case "file":
          if (!source.data) {
            throw new Error("File data not provided");
          }
          audioBuffer = await this.decodeAudioData(source.data);
          break;

        case "stream":
          if (!source.stream) {
            throw new Error("Stream not provided");
          }
          audioBuffer = await this.processStream(source.stream);
          break;

        case "youtube":
        case "spotify":
        case "appleMusic":
          if (!source.url) {
            throw new Error("URL not provided");
          }
          throw new Error("External audio sources not implemented yet");

        default:
          throw new Error(`Unsupported audio source type: ${source.type}`);
      }

      return this.processAudioStream(audioBuffer);
    } catch (error) {
      console.error("Error processing audio source:", error);
      throw error;
    }
  }

  private async decodeAudioData(data: ArrayBuffer): Promise<SimpleAudioBuffer> {
    try {
      // Initialize audio context if needed
      if (!this.audioContext) {
        this.audioContext = await this.createAudioContext();
      }

      const decoded = await this.audioContext.decodeAudioData(data);
      return this.convertToSimpleAudioBuffer(decoded);
    } catch (error) {
      console.error("Error decoding audio data:", error);
      throw error;
    }
  }

  private async processStream(stream: any): Promise<SimpleAudioBuffer> {
    try {
      // Initialize audio context if needed
      if (!this.audioContext) {
        this.audioContext = await this.createAudioContext();
      }

      // Create buffer from stream
      const source = this.audioContext.createMediaStreamSource(stream);
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      const chunks: Float32Array[] = [];

      return new Promise((resolve, reject) => {
        processor.onaudioprocess = (e: AudioProcessingEvent) => {
          chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        };

        // After 5 seconds of recording, combine chunks and resolve
        setTimeout(() => {
          const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const combinedBuffer = new Float32Array(totalLength);
          let offset = 0;
          chunks.forEach((chunk) => {
            combinedBuffer.set(chunk, offset);
            offset += chunk.length;
          });

          resolve({
            data: combinedBuffer,
            sampleRate: this.audioContext!.sampleRate,
            numberOfChannels: 1,
            length: totalLength,
            duration: totalLength / this.audioContext!.sampleRate,
          });
        }, 5000);
      });
    } catch (error) {
      console.error("Error processing stream:", error);
      throw error;
    }
  }

  private async createAudioContext(): Promise<AudioContext> {
    if (this.isNode) {
      // Node.js environment
      const { AudioContext } = await import("web-audio-api");
      return new AudioContext();
    } else {
      // Browser environment
      const AudioContextClass =
        (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("AudioContext not supported in this environment");
      }
      return new AudioContextClass();
    }
  }

  private convertToSimpleAudioBuffer(audioBuffer: any): SimpleAudioBuffer {
    return {
      data: audioBuffer.getChannelData(0),
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      length: audioBuffer.length,
      duration: audioBuffer.duration,
    };
  }

  private detectMelodicPattern(
    notes: Array<{ pitch: number; startTime: number; endTime: number; velocity: number }>,
  ): string {
    // Implement melodic pattern detection
    // For now, return a placeholder
    return "basic";
  }

  private detectChords(
    notes: Array<{ pitch: number; startTime: number; endTime: number; velocity: number }>,
  ): string[] {
    // Implement chord detection
    // For now, return empty array
    return [];
  }

  private analyzeProgression(
    notes: Array<{ pitch: number; startTime: number; endTime: number; velocity: number }>,
  ): string[] {
    // Implement chord progression analysis
    // For now, return empty array
    return [];
  }
}
