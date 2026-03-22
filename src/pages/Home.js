import React, { useState } from 'react';

const Home = ({ onLogin, onStartOffline, onGoToAdmin }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleOpenAdmin = () => {
    if (localStorage.getItem("token") && localStorage.getItem("userRole") === "admin") {
      onGoToAdmin(); // Nếu đã đăng nhập trước đó, vào thẳng Admin
    } else {
      setShowAdminLogin(true); // Ngược lại, mở cửa sổ đăng nhập
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Kiểm tra xem tài khoản đăng nhập có thực sự là admin không
        if (data.user.role === 'admin') {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userRole", data.user.role);
          onGoToAdmin();
        } else {
          alert("Tài khoản của bạn không có quyền Quản trị viên!");
        }
      } else {
        alert(data.message || "Sai tài khoản hoặc mật khẩu!");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Không thể kết nối đến máy chủ. Đảm bảo server Backend đang chạy!");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f3f4f6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ backgroundColor: "#fff", padding: "15px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: "24px", fontWeight: "900", color: "#4f46e5" }}>📸 VietBooth</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={handleOpenAdmin}
            style={{ padding: "10px 20px", border: "none", backgroundColor: "#374151", color: "white", borderRadius: "30px", cursor: "pointer", fontWeight: "bold" }}
          >
            👨‍💻 Admin Panel
          </button>
          <button 
            onClick={onLogin}
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px", border: "1px solid #d1d5db", backgroundColor: "#fff", borderRadius: "30px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: "20px" }} />
            Đăng nhập bằng Google
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "40px" }}>
        <h1 style={{ fontSize: "48px", color: "#111827", marginBottom: "20px", maxWidth: "800px" }}>
          Phần mềm chụp ảnh Sự kiện chuyên nghiệp
        </h1>
        <p style={{ fontSize: "18px", color: "#4b5563", maxWidth: "600px", lineHeight: "1.6", marginBottom: "50px" }}>
          Trải nghiệm chụp ảnh tự động với đa dạng layout, tự động ghép Frame, lưu trữ thông minh qua Google Drive và chia sẻ ngay lập tức bằng mã QR cho khách mời của bạn.
        </p>
        
        <div style={{ display: "flex", gap: "20px", marginBottom: "70px" }}>
          <button onClick={onLogin} style={{ padding: "15px 40px", fontSize: "18px", fontWeight: "bold", color: "#fff", backgroundColor: "#4f46e5", border: "none", borderRadius: "50px", cursor: "pointer", boxShadow: "0 10px 20px rgba(79, 70, 229, 0.3)" }}>
            🚀 Bắt đầu ngay (Cần Đăng nhập)
          </button>
          <button onClick={onStartOffline} style={{ padding: "15px 40px", fontSize: "18px", fontWeight: "bold", color: "#374151", backgroundColor: "#e5e7eb", border: "none", borderRadius: "50px", cursor: "pointer" }}>
            Chụp Offline (Lưu máy)
          </button>
        </div>

        {/* --- Phần Hiển thị Ưu điểm --- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px", maxWidth: "1100px", width: "100%" }}>
          <div style={{ background: "#fff", padding: "35px 25px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", transition: "transform 0.3s" }} className="feature-card">
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>🖼️</div>
            <h3 style={{ color: "#1f2937", fontSize: "22px", marginBottom: "15px", fontWeight: "800" }}>Đa dạng Layout</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.6", fontSize: "16px", margin: 0 }}>Hỗ trợ in đa dạng các khổ ngang, dọc và dải (photo strip) kết hợp với các frame sáng tạo.</p>
          </div>

          <div style={{ background: "#fff", padding: "35px 25px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", transition: "transform 0.3s" }} className="feature-card">
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>☁️</div>
            <h3 style={{ color: "#1f2937", fontSize: "22px", marginBottom: "15px", fontWeight: "800" }}>Lưu trữ Đám mây</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.6", fontSize: "16px", margin: 0 }}>Hình ảnh chụp được tự động đồng bộ và lưu trữ an toàn trên Google Drive cá nhân của bạn.</p>
          </div>

          <div style={{ background: "#fff", padding: "35px 25px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", transition: "transform 0.3s" }} className="feature-card">
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>📱</div>
            <h3 style={{ color: "#1f2937", fontSize: "22px", marginBottom: "15px", fontWeight: "800" }}>Nhận ảnh qua QR</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.6", fontSize: "16px", margin: 0 }}>Mã QR sinh tự động giúp khách mời tại sự kiện tải file gốc ngay tức thì bằng điện thoại.</p>
          </div>

          <div style={{ background: "#fff", padding: "35px 25px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", transition: "transform 0.3s" }} className="feature-card">
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>📸</div>
            <h3 style={{ color: "#1f2937", fontSize: "22px", marginBottom: "15px", fontWeight: "800" }}>Hỗ trợ đa Camera</h3>
            <p style={{ color: "#6b7280", lineHeight: "1.6", fontSize: "16px", margin: 0 }}>Kết nối trơn tru với các loại Webcam phổ biến hoặc phần mềm Virtual Camera chuyên dụng.</p>
          </div>
        </div>
      </main>

      {/* Cửa sổ Đăng nhập Admin */}
      {showAdminLogin && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "90%", maxWidth: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", position: "relative" }}>
            <button onClick={() => setShowAdminLogin(false)} style={{ position: "absolute", top: "15px", right: "15px", background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>❌</button>
            <h2 style={{ marginTop: 0, textAlign: "center", color: "#111827" }}>Đăng nhập Admin</h2>
            <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#374151" }}>Tài khoản:</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#374151" }}>Mật khẩu:</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box", paddingRight: "40px" }} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", fontSize: "18px", padding: 0 }} title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <button type="submit" style={{ padding: "12px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", marginTop: "10px" }}>Đăng nhập</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;