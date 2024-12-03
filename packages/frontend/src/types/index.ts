export interface AudioAnalysisResult {
  transcription: {
    notes: Array<{
      pitch: number
      startTime: number
      endTime: number
      velocity: number
    }>
  }
  theory: {
    key: string
    chordProgression: string[]
    scale: string[]
    rhythmicPatterns: string[]
    harmonicAnalysis: string
  }
  feedback: {
    explanation: string
    suggestions: string[]
    nextConcepts: string[]
  }
  visualization: {
    type: 'score' | 'piano-roll' | 'chord-chart'
    data: any
  }
}

export interface ConversationMessage {
  role: 'user' | 'teacher'
  content: string
}

export interface SimpleAudioBuffer {
  duration: number
  sampleRate: number
  numberOfChannels: number
  length: number
  data: Float32Array
}
