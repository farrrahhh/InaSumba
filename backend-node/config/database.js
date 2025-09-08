import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "railway",
  "postgres",
  "apnUrfnbMlLhHMnQvkCuZsIvLxSbwlDA",
  {
    host: "turntable.proxy.rlwy.net",
    port: 10797,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    logging: false, // set to console.log to see SQL queries
  }
);

export default sequelize;
