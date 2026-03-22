require("dotenv").config();
const app = require("../src/App");
const connectDB = require("../src/config/db");

// Mở kết nối Database mỗi khi có request tới Serverless API
connectDB();

// Export app Express để Vercel tự động nhận diện
module.exports = app;