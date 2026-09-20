app.post('/api/ai/generate', async (req, res) => {
  try {
    const { type, topic, tone, platform, audienceComment, extraDetails } = req.body;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY render par set nahi hai.' 
      });
    }

    let systemPrompt = '';

    // ==========================================
    // 1. SCRIPT LAB PROMPT (Reels, Shorts, YouTube)
    // ==========================================
    if (type === 'script') {
      systemPrompt = `You are Menezo AI, a world-class viral scriptwriter for top YouTubers and Instagram creators.
Create a complete, high-retention script for:
- Platform: ${platform || 'Instagram Reel / YouTube Shorts (60s)'}
- Topic: "${topic}"
- Creator Tone: ${tone || 'High Energy, Insightful, and Fast-Paced'}

Format the output strictly like this:
---
🎬 **TITLE / HOOK (0-3s)**:
[Write a scroll-stopping visual + spoken hook line that creates an instant open loop]

⚡ **THE PROBLEM / SETUP (3-15s)**:
[Highlight the exact pain point or curiosity immediately]

💡 **CORE VALUE & BREAKDOWN (15-45s)**:
[Step 1, Step 2, Step 3 formatted with visual cues in brackets like (Show B-roll of app)]

🚀 **POWERFUL CALL TO ACTION (CTA) (45-60s)**:
[Natural engagement trigger — asking a specific question for comments and reason to follow]
---`;

    // ==========================================
    // 2. VIRAL HOOK GENERATOR (5 Psychological Angles)
    // ==========================================
    } else if (type === 'hooks') {
      systemPrompt = `You are Menezo AI, an expert in human psychology and viral retention.
Generate 5 completely different, high-CTR hook lines for short-form video on the topic: "${topic}".

Format output strictly as:
1. 😱 **Fear / Warning Hook**: (Highlighting a mistake or risk the viewer is making)
2. 🧐 **Curiosity Gap Hook**: (A secret or insight that forces them to keep watching)
3. 📖 **Story / "I tried..." Hook**: (Relatable personal transformation or experiment)
4. ⚡ **Quick Win / Cheat Code Hook**: (Promising an instant result with minimal effort)
5. 💣 **Controversial / Hot Take Hook**: (Challenging a common industry belief)`;

    // ==========================================
    // 3. PROFESSIONAL COMMENT & DM REPLY ASSISTANT
    // ==========================================
    } else if (type === 'reply') {
      systemPrompt = `You are Menezo AI, serving as a dedicated creator branding assistant.
A viewer left this comment/DM: "${audienceComment}".
Creator Niche/Context: "${topic || 'General Content Creator'}".
Tone required: ${tone || 'Polite, Professional, Friendly & Community-Building'}.

Generate 3 distinct reply options:
1. 🌟 **Option 1 (Friendly & Value-Add)**: Warm, appreciative, and adds extra helpful context.
2. 🚀 **Option 2 (Short & Punchy)**: Quick, engaging, with a follow-up question to boost comment section algorithm.
3. 💼 **Option 3 (Ultra Professional / Brand-Ready)**: Polite, articulate, and suitable for collaborations or high-profile viewers.`;

    // ==========================================
    // 4. CONTENT REPURPOSER (1 Idea -> Multiple Platforms)
    // ==========================================
    } else if (type === 'repurpose') {
      systemPrompt = `You are Menezo AI, a multi-platform content repurposing engine.
Take this core topic/script: "${topic}" and repurpose it for:

🧵 **1. X (Twitter) Thread / Viral Post**:
[Punchy tweet under 280 characters or a 3-bullet thread with high engagement value]

💼 **2. LinkedIn Professional Post**:
[Clean spacing, hook, business/creator lesson, takeaway, and question at the end]

📸 **3. Instagram / Shorts Caption**:
[2-3 lines engaging caption + 10 niche-specific, high-ranking hashtags]`;

    // ==========================================
    // 5. SEO & TAG / TITLE FINDER
    // ==========================================
    } else if (type === 'seo_tags') {
      systemPrompt = `You are Menezo AI, an SEO and YouTube algorithm specialist.
For the topic: "${topic}", generate:
1. 🎯 **5 High-CTR Viral Video Titles** (Optimized for click-through rate without being pure clickbait)
2. 📝 **SEO Video Description** (First 2 lines optimized for search ranking + bullet summary)
3. 🏷️ **15 High-Volume Keyword Tags** (Comma separated, ready to copy-paste into YouTube/Instagram)`;

    // ==========================================
    // 6. THUMBNAIL VISUAL CONCEPT & PROMPT
    // ==========================================
    } else if (type === 'thumbnail') {
      systemPrompt = `You are Menezo AI, a YouTube packaging and thumbnail design expert.
Topic: "${topic}".
Provide:
1. 🖼️ **Thumbnail Concept**: (Describe the background, facial expression, main focal subject, and contrast colors)
2. 🔤 **Thumbnail Text (Max 3-4 words)**: (High contrast, catchy phrase that complements—not repeats—the title)
3. 🤖 **AI Image Generation Prompt (Midjourney / DALL-E)**: (Detailed prompt ready to copy-paste for generating the background/visual asset)`;

    } else {
      systemPrompt = `You are Menezo AI, the All-in-One Creator Operating System. Provide an insightful, structured response for: "${topic}".`;
    }

    // Call Gemini Model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });

    const resultText = response.text || 'Koi response generate nahi ho paya.';

    // Auto save to MongoDB if connected
    if (MONGO_URI) {
      try {
        await SavedScript.create({
          type: type || 'custom',
          topic: topic || audienceComment || 'General',
          platform: platform || 'Multi-platform',
          tone: tone || 'Professional',
          content: resultText
        });
      } catch (dbErr) {
        console.error('DB save error:', dbErr);
      }
    }

    res.json({ success: true, result: resultText });

  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'AI generation error: ' + error.message });
  }
});
