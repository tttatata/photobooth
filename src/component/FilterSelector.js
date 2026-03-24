import React, { useState, useEffect } from "react";


const FilterSelector = ({ settings, setSettings, isMobile, maxHeight }) => {
  const [filters, setFilters] = useState([
    { _id: "none", name: "Mặc định", filter: "none", icon: "🌈" }
  ]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || ""}/api/filters`);
        const data = await response.json();
        if (data.success) {
          setFilters([
            { _id: "none", name: "Mặc định", filter: "none", icon: "🌈" },
            ...data.filters
          ]);
        }
      } catch (error) {
        console.error("Lỗi tải filter:", error);
      }
    };
    fetchFilters();
  }, []);

  return isMobile ? (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ fontWeight: "bold", color: "#d1d5db", fontSize: "14px", paddingLeft: "5px" }}>✨ Chọn Filter:</div>
      <div style={{ display: "flex", overflowX: "auto", gap: "10px", paddingBottom: "5px", scrollbarWidth: "none" }}>
        {filters.map(f => (
          <div key={f._id} className="filter-btn" onClick={() => setSettings({ ...settings, filter: f.filter })} style={{ flex: "0 0 auto", padding: "8px 16px", background: settings.filter === f.filter ? "#e0e7ff" : "#374151", color: settings.filter === f.filter ? "#4f46e5" : "#e5e7eb", borderRadius: "20px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            {f.icon ? (
              <span>{f.icon}</span>
            ) : f.image ? (
              <img src={f.image} alt={f.name} style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover", filter: f.filter }} />
            ) : (
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#ccc", filter: f.filter }}></div>
            )}
            {f.name}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", height: maxHeight, width: "190px" }}>
      <div style={{ fontWeight: "bold", color: "#374151", fontSize: "16px", marginBottom: "10px", textAlign: "center", paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>✨ Chọn Filter</div>
      <div className="filter-sidebar" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", overflowY: "auto", paddingRight: "5px", alignContent: "start", flex: 1 }}>
        {filters.map(f => (
          <div key={f._id} className="hover-btn" onClick={() => setSettings({ ...settings, filter: f.filter })} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "12px 6px", background: settings.filter === f.filter ? "#e0e7ff" : "#fff", color: settings.filter === f.filter ? "#4f46e5" : "#4b5563", border: settings.filter === f.filter ? "2px solid #4f46e5" : "1px solid #e5e7eb", borderRadius: "12px", cursor: "pointer", textAlign: "center", gap: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            {f.icon ? (
              <span style={{ fontSize: "28px", height: "44px", display: "flex", alignItems: "center" }}>{f.icon}</span>
            ) : f.image ? (
              <img src={f.image} alt={f.name} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", filter: f.filter, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
            ) : (
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#ccc", filter: f.filter, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}></div>
            )}
            <span style={{ fontSize: "12px", fontWeight: "bold", lineHeight: "1.3" }}>{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSelector;