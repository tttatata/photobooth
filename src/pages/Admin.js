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

  // State quản lý Filter
  const [customFilters, setCustomFilters] = useState([]);
  const [newFilterName, setNewFilterName] = useState("");
  
  // Nhóm Light (Ánh sáng)
  const [exposure, setExposure] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [highlight, setHighlight] = useState(0);
  const [shadow, setShadow] = useState(0);
  const [white, setWhite] = useState(0);
  const [black, setBlack] = useState(0);
  // Nhóm Color (Màu sắc)
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [vibrance, setVibrance] = useState(0);
  const [saturation, setSaturation] = useState(100);
  // Nhóm Effects (Hiệu ứng)
  const [texture, setTexture] = useState(0);
  const [clarity, setClarity] = useState(0);
  const [dehaze, setDehaze] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [grain, setGrain] = useState(0);

  const [previewImage, setPreviewImage] = useState("https://images.unsplash.com/photo-1616091216791-a5360b5ce757?q=80&w=600&auto=format&fit=crop"); // Ảnh mẫu mặc định
  const [isCreatingFilter, setIsCreatingFilter] = useState(false); // Chuyển đổi màn hình danh sách và tạo mới

  // Tự động gọi API lấy danh sách người dùng khi mở tab 'users'
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'frames') {
      fetchFrames();
    }
    if (activeTab === 'filters') {
      fetchFilters();
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

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/filters`);
      const data = await response.json();
      if (data.success) setCustomFilters(data.filters);
    } catch (error) {
      console.error("Lỗi lấy danh sách filter:", error);
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

  const handleSaveFilter = async () => {
    if (!newFilterName) return alert("Vui lòng nhập tên Filter!");
    
    // Giả lập các thông số Lightroom bằng cách nội suy (merge) vào CSS Filter
    const calcBrightness = Math.max(0, exposure + (highlight * 0.1) + (shadow * 0.1) + (white * 0.1) - (black * 0.1));
    const calcContrast = Math.max(0, contrast + (clarity * 0.2) + (dehaze * 0.2));
    const calcSaturate = Math.max(0, saturation + (vibrance * 0.5));
    const calcSepia = temperature > 0 ? temperature : 0;
    const calcHueRotate = Number(tint) + (temperature < 0 ? temperature * -0.5 : 0);
    const calcBlur = texture < 0 ? Math.abs(texture) * 0.05 : 0;

    const filterValue = `brightness(${calcBrightness}%) contrast(${calcContrast}%) saturate(${calcSaturate}%) sepia(${calcSepia}%) hue-rotate(${calcHueRotate}deg) blur(${calcBlur}px)`;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/filters`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newFilterName, filter: filterValue })
      });
      const data = await response.json();
      if (data.success) {
        alert("Thêm Filter thành công!");
        setNewFilterName("");
        setExposure(100); setContrast(100); setHighlight(0); setShadow(0); setWhite(0); setBlack(0);
        setTemperature(0); setTint(0); setVibrance(0); setSaturation(100);
        setTexture(0); setClarity(0); setDehaze(0); setVignette(0); setGrain(0);
        fetchFilters();
        setIsCreatingFilter(false); // Quay lại danh sách sau khi lưu thành công
      } else { alert(data.message); }
    } catch (error) { console.error("Lỗi upload filter:", error); }
  };

  const handleDeleteFilter = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa filter này?")) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/filters/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) fetchFilters();
    } catch (error) { console.error("Lỗi xóa filter:", error); }
  };

  // Xử lý khi chọn ảnh mẫu Preview
  const handlePreviewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
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

  // Component Slider rút gọn code giao diện
  const SliderControl = ({ label, value, min, max, onChange }) => (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ fontSize: "13px", fontWeight: "bold", color: "#4b5563", display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span>{label}</span> <span>{value}</span>
      </label>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", cursor: "pointer" }} />
    </div>
  );

  const calcBrightness = Math.max(0, exposure + (highlight * 0.1) + (shadow * 0.1) + (white * 0.1) - (black * 0.1));
  const calcContrast = Math.max(0, contrast + (clarity * 0.2) + (dehaze * 0.2));
  const calcSaturate = Math.max(0, saturation + (vibrance * 0.5));
  const calcSepia = temperature > 0 ? temperature : 0;
  const calcHueRotate = Number(tint) + (temperature < 0 ? temperature * -0.5 : 0);
  const calcBlur = texture < 0 ? Math.abs(texture) * 0.05 : 0;
  const currentFilterCSS = `brightness(${calcBrightness}%) contrast(${calcContrast}%) saturate(${calcSaturate}%) sepia(${calcSepia}%) hue-rotate(${calcHueRotate}deg) blur(${calcBlur}px)`;

  // Lọc danh sách Frame để hiển thị
  const displayedFrames = filterLayout === "all" ? frames : frames.filter(f => (f.layout || "vertical-3") === filterLayout);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", backgroundColor: "#1f2937", color: "white", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <h2 style={{ color: "#10b981", textAlign: "center", marginBottom: "30px" }}>🛡️ Admin Panel</h2>
        <button onClick={() => setActiveTab('users')} style={{ background: activeTab === 'users' ? "#374151" : "transparent", border: "none", color: "white", padding: "15px", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "16px" }}>👥 Quản lý người dùng</button>
        <button onClick={() => setActiveTab('frames')} style={{ background: activeTab === 'frames' ? "#374151" : "transparent", border: "none", color: "white", padding: "15px", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "16px" }}>🖼️ Quản lý Frame mẫu</button>
        <button onClick={() => setActiveTab('filters')} style={{ background: activeTab === 'filters' ? "#374151" : "transparent", border: "none", color: "white", padding: "15px", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "16px" }}>🎨 Quản lý Filter</button>
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
        {activeTab === 'filters' && (
          <div>
            <h1 style={{ color: "#111827", marginTop: 0 }}>🎨 Quản lý Filter màu</h1>
            
            {!isCreatingFilter ? (
              // --- MÀN HÌNH 1: DANH SÁCH FILTER ---
              <>
                <p style={{ color: "#6b7280" }}>Quản lý danh sách các bộ lọc màu hiện có trên hệ thống.</p>
                <button onClick={() => setIsCreatingFilter(true)} style={{ padding: "12px 24px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginBottom: "20px", fontSize: "15px" }}>
                  ➕ Tạo Filter Mới
                </button>
                
                <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "15px" }}>
                    {customFilters.length === 0 ? <p style={{ color: "#6b7280", gridColumn: "1/-1", textAlign: "center", padding: "20px" }}>Chưa có filter nào.</p> : customFilters.map(f => (
                      <div key={f._id} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "15px", display: "flex", flexDirection: "column", gap: "10px", background: "#f9fafb" }}>
                        <div style={{ fontWeight: "bold", color: "#111827", fontSize: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={f.name}>
                          {f.name}
                        </div>
                        <button onClick={() => handleDeleteFilter(f._id)} style={{ padding: "8px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "bold", marginTop: "auto" }}>🗑️ Xóa</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // --- MÀN HÌNH 2: TẠO FILTER MỚI ---
              <>
                <p style={{ color: "#6b7280" }}>Kéo thanh trượt để tự do sáng tạo màu ảnh mới cho phần mềm.</p>
                <button onClick={() => setIsCreatingFilter(false)} style={{ padding: "10px 20px", background: "#e5e7eb", color: "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginBottom: "20px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  ⬅️ Quay lại danh sách
                </button>

                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  {/* Cột trái: Form chỉnh màu */}
                  <div style={{ flex: "1 1 300px", background: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#374151" }}>🎛️ Thông số Filter</h3>
                    
                    <div style={{ marginBottom: "20px" }}>
                      <input type="text" placeholder="Tên Filter (VD: Mùa thu)" value={newFilterName} onChange={e => setNewFilterName(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "6px", border: "1px solid #d1d5db" }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      <div style={{ background: "#f9fafb", padding: "15px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                        <h4 style={{ margin: "0 0 15px 0", color: "#4f46e5", display: "flex", alignItems: "center", gap: "5px" }}>☀️ Light</h4>
                        <SliderControl label="Exposure" value={exposure} min="0" max="200" onChange={setExposure} />
                        <SliderControl label="Contrast" value={contrast} min="0" max="200" onChange={setContrast} />
                        <SliderControl label="Highlight" value={highlight} min="-100" max="100" onChange={setHighlight} />
                        <SliderControl label="Shadows" value={shadow} min="-100" max="100" onChange={setShadow} />
                        <SliderControl label="Whites" value={white} min="-100" max="100" onChange={setWhite} />
                        <SliderControl label="Blacks" value={black} min="-100" max="100" onChange={setBlack} />
                      </div>

                      <div style={{ background: "#f9fafb", padding: "15px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                        <h4 style={{ margin: "0 0 15px 0", color: "#f59e0b", display: "flex", alignItems: "center", gap: "5px" }}>🎨 Color</h4>
                        <SliderControl label="Temperature" value={temperature} min="-100" max="100" onChange={setTemperature} />
                        <SliderControl label="Tint" value={tint} min="-100" max="100" onChange={setTint} />
                        <SliderControl label="Vibrance" value={vibrance} min="-100" max="100" onChange={setVibrance} />
                        <SliderControl label="Saturation" value={saturation} min="0" max="200" onChange={setSaturation} />
                      </div>

                      <div style={{ background: "#f9fafb", padding: "15px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                        <h4 style={{ margin: "0 0 15px 0", color: "#10b981", display: "flex", alignItems: "center", gap: "5px" }}>✨ Effects</h4>
                        <SliderControl label="Texture" value={texture} min="-100" max="100" onChange={setTexture} />
                        <SliderControl label="Clarity" value={clarity} min="-100" max="100" onChange={setClarity} />
                        <SliderControl label="Dehaze" value={dehaze} min="-100" max="100" onChange={setDehaze} />
                        <SliderControl label="Vignette" value={vignette} min="-100" max="100" onChange={setVignette} />
                        <SliderControl label="Grain" value={grain} min="0" max="100" onChange={setGrain} />
                      </div>
                    </div>

                    <div style={{ marginTop: "20px", padding: "12px", background: "#f3f4f6", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace", color: "#4f46e5", wordBreak: "break-all" }}>
                      filter: {currentFilterCSS};
                    </div>

                    <button onClick={handleSaveFilter} style={{ width: "100%", marginTop: "20px", padding: "14px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>💾 Lưu Filter này</button>
                  </div>

                  {/* Cột phải: Preview */}
                  <div style={{ flex: "2 1 400px", background: "white", padding: "25px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <h3 style={{ margin: 0, color: "#374151" }}>👁️ Xem trước màu ảnh</h3>
                      <label style={{ cursor: "pointer", background: "#f3f4f6", padding: "8px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", border: "1px solid #d1d5db", color: "#374151", transition: "all 0.2s" }}>
                        📸 Đổi ảnh mẫu
                        <input type="file" accept="image/*" onChange={handlePreviewImageChange} style={{ display: "none" }} />
                      </label>
                    </div>
                    <div style={{ position: "relative", width: "100%", height: "450px", backgroundColor: "#f3f4f6", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: "100%", 
                          maxHeight: "100%", 
                          objectFit: "contain", 
                          filter: currentFilterCSS
                        }} 
                      />
                      {/* Lớp phủ hiệu ứng Tối góc (Vignette) giả lập */}
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, boxShadow: vignette !== 0 ? `inset 0 0 ${Math.abs(vignette) * 1.5}px ${Math.abs(vignette)}px rgba(${vignette < 0 ? '255,255,255' : '0,0,0'}, ${Math.abs(vignette) / 100})` : "none", pointerEvents: "none" }} />
                      
                      {/* Lớp phủ hiệu ứng Nhiễu hạt (Grain) giả lập */}
                      {grain > 0 && (
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, opacity: grain / 100, mixBlendMode: "overlay", pointerEvents: "none" }} />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;