/**
 * Public Routes
 * These routes are accessible without authentication
 */

import express from "express";

// Create router
const router = express.Router();

/**
 * @route GET /public
 * @desc Public API information endpoint
 * @access Public
 */
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to InaSumba Public API",
    version: "1.0.0",
    endpoints: [
      {
        path: "/public/info",
        method: "GET",
        description: "Get information about the InaSumba project",
      },
      {
        path: "/public/docs",
        method: "GET",
        description: "Get API documentation",
      },
    ],
  });
});

/**
 * @route GET /public/info
 * @desc Get information about the InaSumba project
 * @access Public
 */
router.get("/info", (req, res) => {
  res.json({
    name: "InaSumba",
    description:
      "A platform for discovering and preserving the cultural heritage of Sumba",
    features: [
      "Chat with Ina Na (Traditional Sumba Weaver)",
      "Tenun Classification",
      "Language Translation",
      "E-commerce for traditional products",
    ],
    contact: "info@inasumba.com",
  });
});

/**
 * @route GET /public/docs
 * @desc Get API documentation
 * @access Public
 */
router.get("/docs", (req, res) => {
  res.json({
    message: "API Documentation",
    apiEndpoints: {
      auth: [
        { path: "/auth/login", method: "POST", description: "User login" },
        {
          path: "/auth/register",
          method: "POST",
          description: "User registration",
        },
      ],
      profile: [
        {
          path: "/profile",
          method: "GET",
          description: "Get current user profile",
        },
        {
          path: "/profile/:user_id",
          method: "GET",
          description: "Get user profile by ID",
        },
        { path: "/profile", method: "PUT", description: "Update user profile" },
      ],
      chat: [
        {
          path: "/chat",
          method: "POST",
          description: "Send message to chatbot",
        },
        {
          path: "/chat/character",
          method: "GET",
          description: "Get character information",
        },
        {
          path: "/chat/user/conversations",
          method: "GET",
          description: "Get user conversations",
        },
      ],
      translator: [
        { path: "/translator", method: "POST", description: "Translate text" },
      ],
      classifier: [
        {
          path: "/classifier/classify-tenun",
          method: "POST",
          description: "Classify tenun image",
        },
      ],
      ecommerce: [
        {
          path: "/ecommerce/products",
          method: "GET",
          description: "Get all products",
        },
        {
          path: "/ecommerce/products/:product_id",
          method: "GET",
          description: "Get product by ID",
        },
        {
          path: "/ecommerce/buy",
          method: "POST",
          description: "Purchase product",
        },
      ],
    },
  });
});

// Export the router with both named and default export for maximum compatibility
export { router };
export default router;
