import React, { useState } from 'react';

const Home = ({ onLogin, onStartOffline, onGoToAdmin }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (username === "talaaddmin" && password === "adminlata") {
      onGoToAdmin();
    } else {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f3f4f6", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ backgroundColor: "#fff", padding: "15px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: "24px", fontWeight: "900", color: "#4f46e5" }}>📸 VietBooth</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => setShowAdminLogin(true)}
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
        <p style={{ fontSize: "18px", color: "#4b5563", maxWidth: "600px", lineHeight: "1.6", marginBottom: "40px" }}>
          Trải nghiệm chụp ảnh tự động với đa dạng layout, tự động ghép Frame, lưu trữ thông minh qua Google Drive và chia sẻ ngay lập tức bằng mã QR cho khách mời của bạn.
        </p>
        
        <div style={{ display: "flex", gap: "20px" }}>
          <button onClick={onLogin} style={{ padding: "15px 40px", fontSize: "18px", fontWeight: "bold", color: "#fff", backgroundColor: "#4f46e5", border: "none", borderRadius: "50px", cursor: "pointer", boxShadow: "0 10px 20px rgba(79, 70, 229, 0.3)" }}>
            🚀 Bắt đầu ngay (Cần Đăng nhập)
          </button>
          <button onClick={onStartOffline} style={{ padding: "15px 40px", fontSize: "18px", fontWeight: "bold", color: "#374151", backgroundColor: "#e5e7eb", border: "none", borderRadius: "50px", cursor: "pointer" }}>
            Chụp Offline (Lưu máy)
          </button>
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
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} required />
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