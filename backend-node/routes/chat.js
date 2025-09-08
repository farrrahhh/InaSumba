import express from "express";
import { User, Character, Conversation, Message } from "../models/models.js";
import { authMiddleware } from "../middleware/auth.js";
import flexibleAuth from "../middleware/flexible-auth.js";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = express.Router();

// Character ID for Ina Na
const INA_NA_CHARACTER_ID = "CR001";
const MAX_CONVERSATION_HISTORY = 20;

/**
 * @route POST /chat
 * @desc Chat with Ina Na
 * @access Private (JWT or API Key)
 */
router.post("/", flexibleAuth, async (req, res) => {
  try {
    const { user_message } = req.body;
    const user_id = req.user.id;

    // Validate user
    const user = await User.findOne({ where: { user_id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get Ina Na character
    const character = await Character.findOne({
      where: { character_id: INA_NA_CHARACTER_ID },
    });
    if (!character) {
      return res.status(404).json({ error: "Ina Na character not found" });
    }

    // Get or create conversation
    let conversation = await Conversation.findOne({
      where: {
        user_id,
        character_id: INA_NA_CHARACTER_ID,
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        user_id,
        character_id: INA_NA_CHARACTER_ID,
      });
    }

    // Get recent conversation history for context
    const recentMessages = await Message.findAll({
      where: { conversation_id: conversation.conversation_id },
      order: [["timestamp", "DESC"]],
      limit: MAX_CONVERSATION_HISTORY,
    });

    // Build conversation context
    const conversationHistory = recentMessages.reverse().map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.message,
    }));

    // Create the system prompt for Ina Na
    const systemPrompt = `You are Ina Na, a 40-year-old skilled and knowledgeable weaver from Sumba, East Nusa Tenggara, Indonesia. You have a motherly, friendly, and patient personality. You are always ready to share stories and knowledge about the rich culture of Sumba, especially traditional ikat weaving art.

Key characteristics:
- You are proud to preserve ancestral heritage
- You love guiding anyone who wants to learn about the meaning behind each motif and the process behind each thread of fabric
- You speak with warmth and wisdom
- You often relate things back to weaving, culture, and Sumba traditions
- You can explain the cultural significance of different motifs (chicken, human, dragon, horse, geometric patterns)
- You understand both Indonesian and English, but prefer speaking in a warm, conversational tone

When users ask about weaving or Sumba culture, provide detailed, authentic information. When they ask about other topics, try to relate them back to your cultural knowledge when appropriate, but also engage naturally in conversation.`;

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: user_message },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const botResponse = completion.choices[0].message.content;

      // Save user message
      await Message.create({
        conversation_id: conversation.conversation_id,
        sender: "user",
        message: user_message,
        timestamp: new Date(),
      });

      // Save bot message
      await Message.create({
        conversation_id: conversation.conversation_id,
        sender: "bot",
        message: botResponse,
        timestamp: new Date(),
      });

      res.json({
        bot_response: botResponse,
        conversation_id: conversation.conversation_id,
        character_name: character.name,
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);

      // Fallback response if OpenAI fails
      const fallbackResponse = `Maaf, saya sedang mengalami gangguan teknis. Sebagai Ina Na, saya ingin berbagi bahwa tenun ikat Sumba memiliki makna yang sangat dalam dalam budaya kami. Setiap motif menceritakan kisah leluhur dan kehidupan sehari-hari masyarakat Sumba. Apakah ada yang ingin Anda ketahui tentang tenun Sumba?`;

      // Save user message
      await Message.create({
        conversation_id: conversation.conversation_id,
        sender: "user",
        message: user_message,
        timestamp: new Date(),
      });

      // Save fallback bot message
      await Message.create({
        conversation_id: conversation.conversation_id,
        sender: "bot",
        message: fallbackResponse,
        timestamp: new Date(),
      });

      res.json({
        bot_response: fallbackResponse,
        conversation_id: conversation.conversation_id,
        character_name: character.name,
        note: "Menggunakan respons cadangan karena gangguan teknis",
      });
    }
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route GET /chat/conversation/:conversation_id
 * @desc Get conversation history
 * @access Private (JWT or API Key)
 */
router.get("/conversation/:conversation_id", flexibleAuth, async (req, res) => {
  try {
    const conversation_id = req.params.conversation_id;
    const user_id = req.user.id;

    // Get conversation
    const conversation = await Conversation.findOne({
      where: { conversation_id, user_id },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Get character
    const character = await Character.findOne({
      where: { character_id: conversation.character_id },
    });

    // Get messages
    const messages = await Message.findAll({
      where: { conversation_id },
      order: [["timestamp", "ASC"]],
    });

    res.json({
      conversation_id,
      user_id: conversation.user_id,
      character_name: character ? character.name : "Unknown",
      messages: messages.map((msg) => ({
        message_id: msg.message_id,
        sender: msg.sender,
        message: msg.message,
        timestamp: msg.timestamp,
      })),
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route GET /chat/user/:user_id/conversations
 * @desc Get all conversations for a user
 * @access Private (JWT or API Key)
 */
router.get("/user/conversations", flexibleAuth, async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get all conversations
    const conversations = await Conversation.findAll({
      where: {
        user_id,
        character_id: INA_NA_CHARACTER_ID,
      },
    });

    const result = [];
    for (const conv of conversations) {
      // Get character
      const character = await Character.findOne({
        where: { character_id: conv.character_id },
      });

      // Get last message
      const lastMessage = await Message.findOne({
        where: { conversation_id: conv.conversation_id },
        order: [["timestamp", "DESC"]],
      });

      result.push({
        conversation_id: conv.conversation_id,
        character_name: character ? character.name : "Unknown",
        last_message: lastMessage ? lastMessage.message : "",
        last_updated: lastMessage ? lastMessage.timestamp : conv.createdAt,
      });
    }

    res.json({ conversations: result });
  } catch (error) {
    console.error("Get user conversations error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route DELETE /chat/conversation/:conversation_id
 * @desc Delete a conversation
 * @access Private (JWT or API Key)
 */
router.delete(
  "/conversation/:conversation_id",
  flexibleAuth,
  async (req, res) => {
    try {
      const conversation_id = req.params.conversation_id;
      const user_id = req.user.id;

      // Get conversation
      const conversation = await Conversation.findOne({
        where: { conversation_id, user_id },
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Delete all messages first (cascade should handle this, but let's be explicit)
      await Message.destroy({ where: { conversation_id } });

      // Delete the conversation
      await conversation.destroy();

      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Delete conversation error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * @route GET /chat/character
 * @desc Get Ina Na character info
 * @access Public
 */
router.get("/character", async (req, res) => {
  try {
    const character = await Character.findOne({
      where: { character_id: INA_NA_CHARACTER_ID },
    });

    if (!character) {
      return res.status(404).json({ error: "Ina Na character not found" });
    }

    res.json({
      character_id: character.character_id,
      name: character.name,
      bio: character.bio,
      region: character.region,
    });
  } catch (error) {
    console.error("Get character error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route GET /chat/health
 * @desc Check health of chat service
 * @access Public
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Chat Service",
    timestamp: new Date().toISOString(),
  });
});

export default router;
