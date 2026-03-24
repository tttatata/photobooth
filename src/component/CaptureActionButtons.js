import React from "react";

const CaptureActionButtons = ({ isMobile, isSessionActive, captureWithSettings, cancelSession, settings, currentSessionPhotos }) => {
  if (!isSessionActive) {
    return isMobile ? (
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={captureWithSettings} style={{ flex: 1, padding: "16px", fontSize: "18px", fontWeight: "900", color: "#fff", background: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)", border: "none", borderRadius: "30px", boxShadow: "0 10px 20px rgba(255, 8, 68, 0.3)", textTransform: "uppercase" }}>
          {settings.interval === 0 && currentSessionPhotos.length > 0 ? "📸 CHỤP TIẾP" : "📸 BẮT ĐẦU"}
        </button>
        {settings.interval === 0 && currentSessionPhotos.length > 0 && (
          <button onClick={cancelSession} style={{ padding: "0 25px", fontSize: "16px", fontWeight: "bold", color: "#ef4444", background: "#fee2e2", border: "none", borderRadius: "30px" }}>❌</button>
        )}
      </div>
    ) : (
      <>
        <button onClick={captureWithSettings} className="hover-btn" style={{ padding: "20px 60px", fontSize: "24px", fontWeight: "900", color: "#fff", background: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)", border: "none", borderRadius: "50px", cursor: "pointer", boxShadow: "0 15px 30px rgba(255, 8, 68, 0.3)", textTransform: "uppercase", letterSpacing: "2px", display: "flex", alignItems: "center", gap: "10px" }}>
          {settings.interval === 0 && currentSessionPhotos.length > 0 ? "📸 CHỤP TIẾP" : "📸 START"}
        </button>
        {settings.interval === 0 && currentSessionPhotos.length > 0 && (
          <button onClick={cancelSession} className="hover-btn" style={{ padding: "20px 40px", fontSize: "18px", fontWeight: "bold", color: "#ef4444", background: "#fee2e2", border: "none", borderRadius: "50px", cursor: "pointer", textTransform: "uppercase" }}>
            ❌ Hủy
          </button>
        )}
      </>
    );
  } else {
    return isMobile ? (
      <button onClick={cancelSession} style={{ width: "100%", padding: "16px", fontSize: "18px", fontWeight: "900", color: "#fff", background: "#ef4444", border: "none", borderRadius: "30px", boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)", textTransform: "uppercase" }}>
        ❌ HỦY CHỤP
      </button>
    ) : (
      <button onClick={cancelSession} className="hover-btn" style={{ padding: "20px 60px", fontSize: "24px", fontWeight: "900", color: "#fff", background: "#ef4444", border: "none", borderRadius: "50px", cursor: "pointer", boxShadow: "0 15px 30px rgba(239, 68, 68, 0.3)", textTransform: "uppercase", letterSpacing: "2px", display: "flex", alignItems: "center", gap: "10px" }}>
        ❌ HỦY CHỤP
      </button>
    );
  }
};

export default CaptureActionButtons;