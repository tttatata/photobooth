require("dotenv").config();

// Vercel sẽ tự động tìm vào file này khi có request gọi '/api/...'
const app = require("../backend/server");

module.exports = app;