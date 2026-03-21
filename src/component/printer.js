import React, { useState } from "react";

const PrintModal = ({ photoUrl, onClose }) => {
  const [copies, setCopies] = useState(1);
  const [layout, setLayout] = useState("portrait");
  const [color, setColor] = useState("color");
  const [paperSize, setPaperSize] = useState("4x6");
  const [margins, setMargins] = useState("default");
  const [showMore, setShowMore] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    
    let pageSizeStr = "auto";
    if (paperSize === "4x6") {
      pageSizeStr = layout === "portrait" ? "4in 6in" : "6in 4in";
    } else if (paperSize === "2x6") {
      pageSizeStr = layout === "portrait" ? "2in 6in" : "6in 2in";
    } else {
      pageSizeStr = `${paperSize} ${layout}`;
    }

    const marginCSS = margins === "none" ? "0" : margins === "minimum" ? "5mm" : margins === "default" ? "10mm" : "0";
    const filterCSS = color === "bw" ? "grayscale(100%)" : "none";

    const imagesHtml = Array.from({ length: copies }).map(() => 
      `<img src="${photoUrl}" style="max-height:100vh; max-width:100%; object-fit: contain; page-break-after: always; display: block; margin: 0 auto; filter: ${filterCSS};"/>`
    ).join("");

    printWindow.document.write(`
      <html>
        <head>
          <style>
            @page { size: ${pageSizeStr}; margin: ${marginCSS}; }
            body { margin: 0; background: #fff; text-align: center; }
          </style>
        </head>
        <body>
          ${imagesHtml}
          <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body>
      </html>
    `);
  };

  const ControlRow = ({ label, children }) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
      <div style={{ flex: "0 0 130px", fontSize: "14px", color: "#555" }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  const selectStyle = { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000
    }}>
      <div style={{ background: "#fff", borderRadius: "8px", width: "90%", maxWidth: "1000px", height: "85vh", display: "flex", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
        
        {/* Left Panel - Preview */}
        <div style={{ flex: "1 1 60%", background: "#525659", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", overflow: "auto", position: "relative" }}>
          <img 
            src={photoUrl} 
            alt="preview" 
            style={{ 
              maxWidth: "100%", 
              maxHeight: "100%", 
              objectFit: "contain", 
              boxShadow: "0 0 10px rgba(0,0,0,0.5)", 
              background: "#fff",
              filter: color === "bw" ? "grayscale(100%)" : "none"
            }} 
          />
        </div>

        {/* Right Panel - Settings */}
        <div style={{ flex: "1 1 40%", display: "flex", flexDirection: "column", padding: "25px", overflowY: "auto", background: "#f8f9fa", borderLeft: "1px solid #ddd" }}>
          <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "22px", color: "#202124", fontWeight: "400" }}>Print</h2>
          
          <ControlRow label="Destination">
            <select style={selectStyle}>
              <option>Save as PDF</option>
              <option>System Printer</option>
            </select>
          </ControlRow>
          
          <ControlRow label="Pages">
            <select style={selectStyle}>
              <option>All</option>
              <option>Odd pages only</option>
              <option>Even pages only</option>
              <option>Custom</option>
            </select>
          </ControlRow>
          
          <ControlRow label="Copies">
            <input type="number" min="1" value={copies} onChange={e => setCopies(parseInt(e.target.value) || 1)} style={{ width: "80px", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }} />
          </ControlRow>
          
          <ControlRow label="Layout">
            <select value={layout} onChange={e => setLayout(e.target.value)} style={selectStyle}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </ControlRow>
          
          <ControlRow label="Color">
            <select value={color} onChange={e => setColor(e.target.value)} style={selectStyle}>
              <option value="color">Color</option>
              <option value="bw">Black and white</option>
            </select>
          </ControlRow>

          {/* More settings toggle */}
          <div 
            style={{ margin: "15px 0", cursor: "pointer", color: "#1a73e8", fontSize: "14px", fontWeight: "500", display: "inline-flex", alignItems: "center", userSelect: "none" }} 
            onClick={() => setShowMore(!showMore)}
          >
            <span style={{ display: "inline-block", width: "16px", transform: showMore ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▶</span> 
            More settings
          </div>

          {showMore && (
            <div style={{ paddingTop: "10px" }}>
              <ControlRow label="Paper size">
                <select value={paperSize} onChange={e => setPaperSize(e.target.value)} style={selectStyle}>
                  <option value="4x6">4x6 inch</option>
                  <option value="2x6">2x6 inch</option>
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </ControlRow>
              <ControlRow label="Pages per sheet">
                <select style={selectStyle}>
                  <option>1</option>
                  <option>2</option>
                  <option>4</option>
                  <option>6</option>
                  <option>9</option>
                  <option>16</option>
                </select>
              </ControlRow>
              <ControlRow label="Margins">
                <select value={margins} onChange={e => setMargins(e.target.value)} style={selectStyle}>
                  <option value="default">Default</option>
                  <option value="none">None</option>
                  <option value="minimum">Minimum</option>
                  <option value="custom">Custom</option>
                </select>
              </ControlRow>
              <ControlRow label="Scale">
                <select style={selectStyle}>
                  <option>Default</option>
                  <option>Fit to page</option>
                  <option>Custom</option>
                </select>
              </ControlRow>
              <ControlRow label="Options">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", color: "#555", display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="checkbox" /> Headers and footers
                  </label>
                  <label style={{ fontSize: "14px", color: "#555", display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="checkbox" /> Background graphics
                  </label>
                </div>
              </ControlRow>
            </div>
          )}

          <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "20px" }}>
            <button onClick={onClose} style={{ padding: "8px 20px", background: "transparent", color: "#1a73e8", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", fontWeight: "500", fontSize: "14px" }}>
              Cancel
            </button>
            <button onClick={handlePrint} style={{ padding: "8px 24px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500", fontSize: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
              Print
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintModal;
