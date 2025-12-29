import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import briefingRoutes from './routes/briefing.js';
import chatRoutes from './routes/chat.js';
import filesRoutes from './routes/files.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/briefing', briefingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/files', filesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 PersonalOS backend running on port ${PORT}`);
  console.log(`📂 PersonalOS directory: ${process.env.PERSONALOS_PATH}`);
});
