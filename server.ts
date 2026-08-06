import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. API calls may fail or run in fallback mode.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key-for-build",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Chat endpoint for SMS Online Friend
app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory = [], friendProfile, userContext } = req.body;

    if (!friendProfile || !friendProfile.name) {
      return res.status(400).json({ error: "Friend profile required" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are ${friendProfile.name}, an online SMS friend texting with the user.
Your personality: ${friendProfile.personality || "Friendly, caring, and engaging"}.
Your tone of voice: ${friendProfile.tone || "Casual, natural SMS text message style with occasional emojis"}.
Your bio & background: ${friendProfile.bio || "A close online buddy"}.
Your hobbies & interests: ${friendProfile.hobbies ? friendProfile.hobbies.join(", ") : "music, chatting, life"}.
${friendProfile.memories && friendProfile.memories.length > 0 ? `Things you remember about the user: ${friendProfile.memories.join("; ")}` : ""}

CRITICAL SMS TEXTING GUIDELINES:
1. Respond like a real human friend typing a text message (SMS).
2. Keep responses natural, concise (usually 1 to 3 short sentences per text bubble), conversational, and warm. Avoid corporate or robotic language.
3. Use realistic texting quirks appropriate for your tone (e.g., casual slang, lowercase, emojis, exclamation points, abbreviations if fitting).
4. If appropriate for the conversation, you can ask a short follow-up question to keep the chat going.
5. You can also provide 2-3 quick SMS reply options for the user to tap.
6. If the user asks for a picture/photo/selfie or if sending a photo makes complete sense in context, set "hasPhotoPrompt" to true and provide a description in "photoPrompt".

Respond strictly in valid JSON matching this schema:
{
  "replyText": "Your SMS text response",
  "quickReplies": ["Quick reply option 1", "Quick reply option 2", "Quick reply option 3"],
  "reaction": "optional emoji reaction to user's last message like ❤️, 😂, 👍, 😮, 🔥, or null",
  "newMemory": "A short key fact learned about the user in this message if any (or null if none)",
  "hasPhotoPrompt": false,
  "photoPrompt": "Visual description of a photo to generate if requested, or null"
}`;

    // Convert history format to Gemini contents
    const contents: any[] = [];
    
    // Pass recent history (up to last 12 messages for good context)
    const recentHistory = conversationHistory.slice(-12);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }

    // Append current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: { type: Type.STRING },
            quickReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reaction: { type: Type.STRING },
            newMemory: { type: Type.STRING },
            hasPhotoPrompt: { type: Type.BOOLEAN },
            photoPrompt: { type: Type.STRING },
          },
          required: ["replyText"],
        },
      },
    });

    let result = {
      replyText: "Hey! Just saw your text. What's up?",
      quickReplies: ["Not much, you?", "Having a busy day!", "Just hanging out!"],
      reaction: null,
      newMemory: null,
      hasPhotoPrompt: false,
      photoPrompt: null,
    };

    if (response.text) {
      try {
        result = JSON.parse(response.text.trim());
      } catch (e) {
        result.replyText = response.text.trim();
      }
    }

    // If a photo was requested, generate an image URL using gemini-3.1-flash-lite-image
    let generatedPhotoUrl = null;
    if (result.hasPhotoPrompt && result.photoPrompt && process.env.GEMINI_API_KEY) {
      try {
        const imageResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [{ text: `A vibrant realistic photo taken on a smartphone camera: ${result.photoPrompt}. Natural lighting, cozy atmosphere.` }],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1",
            },
          },
        });

        if (imageResponse.candidates?.[0]?.content?.parts) {
          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || "image/png";
              generatedPhotoUrl = `data:${mime};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      } catch (imgErr) {
        console.error("Photo generation error:", imgErr);
      }
    }

    return res.json({
      replyText: result.replyText,
      quickReplies: result.quickReplies || [],
      reaction: result.reaction || null,
      newMemory: result.newMemory || null,
      photoUrl: generatedPhotoUrl,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return res.status(500).json({
      error: "Failed to generate SMS response",
      details: error?.message || "Internal server error",
      replyText: "Hey! Sorry, my phone lost connection for a second. Text me again?",
      quickReplies: ["Try sending again", "Are you back online?"],
    });
  }
});

// Proactive Outbound Check-in SMS generator endpoint
app.post("/api/proactive-checkin", async (req, res) => {
  try {
    const { friendProfile, timeOfDay = "afternoon", topic } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `You are ${friendProfile.name}, sending an unprompted, spontaneous SMS text message to check in on your friend.
Your personality: ${friendProfile.personality}.
Tone: ${friendProfile.tone}.
Time of day context: ${timeOfDay}.
${topic ? `Topic on your mind: ${topic}` : "No specific topic, just a casual friendly hello or sharing something funny/interesting."}

Write a short, engaging 1-2 sentence SMS text. Include quick replies for the user.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Send me a friendly check-in text!",
      config: {
        systemInstruction,
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: { type: Type.STRING },
            quickReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["replyText"],
        },
      },
    });

    let data = {
      replyText: "Hey! Hope your day is going awesome! What are you up to? 😊",
      quickReplies: ["Hey! Just working", "Doing great! You?", "Super busy today!"],
    };

    if (response.text) {
      try {
        data = JSON.parse(response.text.trim());
      } catch (e) {
        data.replyText = response.text.trim();
      }
    }

    return res.json(data);
  } catch (error: any) {
    console.error("Proactive check-in error:", error);
    return res.json({
      replyText: "Hey! Thinking of you, hope you're having a great day! ✨",
      quickReplies: ["Thanks! You too", "Hey there!", "What's up?"],
    });
  }
});

// Start Server & Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
