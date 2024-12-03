import * as mm from "@magenta/music";

export class MagentaModels {
  private static instance: MagentaModels;
  private onsetAndFrames: mm.OnsetsAndFrames | null = null;
  private pianoGenie: any | null = null; // Will type properly once integrated
  private musicVAE: mm.MusicVAE | null = null;
  private musicRNN: any | null = null; // Will type properly once integrated
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): MagentaModels {
    if (!MagentaModels.instance) {
      MagentaModels.instance = new MagentaModels();
    }
    return MagentaModels.instance;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log("Initializing Magenta models...");

      // Initialize Onsets and Frames for transcription
      this.onsetAndFrames = new mm.OnsetsAndFrames(
        "https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni",
      );
      await this.onsetAndFrames.initialize();
      console.log("Onsets and Frames initialized");

      // Initialize MusicVAE for melody generation
      this.musicVAE = new mm.MusicVAE(
        "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2",
      );
      await this.musicVAE.initialize();
      console.log("MusicVAE initialized");

      // Initialize Piano Genie
      // TODO: Add proper Piano Genie initialization
      console.log("Piano Genie initialization pending");

      // Initialize Music RNN for continuation
      // TODO: Add proper Music RNN initialization
      console.log("Music RNN initialization pending");

      this.initialized = true;
      console.log("All Magenta models initialized successfully");
    } catch (error) {
      console.error("Error initializing Magenta models:", error);
      throw error;
    }
  }

  async transcribeAudio(audioBuffer: AudioBuffer): Promise<mm.NoteSequence> {
    if (!this.initialized) await this.initialize();
    if (!this.onsetAndFrames) throw new Error("Onsets and Frames not initialized");

    return await this.onsetAndFrames.transcribe(audioBuffer);
  }

  async generateMelody(seed?: mm.NoteSequence): Promise<mm.NoteSequence> {
    if (!this.initialized) await this.initialize();
    if (!this.musicVAE) throw new Error("MusicVAE not initialized");

    if (seed) {
      // Generate continuation based on seed
      return await this.musicVAE.continue(seed, 0.8, 4);
    } else {
      // Generate new melody
      const samples = await this.musicVAE.sample(1, 0.8);
      return samples[0];
    }
  }

  async generateJazzProgression(): Promise<mm.NoteSequence> {
    if (!this.initialized) await this.initialize();
    if (!this.musicVAE) throw new Error("MusicVAE not initialized");

    // TODO: Implement jazz progression generation using Jazz dataset
    throw new Error("Jazz progression generation not implemented yet");
  }

  async generatePianoResponse(input: mm.NoteSequence): Promise<mm.NoteSequence> {
    if (!this.initialized) await this.initialize();

    // TODO: Implement piano response generation using Piano Transformer
    throw new Error("Piano response generation not implemented yet");
  }

  async getModel(modelType: "onsetAndFrames" | "musicVAE" | "pianoGenie" | "musicRNN") {
    if (!this.initialized) await this.initialize();

    switch (modelType) {
      case "onsetAndFrames":
        return this.onsetAndFrames;
      case "musicVAE":
        return this.musicVAE;
      case "pianoGenie":
        return this.pianoGenie;
      case "musicRNN":
        return this.musicRNN;
      default:
        throw new Error(`Unknown model type: ${modelType}`);
    }
  }
}
