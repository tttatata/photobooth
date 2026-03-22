require("dotenv").config();

// Đường dẫn này trỏ tới file chạy server của bạn (giả sử bạn để trong thư mục backend/server.js)
const app = require("../backend/server"); 

console.log("🚀 Backend API đã chạy và sẵn sàng nhận request!");

module.exports = app;