require("dotenv").config();

// Vercel sẽ tự động tìm vào file này khi có request gọi '/api/...'
const app = require("../backend/server");

console.log("🚀 Serverless Backend đang nhận request!");
module.exports = app;