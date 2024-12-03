declare module "@magenta/music" {
  export interface NoteSequence {
    notes: Array<Note>;
    totalTime: number;
    tempos?: Array<Tempo>;
    timeSignatures?: Array<TimeSignature>;
    keySignatures?: Array<KeySignature>;
    quantizationInfo?: QuantizationInfo;
  }

  export interface Note {
    pitch: number;
    startTime: number;
    endTime: number;
    velocity: number;
    program?: number;
    instrument?: number;
    isDrum?: boolean;
  }

  export interface Tempo {
    time: number;
    qpm: number;
  }

  export interface TimeSignature {
    time: number;
    numerator: number;
    denominator: number;
  }

  export interface KeySignature {
    time: number;
    key: number;
    scale: number;
  }

  export interface QuantizationInfo {
    stepsPerQuarter: number;
    stepsPerSecond?: number;
  }

  export interface AudioBuffer {
    sampleRate: number;
    length: number;
    duration: number;
    numberOfChannels: number;
    getChannelData(channel: number): Float32Array;
  }

  export class OnsetsAndFrames {
    constructor(checkpointURL: string);
    initialize(): Promise<void>;
    transcribe(audioBuffer: AudioBuffer): Promise<NoteSequence>;
    transcribeFromAudioBuffer(audioBuffer: AudioBuffer): Promise<NoteSequence>;
  }

  export class MusicVAE {
    constructor(checkpointURL: string);
    initialize(): Promise<void>;
    sample(numSamples: number, temperature?: number): Promise<NoteSequence[]>;
    continue(sequence: NoteSequence, temperature: number, length: number): Promise<NoteSequence>;
  }

  export class MusicRNN {
    constructor(checkpointURL: string);
    initialize(): Promise<void>;
    continueSequence(
      sequence: NoteSequence,
      steps: number,
      temperature?: number,
    ): Promise<NoteSequence>;
  }

  export class PianoGenie {
    constructor(checkpointURL: string);
    initialize(): Promise<void>;
    next(button: number, temperature?: number): Promise<number>;
  }

  // MIDI and Player utilities
  export class Player {
    constructor(soundFontURL?: string);
    start(sequence: NoteSequence): Promise<void>;
    stop(): void;
    isPlaying(): boolean;
    setTempo(qpm: number): void;
  }

  export class SoundFontPlayer {
    constructor(soundFontURL?: string);
    loadSamples(sequence: NoteSequence): Promise<void>;
    start(sequence: NoteSequence): Promise<void>;
    stop(): void;
    isPlaying(): boolean;
  }

  // Data structures
  export interface INoteSequence extends NoteSequence {
    id: string;
    filename: string;
    referenceNumber: number;
    collectionName: string;
    sourceUrl: string;
  }

  // Utility functions
  export namespace sequences {
    function clone(sequence: NoteSequence): NoteSequence;
    function isQuantizedSequence(sequence: NoteSequence): boolean;
    function quantizeNoteSequence(sequence: NoteSequence, stepsPerQuarter: number): NoteSequence;
  }

  // Constants
  export const DEFAULT_QUARTERS_PER_MINUTE: number;
  export const DEFAULT_STEPS_PER_QUARTER: number;
  export const DEFAULT_STEPS_PER_SECOND: number;
}
