import React, { useState, useEffect } from "react";

const FilterManager = () => {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isManualCss, setIsManualCss] = useState(false);
  
  const [newFilter, setNewFilter] = useState({
    name: "",
    filter: "none"
  });

  const [previewImage, setPreviewImage] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop");

  const defaultSliders = {
    // Light
    exposure: 100,
    contrast: 100,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    // Color
    temperature: 0,
    tint: 0,
    vibrance: 0,
    saturation: 100,
    // Effects
    texture: 0,
    clarity: 0,
    dehaze: 0,
    vignette: 0,
    grain: 0,
    // Color Mixer
    // Red
    hueRed: 0, satRed: 0, lumRed: 0,
    // Orange
    hueOrange: 0, satOrange: 0, lumOrange: 0,
    // Yellow
    hueYellow: 0, satYellow: 0, lumYellow: 0,
    // Green
    hueGreen: 0, satGreen: 0, lumGreen: 0,
    // Aqua
    hueAqua: 0, satAqua: 0, lumAqua: 0,
    // Blue
    hueBlue: 0, satBlue: 0, lumBlue: 0,
    // Purple
    huePurple: 0, satPurple: 0, lumPurple: 0,
    // Magenta
    hueMagenta: 0, satMagenta: 0, lumMagenta: 0,
  };
  
  const [sliderValues, setSliderValues] = useState(defaultSliders);

  const colorMixerOptions = [
    { label: 'Đỏ (Red)', id: 'Red', color: '#ef4444' },
    { label: 'Cam (Orange)', id: 'Orange', color: '#f97316' },
    { label: 'Vàng (Yellow)', id: 'Yellow', color: '#eab308' },
    { label: 'Xanh lá (Green)', id: 'Green', color: '#22c55e' },
    { label: 'Lục lam (Aqua)', id: 'Aqua', color: '#06b6d4' },
    { label: 'Xanh dương (Blue)', id: 'Blue', color: '#3b82f6' },
    { label: 'Tím (Purple)', id: 'Purple', color: '#a855f7' },
    { label: 'Hồng sẫm (Magenta)', id: 'Magenta', color: '#d946ef' }
  ];

  // Tự động cập nhật mã CSS filter khi người dùng kéo thanh trượt
  useEffect(() => {
    if (isManualCss) return; // Không tự động ghi đè mã CSS nếu đang bật chế độ nhập thủ công

    let generatedFilters = [];
    
    // Chuyển đổi các thông số Lightroom sang CSS Filter (mô phỏng tương đối)
    let b = sliderValues.exposure + (sliderValues.whites * 0.2) - (sliderValues.blacks * 0.2) + (sliderValues.shadows * 0.2) + (sliderValues.highlights * 0.1);
    let c = sliderValues.contrast + (sliderValues.clarity * 0.3) + (sliderValues.dehaze * 0.2);
    let s = sliderValues.saturation + (sliderValues.vibrance * 0.5);
    
    // Giảm mạnh tác động của Sepia để ảnh không bị "vàng khè" mất tự nhiên
    let sep = sliderValues.temperature > 0 ? sliderValues.temperature * 0.3 : 0;
    // Giảm cực mạnh Hue-Rotate. Vì CSS không có hệ màu Lam/Hồng cho Tint nên ta chỉ cho xoay màu ở mức độ rất nhỏ.
    let hr = (sliderValues.tint * 0.1) + (sliderValues.temperature < 0 ? sliderValues.temperature * 0.15 : 0);
    let bl = sliderValues.texture < 0 ? Math.abs(sliderValues.texture) * 0.05 : 0;
    
    if (b !== 100) generatedFilters.push(`brightness(${Math.max(0, b)}%)`);
    if (c !== 100) generatedFilters.push(`contrast(${Math.max(0, c)}%)`);
    if (s !== 100) generatedFilters.push(`saturate(${Math.max(0, s)}%)`);
    if (sep !== 0) generatedFilters.push(`sepia(${Math.max(0, sep)}%)`);
    if (hr !== 0) generatedFilters.push(`hue-rotate(${hr}deg)`);
    if (bl !== 0) generatedFilters.push(`blur(${bl}px)`);
    
    setNewFilter(prev => ({
      ...prev,
      filter: generatedFilters.length > 0 ? generatedFilters.join(" ") : "none"
    }));
  }, [sliderValues, isManualCss]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          // Giới hạn chiều ngang ảnh Preview tối đa 800px để tránh lỗi "Payload Too Large / Failed to fetch"
          if (width > 800) {
            height = Math.round((height * 800) / width);
            width = 800;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          
          // Nén thành chuẩn JPEG 70% giúp giảm 90% dung lượng chuỗi Base64
          setPreviewImage(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchFilters = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/filters`);
      const data = await response.json();
      if (data.success) {
        setFilters(data.filters);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách filter:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleAddFilter = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/filters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` // Gửi token để xác thực Admin
        },
        body: JSON.stringify({ ...newFilter, image: previewImage })
      });
      const data = await response.json();
      console.log(data)
      if (data.success) {
        alert("Thêm filter thành công!");
        setShowAddModal(false);
        setNewFilter({ name: "", filter: "none" }); // Reset form
        setSliderValues(defaultSliders); // Reset sliders
        setIsManualCss(false); // Reset trạng thái nhập thủ công
        fetchFilters(); // Cập nhật lại danh sách
      } else {
        alert(data.message || "Lỗi khi thêm filter");
      }
    } catch (error) {
      console.error("Lỗi thêm filter:", error);
      alert("Lỗi kết nối đến server");
    }
  };

  const handleDeleteFilter = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa filter này?")) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/filters/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        alert("Xóa filter thành công!");
        fetchFilters();
      } else {
        alert(data.message || "Lỗi khi xóa filter");
      }
    } catch (error) {
      console.error("Lỗi xóa filter:", error);
      alert("Lỗi kết nối đến server");
    }
  };

  const renderSlider = (label, key, min, max, unit = "") => (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontWeight: "bold", color: "#4b5563", fontSize: "13px" }}>
        <span>{label}</span>
        <span style={{ color: "#4f46e5" }}>{sliderValues[key]}{unit}</span>
      </label>
      <input 
        type="range" min={min} max={max} value={sliderValues[key]} onChange={e => setSliderValues({...sliderValues, [key]: Number(e.target.value)})} 
        style={{ width: "100%", cursor: "pointer", accentColor: "#4f46e5" }} 
      />
    </div>
  );

  const filteredFilters = filters.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, color: "#111827" }}>Quản lý Filter</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
          >
            + Thêm Filter mới
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input 
          type="text" 
          placeholder="🔍 Tìm kiếm filter theo tên..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box", fontSize: "14px", outline: "none" }} 
        />
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", borderRadius: "8px", overflow: "hidden" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e5e7eb", color: "#374151", width: "100px" }}>Ảnh minh họa</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>Tên Filter</th>
              <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>Mã CSS (filter)</th>
              <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e5e7eb", color: "#374151" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredFilters.length > 0 ? filteredFilters.map(f => (
              <tr key={f._id} style={{ borderBottom: "1px solid #e5e7eb", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: "15px", textAlign: "center" }}>
                  <img src={f.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"} alt={f.name} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", filter: f.filter, border: "1px solid #e5e7eb" }} />
                </td>
                <td style={{ padding: "15px", fontWeight: "bold", color: "#111827" }}>{f.name}</td>
                <td style={{ padding: "15px", color: "#6b7280", fontFamily: "monospace" }}>{f.filter}</td>
                <td style={{ padding: "15px", textAlign: "center" }}>
                  <button 
                    onClick={() => handleDeleteFilter(f._id)}
                    style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: "30px", textAlign: "center", color: "#6b7280" }}>Không tìm thấy filter nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal Thêm Filter */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "800px", maxWidth: "95%", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "22px", color: "#111827" }}>🎨 Tạo Filter (Lightroom Style)</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>❌</button>
            </div>
            
            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              {/* Cột trái: Kéo thanh trượt */}
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "10px", opacity: isManualCss ? 0.4 : 1, pointerEvents: isManualCss ? "none" : "auto", transition: "0.3s" }}>
                <div style={{ background: "#f9fafb", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", maxHeight: "55vh", overflowY: "auto" }}>
                  <details open style={{ marginBottom: "15px", background: "#fff", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <summary style={{ fontWeight: "bold", cursor: "pointer", fontSize: "15px", color: "#111827", userSelect: "none" }}>☀️ Light (Ánh sáng)</summary>
                  <div style={{ marginTop: "15px" }}>
                    {renderSlider("Exposure (Phơi sáng)", "exposure", 0, 200)}
                    {renderSlider("Contrast (Tương phản)", "contrast", 0, 200)}
                    {renderSlider("Highlights (Vùng sáng)", "highlights", -100, 100)}
                    {renderSlider("Shadows (Vùng tối)", "shadows", -100, 100)}
                    {renderSlider("Whites (Màu trắng)", "whites", -100, 100)}
                    {renderSlider("Blacks (Màu đen)", "blacks", -100, 100)}
                  </div>
                </details>

                <details style={{ marginBottom: "15px", background: "#fff", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <summary style={{ fontWeight: "bold", cursor: "pointer", fontSize: "15px", color: "#111827", userSelect: "none" }}>🎨 Color (Màu sắc)</summary>
                  <div style={{ marginTop: "15px" }}>
                    {renderSlider("White Balance (Nhiệt độ)", "temperature", -100, 100)}
                    {renderSlider("Tint (Sắc thái)", "tint", -100, 100)}
                    {renderSlider("Vibrance (Độ chói)", "vibrance", -100, 100)}
                    {renderSlider("Saturation (Bão hòa)", "saturation", 0, 200)}
                  </div>
                </details>

                <details style={{ marginBottom: "15px", background: "#fff", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <summary style={{ fontWeight: "bold", cursor: "pointer", fontSize: "15px", color: "#111827", userSelect: "none" }}>✨ Effects (Hiệu ứng)</summary>
                  <div style={{ marginTop: "15px" }}>
                    {renderSlider("Texture", "texture", -100, 100)}
                    {renderSlider("Clarity", "clarity", -100, 100)}
                    {renderSlider("Dehaze", "dehaze", -100, 100)}
                    {renderSlider("Vignette (Hỗ trợ hạn chế)", "vignette", -100, 100)}
                    {renderSlider("Grain (Hỗ trợ hạn chế)", "grain", 0, 100)}
                  </div>
                </details>

                <details style={{ marginBottom: "15px", background: "#fff", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <summary style={{ fontWeight: "bold", cursor: "pointer", fontSize: "15px", color: "#111827", userSelect: "none" }}>🌈 Color Mixer (HSL)</summary>
                  <div style={{ marginTop: "15px" }}>
                    {colorMixerOptions.map(c => (
                      <details key={c.id} style={{ marginBottom: "10px", background: "#f9fafb", padding: "8px", borderRadius: "6px" }}>
                        <summary style={{ fontWeight: "bold", cursor: "pointer", fontSize: "13px", color: c.color }}>{c.label}</summary>
                        <div style={{ marginTop: "10px" }}>
                          {renderSlider("Hue", `hue${c.id}`, -100, 100, "")}
                          {renderSlider("Saturation", `sat${c.id}`, -100, 100, "")}
                          {renderSlider("Luminance", `lum${c.id}`, -100, 100, "")}
                        </div>
                      </details>
                    ))}
                  </div>
                  </details>
                </div>

                <button 
                  type="button" 
                  onClick={() => setSliderValues(defaultSliders)} 
                  style={{ width: "100%", padding: "10px", background: "#e5e7eb", color: "#4b5563", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" }}
                >
                  🔄 Đặt lại mặc định
                </button>
              </div>

              {/* Cột phải: Preview và Form */}
              <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0, color: "#374151", fontSize: "16px" }}>Bản xem trước (Preview)</h4>
                    <label style={{ cursor: "pointer", background: "#e5e7eb", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", color: "#374151", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.background='#d1d5db'} onMouseOut={e => e.currentTarget.style.background='#e5e7eb'}>
                      📸 Tải ảnh lên
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    </label>
                  </div>
                  <div style={{ width: "100%", height: "300px", background: "#e5e7eb", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: newFilter.filter }} 
                    />
                  </div>
                </div>

                <form onSubmit={handleAddFilter} style={{ display: "flex", flexDirection: "column", gap: "15px", background: "#f9fafb", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                  <div><label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#374151", fontSize: "14px" }}>Tên Filter (VD: Mùa Thu):</label><input type="text" value={newFilter.name} onChange={e => setNewFilter({...newFilter, name: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box", fontSize: "15px" }} /></div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                      <label style={{ fontWeight: "bold", color: "#374151", fontSize: "14px" }}>Mã CSS:</label>
                      <label style={{ fontSize: "13px", color: "#4f46e5", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: "bold" }}>
                        <input type="checkbox" checked={isManualCss} onChange={e => {
                          const checked = e.target.checked;
                          setIsManualCss(checked);
                          if (checked && newFilter.filter === "none") setNewFilter({...newFilter, filter: ""});
                        }} style={{ cursor: "pointer" }} /> 
                        Nhập thủ công
                      </label>
                    </div>
                    <input type="text" value={newFilter.filter} onChange={e => {
                      if (isManualCss) {
                        // Tự động xóa chữ "filter:" và dấu ";" nếu người dùng copy dán dư
                        const val = e.target.value.replace(/filter:\s*/i, '').replace(/;/g, '');
                        setNewFilter({...newFilter, filter: val});
                      }
                    }} placeholder="VD: sepia(100%) hue-rotate(90deg)" readOnly={!isManualCss} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box", fontSize: "13px", background: isManualCss ? "#fff" : "#e5e7eb", color: isManualCss ? "#111827" : "#6b7280", fontFamily: "monospace", outline: isManualCss ? "2px solid #4f46e5" : "none" }} />
                  </div>
                  
                  <button type="submit" style={{ padding: "12px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", marginTop: "10px", transition: "0.2s", boxShadow: "0 4px 6px rgba(79, 70, 229, 0.3)" }} onMouseOver={e => e.currentTarget.style.background='#4338ca'} onMouseOut={e => e.currentTarget.style.background='#4f46e5'}>
                    💾 Lưu Filter
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterManager;