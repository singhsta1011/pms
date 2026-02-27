require("dotenv").config();
const { Sequelize } = require("sequelize");

// ⭐ Create Sequelize instance using ENV variables
const sequelize = new Sequelize(
  process.env.DB_NAME,     // database name
  process.env.DB_USER,     // mysql username
  process.env.DB_PASS,     // mysql password
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",

    logging: false,

    // ⭐ Production-safe pool settings
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    // ⭐ Recommended timezone config
    timezone: "+05:30", // India timezone (optional)
  }
);

module.exports = sequelize;
