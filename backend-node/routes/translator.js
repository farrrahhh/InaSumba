import express from "express";
import { User } from "../models/models.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Constants
const SUPPORTED_LANGUAGES = ["id", "en"];
const MAX_TEXT_LENGTH = 5000;

/**
 * @route POST /translate
 * @desc Translate Sumba text to target language
 * @access Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { sumba_text, target_language, context } = req.body;
    const user_id = req.user.id;

    // Validate user
    const user = await User.findOne({ where: { user_id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate target language
    if (!SUPPORTED_LANGUAGES.includes(target_language)) {
      return res.status(400).json({
        error: `Invalid target language. Must be one of: ${SUPPORTED_LANGUAGES.join(
          ", "
        )}`,
      });
    }

    // Validate text length
    if (sumba_text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        error: `Text is too long. Maximum allowed is ${MAX_TEXT_LENGTH} characters`,
      });
    }

    // This is a placeholder for actual translation
    // In a real app, you would integrate with a translation API
    const startTime = new Date();
    const translatedText = `This is a placeholder translation of: "${sumba_text}"`;
    const culturalNotes = "These are placeholder cultural notes";
    const processingTime = (new Date() - startTime) / 1000;

    res.json({
      original_text: sumba_text,
      translated_text: translatedText,
      source_language: "sumba",
      target_language,
      confidence_score: 0.85,
      cultural_notes: culturalNotes,
      processing_time: processingTime,
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route GET /translate/supported-languages
 * @desc Get supported languages for translation
 * @access Public
 */
router.get("/supported-languages", (req, res) => {
  res.json({
    supported_languages: [
      {
        code: "id",
        name: "Bahasa Indonesia",
        native_name: "Bahasa Indonesia",
        description: "Terjemahkan dari bahasa Sumba ke Bahasa Indonesia",
      },
      {
        code: "en",
        name: "English",
        native_name: "English",
        description: "Translate from Sumba language to English",
      },
    ],
    source_language: {
      code: "sumba",
      name: "Sumba Language",
      native_name: "Bahasa Sumba",
      description: "Bahasa asal yang akan diterjemahkan",
    },
    max_text_length: MAX_TEXT_LENGTH,
  });
});

/**
 * @route GET /translate/health
 * @desc Health check endpoint
 * @access Public
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Sumba Text Translator",
    supported_languages: SUPPORTED_LANGUAGES,
    max_text_length: MAX_TEXT_LENGTH,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route GET /translate
 * @desc Root endpoint - API information
 * @access Public
 */
router.get("/", (req, res) => {
  res.json({
    message: "Sumba Text Translator API",
    description:
      "API untuk menerjemahkan teks bahasa Sumba ke Bahasa Indonesia atau English",
    version: "2.0",
    features: [
      "Terjemahan Sumba ke Bahasa Indonesia",
      "Terjemahan Sumba ke English",
      "Preservasi konteks budaya",
      "Catatan budaya untuk istilah khusus",
      "Validasi pengguna",
    ],
    usage: {
      input: "Teks dalam bahasa Sumba",
      output: "Terjemahan + catatan budaya (jika ada)",
      supported_targets: ["id", "en"],
      max_length: `${MAX_TEXT_LENGTH} karakter`,
    },
    endpoints: [
      {
        path: "/",
        method: "POST",
        description: "Terjemahkan teks Sumba",
      },
      {
        path: "/supported-languages",
        method: "GET",
        description: "Daftar bahasa yang didukung",
      },
      {
        path: "/health",
        method: "GET",
        description: "Status kesehatan API",
      },
    ],
  });
});

export default router;
