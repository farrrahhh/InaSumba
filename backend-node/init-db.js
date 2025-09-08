import sequelize from "./config/database.js";
import initializeDatabase from "./config/initialize-db.js";

// Connect to database and initialize it with default data
async function run() {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("Connection successful");

    console.log("Syncing database schema...");
    await sequelize.sync({ alter: false });
    console.log("Database schema synced");

    console.log("Initializing database with default data...");
    await initializeDatabase();
    console.log("Database initialization complete");

    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error("Error during database initialization:", error);
    process.exit(1);
  }
}

run();
