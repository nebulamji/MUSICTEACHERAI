import { EventEmitter } from 'eventemitter3'

export interface SimliClientConfig {
  apiKey: string
  faceID: string
  handleSilence: boolean
  videoRef: React.RefObject<HTMLVideoElement>
  audioRef: React.RefObject<HTMLAudioElement>
}

export interface SimliEvents {
  connected: () => void
  disconnected: () => void
  failed: () => void
  started: () => void
}

export declare class SimliClient extends EventEmitter<SimliEvents> {
  constructor()
  Initialize(config: SimliClientConfig): void
  start(): Promise<void>
  close(): void
  sendAudioData(audioData: Uint8Array): void
}
