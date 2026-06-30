require("dotenv").config();

const config = {
    port: process.env.PORT || 3000,
    development: process.env.NODE_ENV || "development",
}

module.exports = config;