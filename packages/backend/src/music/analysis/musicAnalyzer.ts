import { MockMagentaModels, MockNoteSequence } from "../../services/magenta/mockModels";
import { SimpleAudioBuffer } from "../../types/audio";

export interface MusicAnalysis {
  notes: Array<{
    pitch: number;
    startTime: number;
    endTime: number;
    velocity: number;
  }>;
  tempo: number;
  key: string;
  timeSignature: {
    numerator: number;
    denominator: number;
  };
}

export class MusicAnalyzer {
  private magentaModels: MockMagentaModels;
  private initialized: boolean = false;

  constructor() {
    console.log("Music analyzer initialized");
    this.magentaModels = MockMagentaModels.getInstance();
  }

  async initializeModels() {
    if (this.initialized) return;

    try {
      await this.magentaModels.initialize();
      this.initialized = true;
      console.log("Mock Magenta models initialized successfully");
    } catch (error) {
      console.error("Error initializing mock models:", error);
      throw error;
    }
  }

  async transcribe(audioBuffer: SimpleAudioBuffer): Promise<MusicAnalysis> {
    if (!this.initialized) {
      await this.initializeModels();
    }

    try {
      // Get transcription from mock models
      const transcription = await this.magentaModels.transcribeAudio(audioBuffer);

      // Analyze the transcription
      const tempo = this.estimateTempo(transcription.notes);
      const key = this.detectKey(transcription.notes);

      return {
        notes: transcription.notes,
        tempo,
        key,
        timeSignature: {
          numerator: 4, // Default to 4/4 for now
          denominator: 4,
        },
      };
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }

  async generateDemonstration(options: {
    concepts: string[];
    approaches: any[];
  }): Promise<MockNoteSequence> {
    if (!this.initialized) {
      await this.initializeModels();
    }

    try {
      // Generate demonstration based on concepts
      const seed = await this.createSeedSequence(options.concepts);
      return await this.magentaModels.generateMelody(seed);
    } catch (error) {
      console.error("Demonstration generation error:", error);
      throw error;
    }
  }

  private async createSeedSequence(concepts: string[]): Promise<MockNoteSequence> {
    // Create a seed sequence based on musical concepts
    const hasJazz = concepts.some((c) => c.toLowerCase().includes("jazz"));

    if (hasJazz) {
      return await this.magentaModels.generateJazzProgression();
    }

    // Default to a simple melody
    return await this.magentaModels.generateMelody();
  }

  private estimateTempo(notes: Array<{ startTime: number; endTime: number }>): number {
    if (notes.length < 2) return 120; // Default tempo

    // Calculate average time between note onsets
    let totalInterval = 0;
    for (let i = 1; i < notes.length; i++) {
      totalInterval += notes[i].startTime - notes[i - 1].startTime;
    }
    const averageInterval = totalInterval / (notes.length - 1);

    // Convert to BPM (assuming quarter notes)
    return Math.round(60 / averageInterval);
  }

  private detectKey(notes: Array<{ pitch: number }>): string {
    // Simple key detection based on note frequency
    const pitchCounts = new Array(12).fill(0);
    notes.forEach((note) => {
      pitchCounts[note.pitch % 12]++;
    });

    // Major key profiles (simplified Krumhansl-Schmuckler)
    const keyProfiles = {
      C: [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
    };

    // For now, just return C as we need to implement proper key detection
    return "C";
  }
}
