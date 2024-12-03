import { Request, Response, Router } from "express";

import { config } from "../services/config";
import { MusicAnalysisService } from "../services/musicAnalysis/analysisService";
import { MusicTeacherCore } from "../services/musicTeacherCore";
import { SimpleAudioBuffer } from "../types/audio";

const router = Router();
const musicTeacher = new MusicTeacherCore();
const musicAnalysis = new MusicAnalysisService();

interface AudioAnalysisRequest {
  studentId: string;
  audioData: string; // base64 encoded audio data
}

interface ChatRequest {
  studentId: string;
  message: string;
}

// Debug middleware for all routes
router.use((req: Request, res: Response, next) => {
  console.log(`[DEBUG] ${req.method} ${req.path}`);
  next();
});

router.get("/health", (_req: Request, res: Response) => {
  console.log("[DEBUG] Health check endpoint called");
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      musicTeacher: "initialized",
      database: "connected",
    },
  });
});

// Handle live audio stream for analysis
router.post("/analyze/audio", async (req: Request<{}, {}, AudioAnalysisRequest>, res: Response) => {
  console.log("[DEBUG] Audio analysis endpoint called");
  try {
    const { studentId, audioData } = req.body;

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, "base64");

    // Create a simple AudioBuffer-like object
    const simpleAudioBuffer: SimpleAudioBuffer = {
      duration: audioBuffer.length / 44100, // Assuming 44.1kHz sample rate
      sampleRate: 44100,
      numberOfChannels: 1,
      length: audioBuffer.length,
      data: new Float32Array(audioBuffer),
    };

    // Analyze the audio
    const analysis = await musicAnalysis.analyzePerformance(simpleAudioBuffer);
    console.log("[DEBUG] Analysis result:", analysis);
    res.json(analysis);
  } catch (error) {
    console.error("[ERROR] Audio analysis failed:", error);
    res.status(500).json({
      error: "Failed to analyze audio",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Handle chat messages
router.post("/chat", async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  console.log("[DEBUG] Chat endpoint called");
  try {
    const { studentId, message } = req.body;

    // Get the current analysis context for this student
    const context = await musicTeacher.getStudentContext(studentId);

    // Extract the last analysis from the context
    const lastAnalysis = context.lastAnalysis || {
      transcription: { notes: [] },
      theory: {
        key: "C",
        chordProgression: [],
        scale: [],
        rhythmicPatterns: [],
        harmonicAnalysis: "",
      },
      feedback: {
        explanation: "",
        suggestions: [],
        nextConcepts: [],
      },
      visualization: {
        type: "piano-roll",
        data: null,
      },
    };

    // Generate response using the analysis service
    const response = await musicAnalysis.generateResponse(message, lastAnalysis);

    res.json({ response });
  } catch (error) {
    console.error("[ERROR] Chat processing failed:", error);
    res.status(500).json({
      error: "Failed to process chat message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Test endpoint to verify music analysis is working
router.get("/test/music-analysis", async (_req: Request, res: Response) => {
  console.log("[DEBUG] Music analysis test endpoint called");
  try {
    // Create a simple test buffer
    const testBuffer: SimpleAudioBuffer = {
      duration: 1.0,
      sampleRate: 44100,
      numberOfChannels: 1,
      length: 44100,
      data: new Float32Array(44100).fill(0),
    };

    // Test the analysis pipeline
    const analysis = await musicAnalysis.analyzePerformance(testBuffer);
    console.log("[DEBUG] Test analysis result:", analysis);

    res.json({
      status: "ok",
      message: "Music analysis system is ready",
      analysis: analysis,
      config: {
        sampleRate: testBuffer.sampleRate,
        channels: testBuffer.numberOfChannels,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ERROR] Music analysis test failed:", error);
    res.status(500).json({
      error: "Music analysis system error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router };
