const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

app.post('/api/login', (req, res) => {
  console.log('Login:', req.body.name, req.body.channelId);
  res.json({ success: true, user: req.body });
});

app.post('/api/ai-manager-chat', async (req, res) => {
  const { message, creatorContext } = req.body;
  const name = creatorContext?.name || 'Creator';
  const handle = creatorContext?.handle || '@you';
  const niche = creatorContext?.niche || 'General';

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ reply: `[AI Manager for ${name}]: Focus on high-retention hooks and post at 7:30 PM.` });
    }
    const prompt = `You are the AI Talent Manager on Menezo for ${name} (${handle}, Niche: ${niche}). Give sharp, actionable creator advice for: "${message}"`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ reply: response.text });
  } catch (err) {
    console.error('Gemini Error:', err.message);
    res.json({ reply: `[AI Manager for ${name}]: Focus on high-retention hooks and post at 7:30 PM.` });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT_NUM = process.env.PORT || 3000;
app.listen(PORT_NUM, '0.0.0.0', () => console.log(`Menezo running on port ${PORT_NUM}`));
