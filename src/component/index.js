const app = require("../backend/app");
const connectDB = require("../backend/config/db");

// Mở kết nối Database mỗi khi có request tới API
connectDB();

// Export app Express để Vercel tự động nhận diện thành Serverless Function
module.exports = app;