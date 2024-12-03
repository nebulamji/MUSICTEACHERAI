import { NoteSequence } from '@magenta/music/esm/protobuf';

export interface AudioSource {
    type: 'youtube' | 'spotify' | 'appleMusic' | 'file';
    url?: string;
    data?: Buffer;
}

export interface ProcessedAudio {
    buffer: AudioBuffer;
    metadata: {
        duration: number;
        sampleRate: number;
        channels: number;
    };
    analysis: {
        notes: NoteSequence;
        tempo: number;
        key: string;
    };
}

export interface TheoryVisualization {
    score?: HTMLElement;
    chordProgression?: string[];
    circleOfFifths?: any;
    examples?: NoteSequence[];
}

export interface MusicTheory {
    harmony: {
        key: string;
        chords: string[];
        progression: string[];
    };
    melody: {
        notes: string[];
        phrases: string[][];
    };
    rhythm: {
        timeSignature: string;
        tempo: number;
    };
}

export type DifficultyLevel = 'easier' | 'maintain' | 'harder';

export interface AdaptiveDifficulty {
    level: DifficultyLevel;
    adjustmentFactor: number;
}
