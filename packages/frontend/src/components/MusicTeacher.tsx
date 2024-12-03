import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MusicAnalysisService } from '../services/MusicAnalysisService'
import { SimliClient, SimliClientConfig } from '../SimliClient'
import { AudioAnalysisResult, ConversationMessage, SimpleAudioBuffer } from '../types'
import { MusicVisualization } from './MusicVisualization'
import { TheoryAnalysis } from './TheoryAnalysis'

// Get environment variables
const SIMLI_API_KEY = import.meta.env.VITE_SIMLI_API_KEY
const SIMLI_FACE_ID = import.meta.env.VITE_SIMLI_FACE_ID
const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY

// Debug log environment variables
console.log('Environment Variables:', {
    SIMLI_API_KEY: SIMLI_API_KEY ? 'Present' : 'Missing',
    SIMLI_FACE_ID: SIMLI_FACE_ID ? 'Present' : 'Missing',
    DEEPGRAM_API_KEY: DEEPGRAM_API_KEY ? 'Present' : 'Missing',
    OPENAI_API_KEY: OPENAI_API_KEY ? 'Present' : 'Missing',
    ELEVENLABS_API_KEY: ELEVENLABS_API_KEY ? 'Present' : 'Missing'
})

// Verify all required environment variables
const missingVars = []
if (!SIMLI_API_KEY) missingVars.push('SIMLI_API_KEY')
if (!SIMLI_FACE_ID) missingVars.push('SIMLI_FACE_ID')
if (!DEEPGRAM_API_KEY) missingVars.push('DEEPGRAM_API_KEY')
if (!OPENAI_API_KEY) missingVars.push('OPENAI_API_KEY')
if (!ELEVENLABS_API_KEY) missingVars.push('ELEVENLABS_API_KEY')

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '))
}

export const MusicTeacher: React.FC = () => {
    // State declarations
    const [isRecording, setIsRecording] = useState(false)
    const [analysis, setAnalysis] = useState<AudioAnalysisResult | null>(null)
    const [conversation, setConversation] = useState<ConversationMessage[]>([])
    const [inputText, setInputText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [isTeacherReady, setIsTeacherReady] = useState(false)

    // Ref declarations
    const audioContextRef = useRef<AudioContext | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const analysisServiceRef = useRef<MusicAnalysisService | null>(null)
    const simliClientRef = useRef<SimliClient | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Callback declarations
    const addToConversation = useCallback((role: 'user' | 'teacher', content: string) => {
        setConversation(prev => [...prev, { role, content }])
    }, [])

    useEffect(() => {
        const initializeServices = async () => {
            // Initialize analysis service
            analysisServiceRef.current = new MusicAnalysisService('user-1')

            // Initialize Simli client
            if (SIMLI_API_KEY && SIMLI_FACE_ID) {
                try {
                    console.log('Initializing Simli client...')
                    simliClientRef.current = new SimliClient()
                    const config: SimliClientConfig = {
                        apiKey: SIMLI_API_KEY,
                        faceID: SIMLI_FACE_ID,
                        handleSilence: true,
                        videoRef,
                        audioRef
                    }
                    console.log('Simli config:', {
                        ...config,
                        apiKey: 'HIDDEN',
                        videoRef: config.videoRef ? 'Present' : 'Missing',
                        audioRef: config.audioRef ? 'Present' : 'Missing'
                    })

                    simliClientRef.current.Initialize(config)

                    // Set up Simli event listeners
                    simliClientRef.current.on('connected', () => {
                        console.log('Teacher connected')
                        setIsTeacherReady(true)
                    })

                    simliClientRef.current.on('disconnected', () => {
                        console.log('Teacher disconnected')
                        setIsTeacherReady(false)
                    })

                    simliClientRef.current.on('failed', () => {
                        console.error('Teacher connection failed')
                        setIsTeacherReady(false)
                    })

                    // Start Simli client
                    console.log('Starting Simli client...')
                    await simliClientRef.current.start()
                    console.log('Simli client started successfully')
                } catch (error) {
                    console.error('Failed to initialize Simli client:', error)
                    setIsTeacherReady(false)
                }
            } else {
                console.warn('Simli integration disabled: missing credentials')
                setIsTeacherReady(false)
            }

            // Test backend connection
            try {
                const connected = await analysisServiceRef.current.testConnection()
                setIsConnected(connected)
                if (connected) {
                    addToConversation('teacher', 'Hello! I\'m your AI music teacher. You can either play your instrument or upload an audio file, and I\'ll help you analyze and improve your music.')
                } else {
                    addToConversation('teacher', 'Unable to connect to the server. Please try again later.')
                }
            } catch (error) {
                console.error('Connection test failed:', error)
                addToConversation('teacher', 'Unable to connect to the server. Please try again later.')
            }
        }

        initializeServices()

        // Cleanup
        return () => {
            if (simliClientRef.current) {
                console.log('Closing Simli client...')
                simliClientRef.current.close()
            }
        }
    }, [addToConversation])

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext()
            }

            mediaRecorderRef.current = new MediaRecorder(stream)
            mediaRecorderRef.current.ondataavailable = (e) => {
                chunksRef.current.push(e.data)
            }

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
                await processAudio(audioBlob)
                chunksRef.current = []
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)
            addToConversation('teacher', 'I\'m listening to your playing...')
        } catch (error) {
            console.error('Error starting recording:', error)
            addToConversation('teacher', 'I had trouble accessing your microphone. Please make sure you\'ve granted permission.')
        }
    }, [addToConversation])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            addToConversation('teacher', 'Processing your performance...')
        }
    }, [addToConversation])

    const processAudio = async (audioBlob: Blob) => {
        try {
            setIsLoading(true)
            const arrayBuffer = await audioBlob.arrayBuffer()
            const audioContext = new AudioContext()
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

            // Send audio data to Simli for lip sync if available
            if (simliClientRef.current && isTeacherReady) {
                console.log('Sending audio data to Simli...')
                const audioData = new Uint8Array(arrayBuffer)
                simliClientRef.current.sendAudioData(audioData)
                console.log('Audio data sent to Simli')
            }

            const simpleBuffer: SimpleAudioBuffer = {
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                numberOfChannels: audioBuffer.numberOfChannels,
                length: audioBuffer.length,
                data: audioBuffer.getChannelData(0)
            }

            const result = await analysisServiceRef.current?.analyzeAudio(simpleBuffer)
            if (result) {
                setAnalysis(result)
                addToConversation('teacher', 'I\'ve analyzed your playing. Let me share my thoughts...')
            }
        } catch (error) {
            console.error('Error processing audio:', error)
            addToConversation('teacher', 'I had trouble analyzing your audio. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setIsLoading(true)
            addToConversation('teacher', 'Processing your audio file...')
            try {
                const audioBlob = await file.arrayBuffer()
                const audioContext = new AudioContext()
                const audioBuffer = await audioContext.decodeAudioData(audioBlob)

                const simpleBuffer: SimpleAudioBuffer = {
                    duration: audioBuffer.duration,
                    sampleRate: audioBuffer.sampleRate,
                    numberOfChannels: audioBuffer.numberOfChannels,
                    length: audioBuffer.length,
                    data: audioBuffer.getChannelData(0)
                }

                const result = await analysisServiceRef.current?.analyzeAudio(simpleBuffer)
                if (result) {
                    setAnalysis(result)
                    addToConversation('teacher', 'I\'ve analyzed your audio file. Here\'s what I found...')
                }
            } catch (error) {
                console.error('Error processing file:', error)
                addToConversation('teacher', 'I had trouble processing your audio file. Please make sure it\'s a valid audio format.')
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputText.trim()) return

        const userMessage = inputText
        setInputText('')
        addToConversation('user', userMessage)

        try {
            const response = await analysisServiceRef.current?.sendMessage(userMessage)
            if (response) {
                addToConversation('teacher', response)
            }
        } catch (error) {
            console.error('Error sending message:', error)
            addToConversation('teacher', 'I had trouble processing your message. Please try again.')
        }
    }

    return (
        <div className="flex h-screen">
            {/* Left panel - Teacher Avatar and Conversation */}
            <div className="w-1/2 p-4 flex flex-col">
                {/* Teacher Avatar */}
                <div className="mb-4 relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <audio ref={audioRef} autoPlay />

                    {/* Connection status overlay */}
                    {!isTeacherReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                            {SIMLI_API_KEY && SIMLI_FACE_ID ?
                                (isConnected ? 'Connecting to teacher...' : 'Unable to connect to teacher') :
                                'Teacher avatar disabled: missing credentials'
                            }
                        </div>
                    )}
                </div>

                {/* Conversation history */}
                <div className="conversation-container flex-1 mb-4 bg-gray-100 rounded p-4">
                    {conversation.map((msg, i) => (
                        <div key={i} className={`message ${msg.role}`}>
                            <strong>{msg.role === 'teacher' ? 'Teacher: ' : 'You: '}</strong>
                            {msg.content}
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div className="flex space-x-4">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`recording-button px-4 py-2 rounded ${
                                isRecording ? 'bg-red-500 active' : 'bg-blue-500'
                            } text-white ${!isConnected && 'opacity-50 cursor-not-allowed'}`}
                            disabled={!isConnected}
                        >
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </button>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="audio-upload"
                            disabled={!isConnected}
                        />
                        <label
                            htmlFor="audio-upload"
                            className={`px-4 py-2 bg-green-500 text-white rounded cursor-pointer ${
                                !isConnected && 'opacity-50 cursor-not-allowed'
                            }`}
                        >
                            Upload Audio
                        </label>
                    </div>

                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 px-4 py-2 border rounded"
                            placeholder="Ask me about music theory..."
                            disabled={!isConnected}
                        />
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-blue-500 text-white rounded ${
                                !isConnected && 'opacity-50 cursor-not-allowed'
                            }`}
                            disabled={!isConnected}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>

            {/* Right panel - Analysis and Visualization */}
            <div className="w-1/2 p-4 bg-gray-50 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-xl">Analyzing music...</div>
                    </div>
                ) : analysis ? (
                    <div className="space-y-6">
                        <MusicVisualization
                            notes={analysis.transcription.notes}
                            width={800}
                            height={200}
                        />
                        <TheoryAnalysis
                            theory={analysis.theory}
                            feedback={analysis.feedback}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        {isConnected ?
                            'Record or upload audio to see analysis' :
                            'Connect to server to start analysis'
                        }
                    </div>
                )}
            </div>
        </div>
    )
}
