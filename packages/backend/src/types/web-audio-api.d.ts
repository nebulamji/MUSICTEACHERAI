declare module "web-audio-api" {
  export class AudioContext {
    constructor();
    sampleRate: number;
    currentTime: number;
    destination: AudioDestinationNode;
    listener: AudioListener;
    state: string;

    createBuffer(numberOfChannels: number, length: number, sampleRate: number): AudioBuffer;
    createBufferSource(): AudioBufferSourceNode;
    createMediaStreamSource(stream: any): AudioNode;
    createScriptProcessor(
      bufferSize: number,
      numberOfInputChannels: number,
      numberOfOutputChannels: number,
    ): ScriptProcessorNode;

    decodeAudioData(
      audioData: ArrayBuffer,
      successCallback?: (decodedData: AudioBuffer) => void,
      errorCallback?: (error: Error) => void,
    ): Promise<AudioBuffer>;
  }

  export class AudioBuffer {
    sampleRate: number;
    length: number;
    duration: number;
    numberOfChannels: number;

    getChannelData(channel: number): Float32Array;
    copyFromChannel(
      destination: Float32Array,
      channelNumber: number,
      startInChannel?: number,
    ): void;
    copyToChannel(source: Float32Array, channelNumber: number, startInChannel?: number): void;
  }

  export class AudioBufferSourceNode {
    buffer: AudioBuffer | null;
    playbackRate: AudioParam;
    loop: boolean;
    loopStart: number;
    loopEnd: number;

    start(when?: number, offset?: number, duration?: number): void;
    stop(when?: number): void;
    connect(destination: AudioNode): void;
    disconnect(): void;
  }

  export class ScriptProcessorNode extends AudioNode {
    onaudioprocess: ((event: AudioProcessingEvent) => void) | null;
    bufferSize: number;
  }

  export class AudioNode {
    context: AudioContext;
    numberOfInputs: number;
    numberOfOutputs: number;
    channelCount: number;
    channelCountMode: string;
    channelInterpretation: string;

    connect(destination: AudioNode, output?: number, input?: number): void;
    disconnect(): void;
  }

  export class AudioParam {
    value: number;
    defaultValue: number;
    minValue: number;
    maxValue: number;

    setValueAtTime(value: number, startTime: number): AudioParam;
    linearRampToValueAtTime(value: number, endTime: number): AudioParam;
    exponentialRampToValueAtTime(value: number, endTime: number): AudioParam;
  }

  export class AudioDestinationNode extends AudioNode {
    maxChannelCount: number;
  }

  export class AudioListener {
    positionX: AudioParam;
    positionY: AudioParam;
    positionZ: AudioParam;
    forwardX: AudioParam;
    forwardY: AudioParam;
    forwardZ: AudioParam;
    upX: AudioParam;
    upY: AudioParam;
    upZ: AudioParam;
  }

  export interface AudioProcessingEvent {
    playbackTime: number;
    inputBuffer: AudioBuffer;
    outputBuffer: AudioBuffer;
  }
}
