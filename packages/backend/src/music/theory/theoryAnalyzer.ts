import { Chord, Scale, Key } from 'tonal';
import { MIDIData } from '../types';

export class TheoryAnalyzer {
  analyzeTheory(midiData: MIDIData) {
    const notes = this.extractNotes(midiData);
    
    return {
      key: this.detectKey(notes),
      chordProgression: this.analyzeChordProgression(notes),
      scale: this.detectScale(notes),
      harmonicAnalysis: this.analyzeHarmony(notes)
    };
  }

  private extractNotes(midiData: MIDIData): string[] {
    // Convert MIDI note numbers to note names (e.g., 60 -> "C4")
    return midiData.notes.map(note => {
      const noteName = this.midiNumberToNote(note.pitch);
      return noteName;
    });
  }

  private midiNumberToNote(midiNumber: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNumber / 12) - 1;
    const noteIndex = midiNumber % 12;
    return `${noteNames[noteIndex]}${octave}`;
  }

  private detectKey(notes: string[]): string {
    // Use Krumhansl-Schmuckler key-finding algorithm
    const keyScores = Key.detect(notes);
    return keyScores[0] || 'Unknown';
  }

  private analyzeChordProgression(notes: string[]): string[] {
    const chords: string[] = [];
    // Group notes into probable chords based on timing
    const timeSlice = 0.5; // Half-second intervals
    let currentTime = 0;
    
    while (currentTime < notes.length) {
      const timeSliceNotes = notes.slice(currentTime, currentTime + timeSlice);
      const detectedChord = Chord.detect(timeSliceNotes)[0];
      if (detectedChord) {
        chords.push(detectedChord);
      }
      currentTime += timeSlice;
    }
    
    return chords;
  }

  private detectScale(notes: string[]): string[] {
    const key = this.detectKey(notes);
    // Get possible scales for the detected key
    const possibleScales = Scale.detect(notes);
    return possibleScales.map(scale => `${key} ${scale}`);
  }

  private analyzeHarmony(notes: string[]): string {
    const chordProgression = this.analyzeChordProgression(notes);
    const key = this.detectKey(notes);
    
    // Convert chord names to Roman numeral analysis
    return this.toRomanNumerals(chordProgression, key);
  }

  private toRomanNumerals(chords: string[], key: string): string {
    // Convert chord progression to Roman numerals in the detected key
    return chords.map(chord => {
      const chordInfo = Chord.get(chord);
      const interval = Key.majorKey(key).intervals.indexOf(chordInfo.tonic);
      const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
      return romanNumerals[interval];
    }).join(' - ');
  }
}
