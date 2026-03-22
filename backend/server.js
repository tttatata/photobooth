require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Mở kết nối Database
connectDB();

// Chỉ mở port khi chạy trên máy tính (local). Khi đẩy lên Vercel, nó sẽ tự bỏ qua.
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
}

// BẮT BUỘC: Export app ra để Vercel có thể nhận diện và khởi chạy Backend
module.exports = app;