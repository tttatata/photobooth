import React, { useState, useEffect } from 'react';
import { generateSampleFrame } from '../utils/helpers';

const Admin = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);

  // State quản lý Frame
  const [frames, setFrames] = useState([]);
  const [newFrameName, setNewFrameName] = useState("");
  const [newFrameImage, setNewFrameImage] = useState("");
  const [newFrameLayout, setNewFrameLayout] = useState("vertical-3");
  const [isLoadingFrames, setIsLoadingFrames] = useState(false);
  const [filterLayout, setFilterLayout] = useState("all"); // State lọc danh sách Frame

  // Tự động gọi API lấy danh sách người dùng khi mở tab 'users'
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'frames') {
      fetchFrames();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Hàm lấy token từ localStorage
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  });

  const fetchFrames = async () => {
    setIsLoadingFrames(true); // Bật trạng thái Loading
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/frames`);
      const data = await response.json();
      if (data.success) setFrames(data.frames);
    } catch (error) {
      console.error("Lỗi lấy danh sách frame:", error);
    } finally {
      setIsLoadingFrames(false); // Tắt trạng thái Loading khi hoàn tất
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewFrameImage(reader.result); // Chuyển ảnh thành chuỗi Base64
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFrame = async () => {
    if (!newFrameName || !newFrameImage) return alert("Vui lòng nhập tên và chọn file ảnh (PNG)!");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/frames`, {
        method: "POST", 
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newFrameName, image: newFrameImage, layout: newFrameLayout })
      });
      const data = await response.json();
      if (data.success) {
        alert("Thêm frame thành công!");
        setNewFrameName(""); setNewFrameImage(""); // Reset form
        fetchFrames(); // Cập nhật lại Grid
      } else { alert(data.message); }
    } catch (error) { console.error("Lỗi upload frame:", error); }
  };

  const handleDeleteFrame = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa frame này?")) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/frames/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) fetchFrames();
    } catch (error) { console.error("Lỗi xóa frame:", error); }
  };

  const handleLoadSystemFrames = async () => {
    const systemStyles = [
      { id: "tet", label: "Tết Nguyên Đán" },
      { id: "sen", label: "Hoa Sen" },
      { id: "dongson", label: "Trống Đồng" },
      { id: "hoian", label: "Phố Cổ Hội An" },
      { id: "aodai", label: "Áo Dài" },
      { id: "nonla", label: "Nón Lá" },
      { id: "cafe", label: "Cà Phê Sữa" },
      { id: "tre", label: "Tre Làng" },
      { id: "ruongbac", label: "Ruộng Bậc Thang" },
      { id: "halong", label: "Vịnh Hạ Long" },
      { id: "xichlo", label: "Xích Lô" },
      { id: "hanoi", label: "Mùa Thu Hà Nội" },
      { id: "saigon", label: "Đêm Sài Gòn" },
      { id: "muaroi", label: "Múa Rối Nước" },
      { id: "chimlac", label: "Chim Lạc" },
      { id: "denlong", label: "Đêm Lồng Đèn" },
      { id: "trongcom", label: "Trống Cơm" },
      { id: "banto", label: "Hoa Văn Thổ Cẩm" },
      { id: "nhatrang", label: "Biển Xanh" },
      { id: "nemchua", label: "Đặc Sản" },
      { id: "birthday", label: "Sinh Nhật" },
      { id: "neon", label: "Neon Vibes" }
    ];
    
    if (!window.confirm(`Bạn có muốn nạp ${systemStyles.length} mẫu hệ thống vào Database không?\n(Quá trình này mất vài giây...)`)) return;

    for (let i = 0; i < systemStyles.length; i++) {
      const style = systemStyles[i];
      const imageBase64 = generateSampleFrame(style.id, "vertical-3"); // Khởi tạo mặc định ở định dạng phổ biến nhất (3 ảnh dọc)
      try {
        await fetch(`${process.env.REACT_APP_API_URL || ""}/api/frames`, { 
          method: "POST", 
          headers: getAuthHeaders(), 
          body: JSON.stringify({ name: style.label, image: imageBase64, layout: "vertical-3" }) 
        });
      } catch (error) { console.error("Lỗi nạp frame:", error); }
    }
    alert("🎉 Đã nạp thành công toàn bộ Frame mặc định vào hệ thống!");
    fetchFrames();
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/users`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa Token đã lưu từ Server
    localStorage.removeItem("userRole"); // Xóa Role đã lưu
    localStorage.removeItem("userName"); // Xóa Username
    onBack(); // Điều hướng về Home
  };

  // Hàm vẽ Layout minh họa bằng CSS trực quan
  const renderLayoutPreview = (layout) => {
    const wrapperStyle = { background: "#f3f4f6", border: "2px dashed #9ca3af", borderRadius: "8px", display: "flex", padding: "5px", gap: "5px", boxSizing: "border-box" };
    const boxStyle = { background: "#9ca3af", borderRadius: "4px" };
    
    switch (layout) {
      case "single": return <div style={{ ...wrapperStyle, width: "150px", height: "100px", flexDirection: "column" }}><div style={{ ...boxStyle, flex: 1 }}></div></div>;
      case "vertical-2": return <div style={{ ...wrapperStyle, width: "100px", height: "150px", flexDirection: "column" }}><div style={{ ...boxStyle, flex: 1 }}></div><div style={{ ...boxStyle, flex: 1 }}></div></div>;
      case "vertical-3": return <div style={{ ...wrapperStyle, width: "100px", height: "150px", flexDirection: "column" }}><div style={{ ...boxStyle, flex: 1 }}></div><div style={{ ...boxStyle, flex: 1 }}></div><div style={{ ...boxStyle, flex: 1 }}></div></div>;
      case "grid-4": return <div style={{ ...wrapperStyle, width: "150px", height: "100px", flexWrap: "wrap" }}>{Array(4).fill(0).map((_, i) => <div key={i} style={{ ...boxStyle, width: "calc(50% - 2.5px)", height: "calc(50% - 2.5px)" }}></div>)}</div>;
      case "grid-6": return <div style={{ ...wrapperStyle, width: "100px", height: "150px", flexWrap: "wrap" }}>{Array(6).fill(0).map((_, i) => <div key={i} style={{ ...boxStyle, width: "calc(50% - 2.5px)", height: "calc(33.33% - 3.33px)" }}></div>)}</div>;
      case "grid-8": return <div style={{ ...wrapperStyle, width: "100px", height: "150px", flexWrap: "wrap" }}>{Array(8).fill(0).map((_, i) => <div key={i} style={{ ...boxStyle, width: "calc(50% - 2.5px)", height: "calc(25% - 3.75px)" }}></div>)}</div>;
      default: return null;
    }
  };

  // Lọc danh sách Frame để hiển thị
  const displayedFrames = filterLayout === "all" ? frames : frames.filter(f => (f.layout || "vertical-3") === filterLayout);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#1f2937", color: "white", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <h2 style={{ color: "#10b981", textAlign: "center", marginBottom: "30px" }}>🛡️ Admin Panel</h2>
        <button onClick={() => setActiveTab('users')} style={{ background: activeTab === 'users' ? "#374151" : "transparent", border: "none", color: "white", padding: "15px", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "16px" }}>👥 Quản lý người dùng</button>
        <button onClick={() => setActiveTab('frames')} style={{ background: activeTab === 'frames' ? "#374151" : "transparent", border: "none", color: "white", padding: "15px", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "16px" }}>🖼️ Quản lý Frame mẫu</button>
        <div style={{ marginTop: "auto" }}>
          <button onClick={handleLogout} style={{ background: "#ef4444", border: "none", color: "white", padding: "15px", width: "100%", cursor: "pointer", borderRadius: "8px", fontSize: "16px", fontWeight: "bold" }}>🚪 Đăng xuất</button>
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
                    <th style={{ padding: "10px" }}>Tài khoản</th>
                    <th style={{ padding: "10px" }}>Quyền</th>
                    <th style={{ padding: "10px" }}>Trạng thái</th>
                    <th style={{ padding: "10px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb", fontWeight: "bold", color: "#374151" }}>{user.username}</td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>
                        <span style={{ background: user.role === 'admin' ? '#fef08a' : '#e5e7eb', padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", color: "#374151" }}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb", color: user.isActive ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                      </td>
                      <td style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>
                        <button style={{ padding: "5px 10px", background: user.isActive ? "#ef4444" : "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                          {user.isActive ? "Khóa" : "Mở khóa"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>Đang tải dữ liệu...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'frames' && (
          <div>
            <h1 style={{ color: "#111827", marginTop: 0 }}>🖼️ Quản lý Frame mẫu (Cloud)</h1>
            <p style={{ color: "#6b7280" }}>Thêm Frame mới lên hệ thống Cloud. Máy con (Client) sẽ tự động đồng bộ kho Frame này.</p>
            
            {/* --- Form Thêm Frame --- */}
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <h3 style={{ margin: 0, color: "#374151" }}>➕ Thêm Frame Mới</h3>
              <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                <input type="text" placeholder="Tên Frame (VD: Cưới 2024)" value={newFrameName} onChange={(e) => setNewFrameName(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", flex: 1, minWidth: "200px" }} />
                <select value={newFrameLayout} onChange={(e) => setNewFrameLayout(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", flex: 1 }}>
                  <option value="vertical-3">3 Ảnh Dọc (vertical-3)</option>
                  <option value="vertical-2">2 Ảnh Dọc (vertical-2)</option>
                  <option value="single">1 Ảnh Lớn (single)</option>
                  <option value="grid-4">Lưới 4 Ảnh (grid-4)</option>
                  <option value="grid-6">Lưới 6 Ảnh (grid-6)</option>
                  <option value="grid-8">Lưới 8 Ảnh (grid-8)</option>
                </select>
                <input type="file" accept="image/png" onChange={handleFileChange} style={{ padding: "10px", borderRadius: "8px", border: "1px dashed #d1d5db", flex: 1, cursor: "pointer" }} />
                <button onClick={handleUploadFrame} style={{ padding: "12px 30px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>☁️ Upload Frame</button>
              </div>
              <div style={{ display: "flex", gap: "30px", marginTop: "15px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#6b7280", fontWeight: "bold" }}>Minh họa Layout:</p>
                  {renderLayoutPreview(newFrameLayout)}
                </div>
                {newFrameImage && (
                  <div>
                    <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#6b7280", fontWeight: "bold" }}>Bản xem trước Frame:</p>
                    {/* Sử dụng nền caro bằng SVG để làm nổi bật vùng trong suốt của ảnh PNG */}
                    <img src={newFrameImage} alt="Preview" style={{ height: "150px", objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: "8px", background: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><rect width=\"10\" height=\"10\" fill=\"%23e5e7eb\"/><rect x=\"10\" y=\"10\" width=\"10\" height=\"10\" fill=\"%23e5e7eb\"/><rect x=\"10\" width=\"10\" height=\"10\" fill=\"%23f9fafb\"/><rect y=\"10\" width=\"10\" height=\"10\" fill=\"%23f9fafb\"/></svg>')" }} />
                  </div>
                )}
              </div>
            </div>

            {/* --- Danh sách Frame Grid --- */}
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, color: "#374151" }}>📚 Danh sách Frame hiện có</h3>
                  <select value={filterLayout} onChange={(e) => setFilterLayout(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", outline: "none", cursor: "pointer", fontWeight: "bold", color: "#4f46e5" }}>
                    <option value="all">Tất cả Layout</option>
                    <option value="vertical-3">3 Ảnh Dọc (vertical-3)</option>
                    <option value="vertical-2">2 Ảnh Dọc (vertical-2)</option>
                    <option value="single">1 Ảnh Lớn (single)</option>
                    <option value="grid-4">Lưới 4 Ảnh (grid-4)</option>
                    <option value="grid-6">Lưới 6 Ảnh (grid-6)</option>
                    <option value="grid-8">Lưới 8 Ảnh (grid-8)</option>
                  </select>
                </div>
                <button onClick={handleLoadSystemFrames} style={{ padding: "8px 15px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}>📥 Nạp thư viện Frame có sẵn</button>
              </div>
            {isLoadingFrames ? (
                <p style={{ color: "#4f46e5", textAlign: "center", padding: "20px 0", fontWeight: "bold" }}>⏳ Đang tải danh sách từ MongoDB...</p>
              ) : displayedFrames.length === 0 ? (
                <p style={{ color: "#6b7280", textAlign: "center", padding: "20px 0" }}>Không có frame nào thuộc Layout này!</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
                  {displayedFrames.map((frame) => (
                    <div key={frame._id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px", textAlign: "center", display: "flex", flexDirection: "column", gap: "10px", background: "#f9fafb", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                      <div style={{ height: "180px", width: "100%", background: "#e5e7eb", borderRadius: "8px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <img src={frame.image} alt={frame.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                      <span style={{ fontSize: "12px", color: "#4f46e5", fontWeight: "bold" }}>Layout: {frame.layout || "vertical-3"}</span>
                      <div style={{ fontWeight: "bold", color: "#111827", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={frame.name}>{frame.name}</div>
                      <button onClick={() => handleDeleteFrame(frame._id)} style={{ padding: "8px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>🗑️ Xóa</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;