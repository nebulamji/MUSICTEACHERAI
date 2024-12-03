import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
