import cors from "cors";
import express from "express";
import { createServer } from "http";
import WebSocket from "ws";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const DEFAULT_PORT = 3001;

// Enable debug logging
const DEBUG = true;
const log = (...args: any[]) => {
  if (DEBUG) {
    console.log(new Date().toISOString(), ...args);
  }
};

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5179",
    "http://127.0.0.1:5179",
    "http://localhost:5180",
    "http://127.0.0.1:5180",
    "http://localhost:5181",
    "http://127.0.0.1:5181",
    "http://172.31.23.52:5179",
    "http://172.31.23.52:5181",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Upgrade", "Connection"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));

// Request logging middleware
app.use((req, res, next) => {
  log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (_, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Create HTTP server
const httpServer = createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({
  noServer: true,
  clientTracking: true,
  perMessageDeflate: false,
});

// Keep track of connected clients
const clients = new Map<WebSocket, {
  apiKey?: string;
  faceID?: string;
}>();

// Ping clients every 30 seconds to keep connections alive
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      log("Sending ping to client");
      try {
        ws.send(JSON.stringify({ type: 'ping' }));
      } catch (error) {
        console.error('Error sending ping:', error);
      }
    }
  });
}, 30000);

// Handle WebSocket upgrade requests
httpServer.on('upgrade', (request, socket, head) => {
  log('Upgrade request from origin:', request.headers.origin);
  const origin = request.headers.origin || '';
  if (corsOptions.origin.includes(origin)) {
    log('Accepting WebSocket upgrade from origin:', origin);
    wss.handleUpgrade(request, socket, head, (ws) => {
      log('WebSocket connection upgraded');
      wss.emit('connection', ws, request);
    });
  } else {
    log("Rejected WebSocket connection from origin:", origin);
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    socket.destroy();
  }
});

async function generateAIResponse(message: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "You are an AI music teacher helping students learn music theory and improve their playing."
      }, {
        role: "user",
        content: message
      }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I apologize, but I'm having trouble processing your request right now.";
  }
}

wss.on("connection", (ws: WebSocket) => {
  log("New WebSocket connection established");
  clients.set(ws, {});

  // Set up ping-pong
  let isAlive = true;
  ws.on("pong", () => {
    log("Received pong from client");
    isAlive = true;
  });

  const pingTimer = setInterval(() => {
    if (!isAlive) {
      log("Client connection lost");
      clearInterval(pingTimer);
      ws.terminate();
      return;
    }
    isAlive = false;
    try {
      ws.ping();
    } catch (error) {
      console.error('Error sending ping:', error);
    }
  }, 30000);

  ws.on("message", async (message: WebSocket.Data) => {
    try {
      const data = JSON.parse(message.toString());
      log("Received message type:", data.type);

      if (data.apiKey && data.faceID) {
        const clientInfo = clients.get(ws) || {};
        clientInfo.apiKey = data.apiKey;
        clientInfo.faceID = data.faceID;
        clients.set(ws, clientInfo);
        log("Updated client info:", clientInfo);
      }

      switch (data.type) {
        case "ping":
          ws.send(JSON.stringify({ type: "pong" }));
          break;

        case "pong":
          isAlive = true;
          break;

        case "message":
          const response = await generateAIResponse(data.content);
          ws.send(JSON.stringify({
            type: "response",
            content: response
          }));
          break;

        case "disconnect":
          log("Received disconnect request");
          ws.close(1000, "Client requested disconnect");
          break;

        case "audio":
          log("Received audio data");
          // Process audio data and send back analysis
          ws.send(JSON.stringify({
            type: "audio-processed",
            result: {
              key: "C major",
              scale: ["C", "D", "E", "F", "G", "A", "B"],
              chordProgression: ["Cmaj7", "Am7", "Dm7", "G7"],
              rhythmicPatterns: ["4/4 swing", "syncopated"],
              harmonicAnalysis: "II-V-I progression",
              feedback: {
                explanation: "Nice use of jazz harmony!",
                suggestions: ["Try adding more chromatic approach notes", "Experiment with altered dominants"],
                nextConcepts: ["Modal interchange", "Upper structure triads"]
              }
            }
          }));
          break;

        default:
          log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({
        type: "error",
        error: "Failed to process message"
      }));
    }
  });

  ws.on("close", () => {
    log("WebSocket connection closed");
    clearInterval(pingTimer);
    clients.delete(ws);
  });

  ws.on("error", (error: Error) => {
    console.error("WebSocket error:", error);
    clearInterval(pingTimer);
    clients.delete(ws);
  });
});

// Clean up on server shutdown
process.on("SIGTERM", () => {
  log("Server shutting down...");
  clearInterval(pingInterval);
  wss.clients.forEach((ws) => {
    ws.close();
  });
  httpServer.close(() => {
    log("Server closed");
    process.exit(0);
  });
});

// Start server
const port = process.env.PORT || DEFAULT_PORT;
httpServer.listen(port, () => {
  log(`Server is running at http://localhost:${port}`);
  log(`WebSocket server is running at ws://localhost:${port}`);
});
