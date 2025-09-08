import sequelize from "./config/database.js";

/**
 * Script to sync database tables for production environment
 * Run this script before deploying to ensure database tables are created
 */
const syncDatabase = async () => {
  try {
    console.log("Starting database synchronization...");
    await sequelize.sync({ alter: false });
    console.log("Database synchronized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1);
  }
};

syncDatabase();
