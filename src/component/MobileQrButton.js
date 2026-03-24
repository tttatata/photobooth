import React from "react";

const MobileQrButton = ({ settings, driveFolders, showSelectedFolderQr }) => {
  if (!settings.useDrive || !settings.driveFolderId) return null;
  if (!driveFolders.find(f => f.id === settings.driveFolderId)) return null;

  return (
    <button onClick={() => showSelectedFolderQr(settings.driveFolderId)} style={{ width: "100%", padding: "12px", background: "#1f2937", color: "#f9fafb", border: "1px solid #4b5563", borderRadius: "12px", fontWeight: "bold" }}>
      📲 Xem QR Album Sự Kiện
    </button>
  );
};

export default MobileQrButton;