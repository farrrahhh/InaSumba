import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { User } from "../models/models.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/bmp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, JPG, PNG, and BMP images are allowed."
      ),
      false
    );
  }
};

// Create upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Motif analysis data
const MOTIF_ANALYSIS = {
  ayam: {
    title: "Chicken Motif in Sumba Weaving",
    description:
      "The chicken motif in Sumba woven cloth symbolizes fertility, new life, and spiritual connection between humans and ancestors. In Sumba tradition, chickens are often used in traditional ceremonies as offerings or spiritual communication media, making them an important symbol in religious and social life. The crowing of the rooster marking the arrival of morning is also interpreted as a symbol of hope, vigilance, and protection from darkness. Additionally, this motif represents certain social status within Sumba's customary structure, where its use often indicates clan identity or hereditary legacy.",
    symbolism: [
      "Fertility and new life",
      "Spiritual connection with ancestors",
      "Communication medium in traditional ceremonies",
      "Symbol of hope and protection",
      "Vigilance against darkness",
      "Social status and clan identity",
      "Hereditary legacy",
    ],
    cultural_context:
      "Chickens in Sumba culture play an important role in religious rituals and traditional ceremonies, often used as offerings to Marapu (ancestors).",
    usage_occasions: [
      "Traditional wedding ceremonies",
      "Marapu religious rituals",
      "Harvest celebrations",
      "Initiation ceremonies",
      "Important family events",
    ],
  },
  manusia: {
    title: "Human Motif in Sumba Weaving",
    description:
      "The human motif in Sumba woven cloth symbolizes ancestors, power, and the relationship between the physical world and the spirit world. Human figures usually depict important characters such as kings, warriors, or revered ancestors, and serve as symbols of respect for origins and the continuity of life. This motif also reflects values of strength, courage, and honor in Sumba society, and is used in ritual contexts or important events related to identity, social status, or respect for tradition. The presence of the human motif indicates that the cloth is not just attire, but a cultural heritage carrying spiritual meaning and family or tribal history.",
    symbolism: [
      "Respect for ancestors",
      "Power and leadership",
      "Connection between physical and spirit worlds",
      "Strength and courage",
      "Honor in society",
      "Identity and social status",
      "Family/tribal cultural heritage",
    ],
    cultural_context:
      "Human figures in Sumba weaving represent important characters such as kings, warriors, or ancestors who are part of the tribe's history and identity.",
    usage_occasions: [
      "Royal coronation ceremonies",
      "Heroic and valor celebrations",
      "Ancestor veneration rituals",
      "High-level traditional events",
      "Important religious ceremonies",
    ],
  },
};

/**
 * @route POST /classify-tenun
 * @desc Classify tenun image
 * @access Private
 */
router.post(
  "/classify-tenun",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const user_id = req.user.id;
      const image_quality_notes = req.body.image_quality_notes;
      const file = req.file;

      // Validate user
      const user = await User.findOne({ where: { user_id } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Ensure file was uploaded
      if (!file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      // Get file info
      const imageInfo = {
        format: path.extname(file.originalname).substring(1),
        mode: "RGB",
        size: [800, 600], // Placeholder values
        width: 800,
        height: 600,
        file_size_bytes: file.size,
        file_size_mb: (file.size / (1024 * 1024)).toFixed(2),
      };

      // Simulate model prediction (placeholder)
      const startTime = new Date();
      const prediction = Math.random() > 0.5 ? "ayam" : "manusia";
      const confidence = Math.random() * 100;
      const isUncertain = confidence < 75.0;
      const processingTime = (new Date() - startTime) / 1000;

      // Create simulated probabilities
      const probabilities = {
        ayam: prediction === "ayam" ? confidence / 100 : 1 - confidence / 100,
        manusia:
          prediction === "manusia" ? confidence / 100 : 1 - confidence / 100,
      };

      // Get motif analysis based on prediction
      const motifAnalysis = MOTIF_ANALYSIS[prediction];

      // Generate recommendation based on confidence
      let recommendation = null;
      if (isUncertain) {
        recommendation =
          "The confidence level is low. Consider uploading a clearer image with better lighting and closer focus on the motif pattern.";
      }

      res.json({
        prediction,
        confidence,
        is_uncertain: isUncertain,
        processing_time: processingTime,
        motif_analysis: motifAnalysis,
        probabilities,
        recommendation,
        image_info: imageInfo,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Classification error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * @route GET /motif-encyclopedia
 * @desc Get encyclopedia of motifs
 * @access Public
 */
router.get("/motif-encyclopedia", (req, res) => {
  res.json({
    motifs: MOTIF_ANALYSIS,
    count: Object.keys(MOTIF_ANALYSIS).length,
  });
});

/**
 * @route GET /health
 * @desc Health check endpoint
 * @access Public
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Tenun Classifier",
    model_loaded: true,
    model_info: {
      name: "tenun_classifier",
      version: "1.0",
      classes: Object.keys(MOTIF_ANALYSIS),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route GET /
 * @desc Root endpoint
 * @access Public
 */
router.get("/", (req, res) => {
  res.json({
    message: "Tenun Classifier API",
    description: "API untuk mengklasifikasikan motif tenun Sumba",
    version: "1.0",
    endpoints: [
      {
        path: "/classify-tenun",
        method: "POST",
        description: "Klasifikasi gambar tenun",
      },
      {
        path: "/motif-encyclopedia",
        method: "GET",
        description: "Ensiklopedia motif tenun",
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
