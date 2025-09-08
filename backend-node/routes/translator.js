import express from "express";
import { User } from "../models/models.js";
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

// Constants
const SUPPORTED_LANGUAGES = ["id", "en"];
const MAX_TEXT_LENGTH = 5000;

/**
 * @route POST /translate
 * @desc Translate Sumba text to target language
 * @access Private (JWT or API Key)
 */
router.post("/", flexibleAuth, async (req, res) => {
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

    // Prepare translation using OpenAI
    const startTime = new Date();

    try {
      // Determine target language name
      const targetLanguageName =
        target_language === "id" ? "Indonesian" : "English";

      // Create system prompt for translation
      const systemPrompt = `You are an expert translator specializing in Sumba language and culture. Translate the given Sumba text to ${targetLanguageName}. 

Important guidelines:
1. Provide accurate translation that preserves the cultural meaning
2. If the text contains cultural terms or concepts specific to Sumba, explain them briefly
3. Maintain the tone and formality of the original text
4. If you're unsure about certain words, provide the best approximation and note any uncertainty

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{
  "translated_text": "your translation here as a single string",
  "cultural_notes": "any cultural context or explanations as a single string",
  "confidence": 0.85
}

Do not include any other text, explanations, or formatting outside of this JSON object.`;

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Translate this Sumba text to ${targetLanguageName}: "${sumba_text}"${
              context ? ` Context: ${context}` : ""
            }`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const aiResponse = completion.choices[0].message.content;

      // Ensure we have a valid response
      if (!aiResponse) {
        throw new Error("Empty response from OpenAI");
      }

      // Try to parse JSON response
      let translatedText, culturalNotes, confidence;
      try {
        // Clean the response in case there are extra characters
        let cleanResponse = aiResponse.trim();

        // Remove potential markdown code block formatting
        if (cleanResponse.startsWith("```json")) {
          cleanResponse = cleanResponse
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "");
        } else if (cleanResponse.startsWith("```")) {
          cleanResponse = cleanResponse
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "");
        }

        const parsedResponse = JSON.parse(cleanResponse);

        // Ensure translated_text is a string, not an object
        if (typeof parsedResponse.translated_text === "string") {
          translatedText = parsedResponse.translated_text;
        } else if (typeof parsedResponse.translated_text === "object") {
          // If it's an object, convert to string representation
          console.warn(
            "OpenAI returned object for translated_text:",
            parsedResponse.translated_text
          );
          translatedText = JSON.stringify(parsedResponse.translated_text);
        } else if (parsedResponse.translated_text) {
          translatedText = String(parsedResponse.translated_text);
        } else {
          throw new Error("No translated_text found in response");
        }

        // Ensure cultural_notes is a string
        if (typeof parsedResponse.cultural_notes === "string") {
          culturalNotes = parsedResponse.cultural_notes;
        } else {
          culturalNotes = "Translation completed using AI assistance";
        }

        // Ensure confidence is a number
        confidence =
          typeof parsedResponse.confidence === "number"
            ? parsedResponse.confidence
            : 0.85;
      } catch (parseError) {
        console.warn(
          "Failed to parse OpenAI response as JSON:",
          parseError.message
        );
        console.warn("Raw response:", aiResponse);

        // If JSON parsing fails, use the raw response as string
        // Make sure it's a string, not an object
        if (typeof aiResponse === "object") {
          translatedText = JSON.stringify(aiResponse);
        } else {
          translatedText = String(aiResponse);
        }
        culturalNotes =
          "Translation completed using AI assistance (fallback response)";
        confidence = 0.7;
      }

      const processingTime = (new Date() - startTime) / 1000;

      res.json({
        original_text: sumba_text,
        translated_text: translatedText,
        source_language: "sumba",
        target_language,
        confidence_score: confidence,
        cultural_notes: culturalNotes,
        processing_time: processingTime,
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);

      // Fallback translation if OpenAI fails
      const fallbackTranslation =
        target_language === "id"
          ? `Terjemahan tidak tersedia untuk: "${sumba_text}". Mohon coba lagi nanti.`
          : `Translation not available for: "${sumba_text}". Please try again later.`;

      const fallbackNotes =
        target_language === "id"
          ? "Menggunakan respons cadangan karena gangguan layanan terjemahan"
          : "Using fallback response due to translation service disruption";

      const processingTime = (new Date() - startTime) / 1000;

      res.json({
        original_text: sumba_text,
        translated_text: fallbackTranslation,
        source_language: "sumba",
        target_language,
        confidence_score: 0.5,
        cultural_notes: fallbackNotes,
        processing_time: processingTime,
        note: "Fallback translation used due to service issue",
      });
    }
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
