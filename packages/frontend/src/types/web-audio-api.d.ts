declare module 'web-audio-api' {
  export class AudioContext {
    constructor()
    decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer>
    createMediaStreamSource(stream: MediaStream): AudioNode
    createScriptProcessor(
      bufferSize: number,
      numberOfInputChannels: number,
      numberOfOutputChannels: number
    ): ScriptProcessorNode
    sampleRate: number
  }

  export interface AudioBuffer {
    duration: number
    length: number
    numberOfChannels: number
    sampleRate: number
    getChannelData(channel: number): Float32Array
  }

  export interface AudioNode {
    connect(destination: AudioNode): void
    disconnect(): void
  }

  export interface ScriptProcessorNode extends AudioNode {
    onaudioprocess: ((event: AudioProcessingEvent) => void) | null
  }

  export interface AudioProcessingEvent {
    inputBuffer: AudioBuffer
  }
}
