import express from 'express';
import { chatWithOpenRouter } from '../services/chatbotService.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Limit context window to last 10 messages to save tokens/complexity
    const recentMessages = messages.slice(-10);

    const reply = await chatWithOpenRouter(recentMessages);
    
    res.json({ reply });
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
