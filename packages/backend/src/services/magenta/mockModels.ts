// Mock implementation of Magenta models for development/fallback
import { SimpleAudioBuffer } from "../../types/audio";

export interface MockNote {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
}

export interface MockNoteSequence {
  notes: MockNote[];
  totalTime: number;
  tempos?: Array<{ time: number; qpm: number }>;
}

export class MockMagentaModels {
  private static instance: MockMagentaModels;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): MockMagentaModels {
    if (!MockMagentaModels.instance) {
      MockMagentaModels.instance = new MockMagentaModels();
    }
    return MockMagentaModels.instance;
  }

  async initialize() {
    if (this.initialized) return;
    console.log("Initializing Mock Magenta models...");
    this.initialized = true;
  }

  async transcribeAudio(audioBuffer: SimpleAudioBuffer): Promise<MockNoteSequence> {
    // Generate mock notes based on audio buffer length
    const notes: MockNote[] = [];
    const duration = audioBuffer.duration;
    const numNotes = Math.floor(duration * 4); // 4 notes per second

    for (let i = 0; i < numNotes; i++) {
      notes.push({
        pitch: 60 + Math.floor(Math.random() * 12), // Random pitch in one octave
        startTime: i * 0.25,
        endTime: (i + 1) * 0.25,
        velocity: 80,
      });
    }

    return {
      notes,
      totalTime: duration,
      tempos: [{ time: 0, qpm: 120 }],
    };
  }

  async generateMelody(seed?: MockNoteSequence): Promise<MockNoteSequence> {
    // Generate a simple melody
    const notes: MockNote[] = [];
    const duration = 4.0; // 4 seconds
    const numNotes = 16; // 16th notes

    for (let i = 0; i < numNotes; i++) {
      notes.push({
        pitch: 60 + Math.floor(Math.random() * 12),
        startTime: i * 0.25,
        endTime: (i + 1) * 0.25,
        velocity: 80,
      });
    }

    return {
      notes,
      totalTime: duration,
      tempos: [{ time: 0, qpm: 120 }],
    };
  }

  async generateJazzProgression(): Promise<MockNoteSequence> {
    // Generate a simple ii-V-I progression
    const progression = [
      { root: 62, chord: "min7" }, // D minor 7
      { root: 67, chord: "7" }, // G dominant 7
      { root: 60, chord: "maj7" }, // C major 7
    ];

    const notes: MockNote[] = [];
    let time = 0;

    progression.forEach((chord) => {
      // Add chord tones
      const chordTones = this.getChordTones(chord.root, chord.chord);
      chordTones.forEach((pitch) => {
        notes.push({
          pitch,
          startTime: time,
          endTime: time + 1.0,
          velocity: 80,
        });
      });
      time += 1.0;
    });

    return {
      notes,
      totalTime: time,
      tempos: [{ time: 0, qpm: 120 }],
    };
  }

  private getChordTones(root: number, type: string): number[] {
    switch (type) {
      case "min7":
        return [root, root + 3, root + 7, root + 10];
      case "7":
        return [root, root + 4, root + 7, root + 10];
      case "maj7":
        return [root, root + 4, root + 7, root + 11];
      default:
        return [root];
    }
  }
}
