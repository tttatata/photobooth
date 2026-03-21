import React from "react";

const FilterModal = ({ show, onClose, settings, setSettings }) => {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", width: "80%", maxWidth: "300px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <h2>🎨 Filter</h2>
        <select
          value={settings.filter}
          onChange={(e) => setSettings({ ...settings, filter: e.target.value })}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
        >
          <option value="none">None</option>
          <option value="grayscale(100%)">Grayscale</option>
          <option value="sepia(100%)">Sepia</option>
          <option value="brightness(1.5)">Bright</option>
        </select>
        <button className="hover-btn" onClick={onClose} style={{ marginTop: "15px", padding: "10px", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Đóng</button>
      </div>
    </div>
  );
};
export default FilterModal;