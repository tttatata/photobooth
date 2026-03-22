import React, { useState } from "react";

const DrivePickerModal = ({ show, onClose, driveFolders, onSelectFolder, onCreateFolder, selectedFolderId }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!show) return null;

  const filtered = driveFolders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", width: "90%", maxWidth: "600px", height: "80vh", display: "flex", flexDirection: "column", gap: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <h2 style={{ marginTop: 0, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#111827" }}>
          <span>📂 Chọn thư mục Drive</span>
          <button className="hover-btn" onClick={onClose} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>❌</button>
        </h2>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <input 
            type="text" 
            placeholder="🔍 Tìm kiếm thư mục..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", outline: "none" }} 
          />
          <button className="hover-btn" onClick={() => { const name = prompt("Nhập tên thư mục sự kiện mới (VD: VietBooth_Event):"); if (name) { onCreateFolder(name); onClose(); } }} style={{ padding: "10px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap" }}>
            ➕ Tạo thư mục mới
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", gap: "5px", background: "#f9fafb" }}>
          <div onClick={() => { onSelectFolder(""); onClose(); }} className="hover-btn" style={{ padding: "15px", background: !selectedFolderId ? "#e0e7ff" : "#fff", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "15px", border: !selectedFolderId ? "2px solid #4f46e5" : "1px solid #e5e7eb", transition: "all 0.2s" }}>
            <span style={{ fontSize: "24px" }}>🏠</span>
            <span style={{ fontWeight: "bold", color: "#374151", flex: 1 }}>Thư mục gốc (Mặc định)</span>
            {!selectedFolderId && <span style={{ color: "#4f46e5", fontWeight: "bold" }}>✓ Đã chọn</span>}
          </div>
          
          {filtered.map(folder => (
            <div key={folder.id} onClick={() => { onSelectFolder(folder.id); onClose(); }} className="hover-btn" style={{ padding: "15px", background: selectedFolderId === folder.id ? "#e0e7ff" : "#fff", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "15px", border: selectedFolderId === folder.id ? "2px solid #4f46e5" : "1px solid #e5e7eb", transition: "all 0.2s" }}>
              <span style={{ fontSize: "24px" }}>📁</span>
              <span style={{ fontWeight: "bold", color: "#374151", flex: 1 }}>{folder.name}</span>
              {selectedFolderId === folder.id && <span style={{ color: "#4f46e5", fontWeight: "bold" }}>✓ Đã chọn</span>}
            </div>
          ))}

          {filtered.length === 0 && (
            <p style={{ textAlign: "center", color: "#6b7280", marginTop: "20px" }}>Không tìm thấy thư mục nào. Hãy tạo thư mục mới nhé!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrivePickerModal;