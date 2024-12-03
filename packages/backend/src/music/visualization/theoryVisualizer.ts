import { VexFlow } from 'vexflow';
import { Chord, Scale } from 'tonal';
import { Score, Note } from '../types';

export class TheoryVisualizer {
  private vf: any;
  private context: any;

  constructor(containerId: string) {
    this.vf = new VexFlow.Flow();
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container not found');
    
    this.context = this.vf.Context.create(container);
  }

  renderScore(score: Score) {
    const system = this.context.System();
    
    score.measures.forEach((measure, index) => {
      const stave = this.vf.Stave(index * 250, 0, 250);
      
      if (index === 0) {
        stave.addClef('treble').addTimeSignature(measure.timeSignature);
      }
      
      stave.addKeySignature(measure.keySignature);
      
      const notes = measure.notes.map(note => 
        this.createVexFlowNote(note)
      );
      
      const voice = new this.vf.Voice()
        .addTickables(notes);
      
      new this.vf.Formatter()
        .joinVoices([voice])
        .format([voice], 250);
      
      voice.draw(this.context, stave);
    });
  }

  private createVexFlowNote(note: Note) {
    return new this.vf.StaveNote({
      clef: 'treble',
      keys: [note.pitch],
      duration: note.duration,
      ...(note.accidental && { addAccidental: 0, new: this.vf.Accidental(note.accidental) }),
      ...(note.articulation && { addArticulation: 0, new: this.vf.Articulation(note.articulation) })
    });
  }

  renderChordDiagram(chord: string) {
    const chordInfo = Chord.get(chord);
    const fretboard = new this.vf.Fretboard({
      el: '#chord-diagram',
      width: 200,
      height: 300,
      stringCount: 6,
      fretCount: 5
    });

    const positions = this.calculateChordPositions(chordInfo);
    fretboard.draw(positions);
  }

  private calculateChordPositions(chordInfo: any) {
    return chordInfo.notes.map((note: string, index: number) => ({
      string: index + 1,
      fret: this.calculateFretPosition(note),
      finger: index + 1
    }));
  }

  private calculateFretPosition(note: string): number {
    // Basic fret position calculation - can be expanded
    const noteMap: { [key: string]: number } = {
      'E': 0, 'F': 1, 'F#': 2, 'G': 3, 'G#': 4,
      'A': 5, 'A#': 6, 'B': 7, 'C': 8, 'C#': 9,
      'D': 10, 'D#': 11
    };
    return noteMap[note.replace(/\d/, '')] || 0;
  }

  renderScaleDiagram(scale: string) {
    const scaleInfo = Scale.get(scale);
    const keyboard = new this.vf.PianoKeyboard({
      el: '#scale-diagram',
      width: 500,
      height: 150,
      startKey: 48, // C4
      endKey: 72  // C6
    });

    const highlightedKeys = this.calculateScaleKeys(scaleInfo);
    keyboard.draw(highlightedKeys);
  }

  private calculateScaleKeys(scaleInfo: any) {
    return scaleInfo.notes.map((note: string) => ({
      note: note,
      color: '#4CAF50',
      label: note
    }));
  }

  renderCircleOfFifths() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "400");
    svg.setAttribute("height", "400");
    
    const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
    const radius = 150;
    const center = { x: 200, y: 200 };

    // Draw outer circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", center.x.toString());
    circle.setAttribute("cy", center.y.toString());
    circle.setAttribute("r", radius.toString());
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "black");
    svg.appendChild(circle);

    // Draw key names
    keys.forEach((key, index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", x.toString());
      text.setAttribute("y", y.toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.textContent = key;
      svg.appendChild(text);
    });

    // Draw connecting lines
    keys.forEach((_, index) => {
      const startAngle = (index * 30 - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * 30 - 90) * (Math.PI / 180);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", (center.x + radius * Math.cos(startAngle)).toString());
      line.setAttribute("y1", (center.y + radius * Math.sin(startAngle)).toString());
      line.setAttribute("x2", (center.x + radius * Math.cos(endAngle)).toString());
      line.setAttribute("y2", (center.y + radius * Math.sin(endAngle)).toString());
      line.setAttribute("stroke", "black");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    });

    const container = document.getElementById('circle-of-fifths');
    if (container) {
      container.appendChild(svg);
    }
  }

  // Additional helper methods for interactive features
  highlightNote(note: string) {
    // Highlight a specific note on the current visualization
  }

  animateProgression(chordProgression: string[]) {
    // Animate through a chord progression
  }

  clearVisualizations() {
    this.context.clear();
  }
}
