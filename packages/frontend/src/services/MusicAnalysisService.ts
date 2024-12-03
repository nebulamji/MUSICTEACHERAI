import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

export interface SimpleAudioBuffer {
  duration: number
  sampleRate: number
  numberOfChannels: number
  length: number
  data: Float32Array
}

export interface AnalysisResult {
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

export class MusicAnalysisService {
  private studentId: string
  private baseUrl: string

  constructor(studentId: string) {
    this.studentId = studentId
    this.baseUrl = process.env.REACT_APP_API_URL || API_BASE_URL
    console.log('Using API URL:', this.baseUrl)
  }

  async analyzeAudio(audioBuffer: SimpleAudioBuffer): Promise<AnalysisResult> {
    try {
      console.log('Analyzing audio...')
      // Convert audio buffer to base64
      const base64Audio = await this.convertBufferToBase64(audioBuffer)

      console.log('Sending analysis request...')
      const response = await axios.post(`${this.baseUrl}/analyze/audio`, {
        studentId: this.studentId,
        audioData: base64Audio,
      })

      console.log('Received analysis response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error analyzing audio:', error)
      throw error
    }
  }

  async sendMessage(text: string): Promise<string> {
    try {
      console.log('Sending chat message:', text)
      const response = await axios.post(`${this.baseUrl}/chat`, {
        studentId: this.studentId,
        message: text,
      })

      console.log('Received chat response:', response.data)
      return response.data.response
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing connection to:', this.baseUrl)
      const response = await axios.get(`${this.baseUrl}/health`)
      const isConnected = response.data.status === 'ok'
      console.log('Connection test result:', isConnected)
      return isConnected
    } catch (error) {
      console.error('Error testing connection:', error)
      return false
    }
  }

  private async convertBufferToBase64(buffer: SimpleAudioBuffer): Promise<string> {
    // Convert Float32Array to Int16Array for better compatibility
    const int16Array = new Int16Array(buffer.data.length)
    for (let i = 0; i < buffer.data.length; i++) {
      int16Array[i] = Math.max(-32768, Math.min(32767, buffer.data[i] * 32768))
    }

    // Create a Blob from the Int16Array
    const blob = new Blob([int16Array], { type: 'audio/raw' })

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1]
          resolve(base64String)
        } else {
          reject(new Error('Failed to convert buffer to base64'))
        }
      }
      reader.onerror = () => {
        reject(new Error('Error reading buffer'))
      }
      reader.readAsDataURL(blob)
    })
  }
}
