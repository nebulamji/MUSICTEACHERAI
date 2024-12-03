import { NoteSequence } from '@magenta/music/esm/protobuf';

export interface MusicTheory {
    harmony: {
        key: string;
        chords: string[];
        progression: string[];
        tonality?: 'major' | 'minor';
    };
    melody: {
        notes: string[];
        phrases: string[][];
        motifs: string[][];
    };
    rhythm: {
        timeSignature: string;
        tempo: number;
        patterns: string[];
    };
    form: {
        sections: string[];
        structure: string;
    };
    analysis: {
        complexity: number;
        difficulty: number;
        style: string;
    };
}

export interface TheoryAnalysis {
    notes: NoteSequence;
    theory: MusicTheory;
    suggestions: string[];
}
