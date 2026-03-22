require("dotenv").config();
const app = require("../src/App");
const connectDB = require("../src/config/db");

// Mở kết nối Database mỗi khi có request tới Serverless API
connectDB();

console.log("🚀 Serverless Backend đang hoạt động trên Vercel!");
// Export app Express để Vercel tự động nhận diện
module.exports = app;