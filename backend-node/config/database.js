import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "postgresql://postgres:egMsYmPGiJjJqinqdLOSTYomuLdKflPz@shuttle.proxy.rlwy.net:29371/railway",
  {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("[DB] Connected to PostgreSQL (Railway)");
  } catch (error) {
    console.error("[DB] Connection failed:", error.message);
  }
})();

export default sequelize;
