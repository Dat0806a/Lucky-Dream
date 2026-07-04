
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from "vite";
import * as geminiService from "./services/geminiServiceServer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/generate-outfits", async (req, res) => {
    console.log("Received request for /api/generate-outfits", req.body);
    try {
      const { tops, bottoms, bodyImage, height, weight, fullBodies } = req.body;
      console.log("Calling geminiService.generateOutfitsFromImages with fullBodies:", fullBodies);
      const result = await geminiService.generateOutfitsFromImages(tops, bottoms, bodyImage, height, weight, fullBodies);
      console.log("API response generated");
      res.json(result);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: 'Failed to generate outfits' });
    }
  });

  app.get("/api/tts", async (req, res) => {
    try {
      const text = req.query.text as string;
      if (!text) {
        res.status(400).send("Text is required");
        return;
      }

      // Try High-Fidelity natural Gemini male TTS first
      try {
        const audioBuffer = await geminiService.generateTTS(text);
        if (audioBuffer) {
          res.setHeader("Content-Type", "audio/wav");
          res.send(audioBuffer);
          return;
        }
        console.warn("Gemini TTS returned null, falling back to Translate TTS.");
      } catch (geminiError) {
        console.error("Gemini TTS generation error:", geminiError);
      }
      
      // Fallback: Legacy Google Translate TTS
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodedText}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch TTS from google: ${response.statusText}`);
      }
      
      res.setHeader("Content-Type", "audio/mpeg");
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (error) {
      console.error("TTS proxy error:", error);
      res.status(500).send("Failed to proxy TTS");
    }
  });

  app.post("/api/chat-with-ai", async (req, res) => {
    try {
      const { messages, context } = req.body;
      const result = await geminiService.chatWithAI(messages, context);
      res.json({ text: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to chat with AI' });
    }
  });

  app.post("/api/generate-ai-tryon", async (req, res) => {
    try {
      const { bodyImage, topImage, bottomImage, bgMode, fullBodyImage } = req.body;
      const result = await geminiService.generateAITryOn(bodyImage, topImage, bottomImage, bgMode, fullBodyImage);
      res.json({ imageUrl: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate try-on' });
    }
  });

  app.post("/api/generate-travel-plan", async (req, res) => {
    try {
      const { city, outfitDescription, vibe } = req.body;
      const result = await geminiService.generateTravelPlan(city, outfitDescription, vibe);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate travel plan' });
    }
  });

  app.post("/api/analyze-outfit-camera", async (req, res) => {
    try {
      const { imageData } = req.body;
      const result = await geminiService.analyzeOutfitFromCamera(imageData);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to analyze outfit' });
    }
  });

  // Vite middleware for development
  const distPath = path.join(process.cwd(), 'dist');
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }


  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
