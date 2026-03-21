import React, { useState } from 'react';

const Admin = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#1f2937", color: "white", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <h2 style={{ color: "#10b981", textAlign: "center", marginBottom: "30px" }}>🛡️ Admin Panel</h2>
        <button onClick={() => setActiveTab('users')} style={{ background: activeTab === 'users' ? "#374151" : "transparent", border: "none", color: "white", padding: "15px", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "16px" }}>👥 Quản lý người dùng</button>
        <button onClick={() => setActiveTab('frames')} style={{ background: activeTab === 'frames' ? "#374151" : "transparent", border: "none", color: "white", padding: "15px", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "16px" }}>🖼️ Quản lý Frame mẫu</button>
        <div style={{ marginTop: "auto" }}>
          <button onClick={onBack} style={{ background: "#ef4444", border: "none", color: "white", padding: "15px", width: "100%", cursor: "pointer", borderRadius: "8px", fontSize: "16px", fontWeight: "bold" }}>🔙 Về trang chủ</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "40px" }}>
        {activeTab === 'users' && (
          <div>
            <h1 style={{ color: "#111827", marginTop: 0 }}>👥 Quản lý người dùng</h1>
            <p style={{ color: "#6b7280" }}>Quản lý danh sách tài khoản được phép sử dụng phần mềm, phân quyền hoặc vô hiệu hóa.</p>
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "10px" }}>Email</th>
                    <th style={{ padding: "10px" }}>Trạng thái</th>
                    <th style={{ padding: "10px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>admin@vietbooth.com</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb", color: "#10b981", fontWeight: "bold" }}>Active</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}><button style={{ padding: "5px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Khóa</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'frames' && (
          <div>
            <h1 style={{ color: "#111827", marginTop: 0 }}>🖼️ Quản lý Frame mẫu (Cloud)</h1>
            <p style={{ color: "#6b7280" }}>Thêm Frame mới lên hệ thống Cloud. Máy con (Client) sẽ tự động đồng bộ kho Frame này.</p>
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "20px", display: "flex", gap: "20px", alignItems: "center" }}>
              <input type="file" accept="image/png" style={{ border: "1px dashed #d1d5db", padding: "20px", borderRadius: "8px", flex: 1, cursor: "pointer" }} />
              <button style={{ padding: "15px 30px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>☁️ Upload Frame</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;