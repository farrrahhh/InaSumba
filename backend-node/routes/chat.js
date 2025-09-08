import express from "express";
import { User, Character, Conversation, Message } from "../models/models.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Character ID for Ina Na
const INA_NA_CHARACTER_ID = "CR001";
const MAX_CONVERSATION_HISTORY = 20;

/**
 * @route POST /chat
 * @desc Chat with Ina Na
 * @access Private
 */
router.post("/", authMiddleware, async (req, res) => {
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

    // In a real application, you would call an AI API here
    // This is a placeholder response
    const botResponse = `This is a placeholder response from Ina Na. You said: "${user_message}"`;

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
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route GET /chat/conversation/:conversation_id
 * @desc Get conversation history
 * @access Private
 */
router.get(
  "/conversation/:conversation_id",
  authMiddleware,
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
  }
);

/**
 * @route GET /chat/user/:user_id/conversations
 * @desc Get all conversations for a user
 * @access Private
 */
router.get("/user/conversations", authMiddleware, async (req, res) => {
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
 * @access Private
 */
router.delete(
  "/conversation/:conversation_id",
  authMiddleware,
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
