import express from "express";
import { v4 as uuidv4 } from "uuid";
import { User, Product, Weaver, Transaction } from "../models/models.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route GET /products
 * @desc Get all available products
 * @access Public
 */
router.get("/products", async (req, res) => {
  try {
    // Get all products with quantity > 0
    const products = await Product.findAll({
      where: { quantity: { [Op.gt]: 0 } },
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route GET /products/:product_id
 * @desc Get product by ID
 * @access Public
 */
router.get("/products/:product_id", async (req, res) => {
  try {
    const productId = req.params.product_id;

    // Get product with its weaver
    const product = await Product.findOne({
      where: { product_id: productId },
      include: [{ model: Weaver, as: "weaver" }],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route POST /buy
 * @desc Create a new transaction to buy a product
 * @access Private
 */
router.post("/buy", authMiddleware, async (req, res) => {
  try {
    const { product_id, address, phone_number } = req.body;
    const user_id = req.user.id;

    // Get user and product
    const user = await User.findOne({ where: { user_id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const product = await Product.findOne({ where: { product_id } });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.quantity < 1) {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    // Calculate total price
    const shipping_cost = 10000;
    const total_price = product.price + shipping_cost;

    // Create transaction
    const transaction_id = uuidv4();
    const transaction = await Transaction.create({
      transaction_id,
      user_id,
      product_id,
      quantity: 1,
      address,
      phone_number,
      resi: null,
      total_price,
      status: "pending_payment",
      transaction_date: new Date(),
    });

    res.status(201).json({
      transaction_id: transaction.transaction_id,
      user_id: transaction.user_id,
      product_id: transaction.product_id,
      product_name: product.name,
      quantity: transaction.quantity,
      address: transaction.address,
      phone_number: transaction.phone_number,
      resi: transaction.resi,
      total_price: transaction.total_price,
      status: transaction.status,
      transaction_date: transaction.transaction_date,
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route GET /payment/:transaction_id
 * @desc Get payment details for a transaction
 * @access Private
 */
router.get("/payment/:transaction_id", authMiddleware, async (req, res) => {
  try {
    const transaction_id = req.params.transaction_id;
    const user_id = req.user.id;

    // Get transaction with product
    const transaction = await Transaction.findOne({
      where: {
        transaction_id,
        user_id,
      },
      include: [{ model: Product, as: "product" }],
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const product_price = transaction.product.price;
    const shipping_cost = 10000;

    res.json({
      transaction_id,
      product_name: transaction.product.name,
      product_price,
      shipping_cost,
      total_price: transaction.total_price,
      address: transaction.address,
      phone_number: transaction.phone_number,
      status: transaction.status,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route POST /payment/:transaction_id/confirm
 * @desc Confirm payment for a transaction
 * @access Private
 */
router.post(
  "/payment/:transaction_id/confirm",
  authMiddleware,
  async (req, res) => {
    try {
      const transaction_id = req.params.transaction_id;
      const user_id = req.user.id;

      // Get transaction
      const transaction = await Transaction.findOne({
        where: {
          transaction_id,
          user_id,
        },
        include: [{ model: Product, as: "product" }],
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      if (transaction.status !== "pending_payment") {
        return res
          .status(400)
          .json({
            error: `Cannot confirm payment for transaction in ${transaction.status} status`,
          });
      }

      // Update transaction status
      transaction.status = "processing";
      await transaction.save();

      // Reduce product quantity
      const product = transaction.product;
      product.quantity -= transaction.quantity;
      await product.save();

      res.json({
        transaction_id,
        status: transaction.status,
        message: "Payment confirmed successfully",
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/**
 * @route GET /transactions/user
 * @desc Get all transactions for the current user
 * @access Private
 */
router.get("/transactions/user", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get all transactions for user
    const transactions = await Transaction.findAll({
      where: { user_id },
      include: [
        { model: Product, as: "product", attributes: ["name", "photo_url"] },
      ],
      order: [["transaction_date", "DESC"]],
    });

    const response = transactions.map((transaction) => ({
      transaction_id: transaction.transaction_id,
      user_id: transaction.user_id,
      product_id: transaction.product_id,
      product_name: transaction.product.name,
      quantity: transaction.quantity,
      address: transaction.address,
      phone_number: transaction.phone_number,
      resi: transaction.resi,
      total_price: transaction.total_price,
      status: transaction.status,
      transaction_date: transaction.transaction_date,
    }));

    res.json(response);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route GET /track/:transaction_id
 * @desc Track an order
 * @access Private
 */
router.get("/track/:transaction_id", authMiddleware, async (req, res) => {
  try {
    const transaction_id = req.params.transaction_id;
    const user_id = req.user.id;

    // Get transaction
    const transaction = await Transaction.findOne({
      where: {
        transaction_id,
        user_id,
      },
      include: [{ model: Product, as: "product", attributes: ["name"] }],
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      transaction_id,
      product_name: transaction.product.name,
      resi: transaction.resi,
      status: transaction.status,
      address: transaction.address,
      phone_number: transaction.phone_number,
      total_price: transaction.total_price,
      transaction_date: transaction.transaction_date,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @route PUT /orders/:transaction_id/status
 * @desc Update order status (for admin use)
 * @access Private (should be restricted to admins in a real app)
 */
router.put(
  "/orders/:transaction_id/status",
  authMiddleware,
  async (req, res) => {
    try {
      const transaction_id = req.params.transaction_id;
      const { new_status, resi } = req.body;

      // In a real app, check if user is admin here

      // Get transaction
      const transaction = await Transaction.findOne({
        where: { transaction_id },
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Valid status progression
      const validStatuses = [
        "pending_payment",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(new_status)) {
        return res.status(400).json({ error: `Invalid status: ${new_status}` });
      }

      // Update transaction
      transaction.status = new_status;
      if (resi) {
        transaction.resi = resi;
      }
      await transaction.save();

      res.json({
        transaction_id,
        status: transaction.status,
        resi: transaction.resi,
        message: "Order status updated successfully",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
