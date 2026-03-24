import React from "react";

// Danh sách các Filter CSS miễn phí
const AVAILABLE_FILTERS = [
  { id: "none", label: "Mặc định", filter: "none", icon: "🌈" },
  { id: "beauty", label: "Làm đẹp", filter: "blur(0.5px) brightness(1.15) contrast(0.9) saturate(1.1)", icon: "🌸" },
  { id: "grayscale", label: "Trắng đen", filter: "grayscale(100%)", icon: "🎞️" },
  { id: "sepia", label: "Cổ điển", filter: "sepia(100%)", icon: "🟤" },
  { id: "vintage", label: "Vintage", filter: "sepia(50%) hue-rotate(-30deg) saturate(140%)", icon: "📽️" },
  { id: "cool", label: "Sắc Lạnh", filter: "hue-rotate(180deg) saturate(150%)", icon: "❄️" },
  { id: "warm", label: "Ấm áp", filter: "sepia(30%) saturate(140%) hue-rotate(-15deg)", icon: "☀️" },
  { id: "bright", label: "Tươi sáng", filter: "brightness(1.2) contrast(1.2) saturate(120%)", icon: "✨" },
  { id: "fade", label: "Sương mù", filter: "opacity(0.8) saturate(80%) brightness(1.2)", icon: "🌫️" },
];

const FilterSelector = ({ settings, setSettings, isMobile, maxHeight, customFilters = [] }) => {
  const allFilters = [...AVAILABLE_FILTERS, ...customFilters];

  return isMobile ? (
    <div style={{ display: "flex", overflowX: "auto", gap: "10px", paddingBottom: "5px", scrollbarWidth: "none" }}>
      {allFilters.map(f => (
        <div key={f.id} className="filter-btn" onClick={() => setSettings({ ...settings, filter: f.filter })} style={{ flex: "0 0 auto", padding: "8px 16px", background: settings.filter === f.filter ? "#e0e7ff" : "#374151", color: settings.filter === f.filter ? "#4f46e5" : "#e5e7eb", borderRadius: "20px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>{f.icon}</span> {f.label}
        </div>
      ))}
    </div>
  ) : (
    <div className="filter-sidebar" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight, overflowY: "auto", paddingRight: "10px" }}>
      {allFilters.map(f => (
        <div key={f.id} className="filter-btn" onClick={() => setSettings({ ...settings, filter: f.filter })} style={{ background: settings.filter === f.filter ? "#e0e7ff" : "#f9fafb", color: settings.filter === f.filter ? "#4f46e5" : "#4b5563", border: settings.filter === f.filter ? "2px solid #4f46e5" : "2px solid #e5e7eb" }}>
          <span style={{ fontSize: "20px" }}>{f.icon}</span>
          {f.label}
        </div>
      ))}
    </div>
  );
};

export default FilterSelector;