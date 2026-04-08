const express = require('express');
const { protect } = require('../middleware/auth');
const PolicyChunk = require('../models/PolicyChunk');
const Conversation = require('../models/Conversation');
const ragService = require('../services/ragService');

const router = express.Router();


// List all unique policies
router.get('/list', protect, async (req, res) => {
  try {
    const titles = await PolicyChunk.distinct('title');
    res.json(titles.map(title => ({ title })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch chat history
router.get('/chat/history', protect, async (req, res) => {
  try {
    const history = await Conversation.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// AI Chat Endpoint
router.post('/chat', protect, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });
    
    const result = await ragService.processQuery(query);
    
    // Save to persistence
    await Conversation.create({
      user: req.user.id,
      query,
      answer: result.answer,
      sources: result.sources
    });

    res.json(result);
  } catch (err) {
    console.error('Chat processing error:', err);
    res.status(500).json({ message: 'Error processing your request' });
  }
});

module.exports = router;
