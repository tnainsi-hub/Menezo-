const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 1. Safe MongoDB Connection
const MONGO_URI = process.env.Mongo_DB || process.env.MONGO_URI || process.env.MONGODB_URI;

let isDbConnected = false;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      isDbConnected = true;
      console.log('🍃 MongoDB Database connected successfully!');
    })
    .catch((err) => {
      console.log('⚠️ MongoDB Connection Failed (App will still run):', err.message);
    });
} else {
  console.log('⚠️ Warning: Mongo_DB variable render par nahi mila.');
}

// 2. Database Schema
const ScriptSchema = new mongoose.Schema({
  type: String,
  topic: String,
  platform: String,
  tone: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});
const SavedScript = mongoose.models.SavedScript || mongoose.model('SavedScript', ScriptSchema);

// 3. Gemini Setup
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Health Route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// AI Generate Route
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { type, topic, tone, platform, audienceComment } = req.body;

    if (!apiKey || !genAI) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY Render par set nahi hai.' 
      });
    }

    let prompt = '';
    if (type === 'script') {
      prompt = `Write a high-retention creator script for ${platform || 'Reels'} on topic: "${topic}". Tone: ${tone || 'High Energy'}. Structure: 1. Hook (0-3s), 2. Core Value, 3. CTA.`;
    } else if (type === 'hooks') {
      prompt = `Generate 5 viral hook angles (Fear, Curiosity, Story, Quick Value, Hot Take) for: "${topic}".`;
    } else if (type === 'reply') {
      prompt = `Generate 3 professional replies for this comment: "${audienceComment}". Tone: ${tone || 'Professional'}.`;
    } else if (type === 'repurpose') {
      prompt = `Repurpose into Tweet, LinkedIn post, and Instagram caption with hashtags for: "${topic}".`;
    } else if (type === 'seo_tags') {
      prompt = `Provide 5 viral titles and 15 SEO tags for: "${topic}".`;
    } else if (type === 'thumbnail') {
      prompt = `Provide visual concept and Midjourney prompt for: "${topic}".`;
    } else {
      prompt = `Creator response on: "${topic}"`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text();

    if (isDbConnected) {
      try {
        await SavedScript.create({
          type: type || 'custom',
          topic: topic || audienceComment || 'General',
          platform: platform || 'All',
          tone: tone || 'Default',
          content: resultText
        });
      } catch (e) {
        console.log('DB Save Skip:', e.message);
      }
    }

    res.json({ success: true, result: resultText });
  } catch (error) {
    console.error('AI Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// History Route
app.get('/api/scripts/history', async (req, res) => {
  try {
    if (!isDbConnected) return res.json({ success: true, data: [] });
    const history = await SavedScript.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: history });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Menezo is live on port ${PORT}`);
});
