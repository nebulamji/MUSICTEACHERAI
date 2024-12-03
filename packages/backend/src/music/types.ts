export interface MIDIData {
  notes: Array<{
    pitch: number;
    startTime: number;
    endTime: number;
    velocity: number;
  }>;
  totalTime: number;
  tempos: Array<{
    time: number;
    qpm: number;
  }>;
}

export interface Score {
  measures: Array<{
    notes: Array<Note>;
    timeSignature: string;
    keySignature: string;
  }>;
}

export interface MusicAnalysis {
  midi: MIDIData;
  notation: Score;
  theory: {
    key: string;
    chordProgression: string[];
    scale: string[];
    harmonicAnalysis: string;
  };
  feedback: {
    technical: string[];
    theoretical: string[];
    suggestions: string[];
  };
}

export interface Note {
  pitch: string;  // e.g., 'C4'
  duration: string;  // e.g., 'q' for quarter note
  accidental?: string;
  articulation?: string;
}
