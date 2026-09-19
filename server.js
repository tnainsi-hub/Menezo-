// AI generate route
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, type, language } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Menezo Creator OS AI.
Task: ${type || 'Content Generation'}
Language: ${language || 'English'}
Prompt: ${prompt}

Format the response in clean Markdown with:
- 🎯 Hook
- 📝 Script
- 🎬 Visual Suggestions
- 🚀 CTA
- 🏷️ Hashtags`
    });

    res.json({ success: true, text: response.text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dashboard AI Manager ke liye
app.post('/api/ai-manager-chat', async (req, res) => {
  try {
    const { message, creatorContext } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const context = creatorContext 
      ? `Creator: ${creatorContext.name}, Platform: ${creatorContext.platform}, Niche: ${creatorContext.niche}`
      : '';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Menezo AI Manager. Give short and useful advice.
${context}

Question: ${message}`
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('AI Manager Error:', error);
    res.status(500).json({ reply: 'AI temporarily unavailable. Try again.' });
  }
});
