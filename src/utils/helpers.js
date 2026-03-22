import React from 'react';

export const LayoutPreview = ({ layout, scale = 1 }) => {
  const isLandscape = layout === "single" || layout === "grid-4";
  const w = isLandscape ? 60 * scale : 40 * scale;
  const h = isLandscape ? 40 * scale : 60 * scale;
  const containerStyle = {
    width: `${w}px`, height: `${h}px`, backgroundColor: "#fff", border: "1px solid #9ca3af",
    display: "flex", padding: `${2 * scale}px`, boxSizing: "border-box", gap: `${2 * scale}px`, boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  if (layout === "single") {
    return <div style={containerStyle}><div style={{ flex: 1, backgroundColor: "#d1d5db" }} /></div>;
  }
  if (layout === "vertical-2" || layout === "vertical-3" || !layout) {
    const rows = layout === "vertical-2" ? 2 : 3;
    return (
      <div style={{ ...containerStyle, flexDirection: "column", gap: `${4 * scale}px` }}>
        {Array.from({ length: rows }).map((_, i) => <div key={i} style={{ flex: 1, backgroundColor: "#d1d5db" }} />)}
      </div>
    );
  }
  if (layout === "grid-4") {
    return (
      <div style={{ ...containerStyle, flexWrap: "wrap" }}>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ width: `calc(50% - ${1 * scale}px)`, height: `calc(50% - ${1 * scale}px)`, backgroundColor: "#d1d5db" }} />)}
      </div>
    );
  }
  if (layout === "grid-6") {
    return (
      <div style={{ ...containerStyle, flexWrap: "wrap" }}>
        {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ width: `calc(50% - ${1 * scale}px)`, height: `calc(33.33% - ${1 * scale}px)`, backgroundColor: "#d1d5db" }} />)}
      </div>
    );
  }
  if (layout === "grid-8") {
    return (
      <div style={{ ...containerStyle, flexWrap: "wrap" }}>
        {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ width: `calc(50% - ${1 * scale}px)`, height: `calc(25% - ${1.5 * scale}px)`, backgroundColor: "#d1d5db" }} />)}
      </div>
    );
  }
  return null;
};

export const generateSampleFrame = (style, layout) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  const isLandscape = layout === "single" || layout === "grid-4";
  canvas.width = isLandscape ? 1800 : 1200;
  canvas.height = isLandscape ? 1200 : 1800;

  const drawText = (text, color, font = "bold 70px 'Times New Roman'") => {
    ctx.fillStyle = color; ctx.font = font; ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height - 50);
  };

  if (style === "tet") {
    ctx.fillStyle = "#DC2626"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#FBBF24"; ctx.lineWidth = 15; ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    for(let i=0; i<20; i++) { ctx.fillStyle = "#FBBF24"; ctx.beginPath(); ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, 15, 0, Math.PI*2); ctx.fill(); }
    drawText("CHÚC MỪNG NĂM MỚI", "#FBBF24");
  } else if (style === "sen") {
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height); grd.addColorStop(0, "#FCE4EC"); grd.addColorStop(1, "#F48FB1");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height); drawText("Hoa Sen Việt", "#880E4F", "italic bold 80px serif");
  } else if (style === "dongson") {
    ctx.fillStyle = "#B45309"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = "#78350F"; ctx.lineWidth = 5;
    for(let r=100; r<canvas.width; r+=150) { ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, r, 0, Math.PI*2); ctx.stroke(); }
    drawText("HÀO KHÍ ĐÔNG SƠN", "#FEF3C7");
  } else if (style === "hoian") {
    ctx.fillStyle = "#F59E0B"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#B91C1C";
    for(let i=100; i<canvas.width; i+=250) { ctx.beginPath(); ctx.ellipse(i, 80, 40, 60, 0, 0, Math.PI*2); ctx.fill(); }
    drawText("Phố Cổ Hội An", "#78350F", "italic bold 80px serif");
  } else if (style === "aodai") {
    ctx.fillStyle = "#E0F2FE"; ctx.fillRect(0, 0, canvas.width, canvas.height); drawText("Dáng Lụa Áo Dài", "#0369A1", "italic 80px serif");
  } else if (style === "nonla") {
    ctx.fillStyle = "#FEF3C7"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = "#D97706"; ctx.lineWidth = 2;
    for(let i=0; i<canvas.height; i+=30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i+50); ctx.stroke(); }
    drawText("Nón Lá Việt Nam", "#92400E");
  } else if (style === "cafe") {
    ctx.fillStyle = "#451A03"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#FEF3C7"; ctx.fillRect(0, canvas.height - 200, canvas.width, 200); drawText("Cà Phê Sữa Đá", "#78350F");
  } else if (style === "tre") {
    ctx.fillStyle = "#DCFCE7"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#166534";
    for(let i=50; i<canvas.width; i+=200) { ctx.fillRect(i, 0, 30, canvas.height); ctx.fillRect(i-5, canvas.height/3, 40, 10); }
    drawText("Tre Làng", "#14532D", "bold 80px serif");
  } else if (style === "xichlo") { ctx.fillStyle = "#1F2937"; ctx.fillRect(0, 0, canvas.width, canvas.height); drawText("Xích Lô Dạo Phố", "#F9FAFB");
  } else if (style === "ruongbac") {
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height); grd.addColorStop(0, "#84CC16"); grd.addColorStop(1, "#EAB308");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height); drawText("Mùa Vàng Tây Bắc", "#14532D");
  } else if (style === "halong") {
    ctx.fillStyle = "#0EA5E9"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#064E3B";
    ctx.beginPath(); ctx.moveTo(0, canvas.height); ctx.lineTo(150, canvas.height-300); ctx.lineTo(300, canvas.height); ctx.fill(); drawText("Vịnh Hạ Long", "#F0F9FF");
  } else if (style === "hanoi") { ctx.fillStyle = "#FEF08A"; ctx.fillRect(0, 0, canvas.width, canvas.height); drawText("Hà Nội Mùa Thu", "#854D0E", "italic 80px serif");
  } else if (style === "saigon") {
    ctx.fillStyle = "#09090B"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#EC4899"; ctx.fillRect(100, 100, 20, 20); ctx.fillStyle = "#3B82F6"; ctx.fillRect(canvas.width-150, 200, 20, 20); drawText("Sài Gòn Night", "#A78BFA", "bold 80px sans-serif");
  } else if (style === "muaroi") { ctx.fillStyle = "#1E3A8A"; ctx.fillRect(0, 0, canvas.width, canvas.height); drawText("Múa Rối Nước", "#FDE047");
  } else if (style === "chimlac") { ctx.fillStyle = "#92400E"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = "#FDE047"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(canvas.width/2, 100, 50, 0, Math.PI); ctx.stroke(); drawText("Chim Lạc Tung Cánh", "#FEF3C7");
  } else if (style === "denlong") { ctx.fillStyle = "#450A0A"; ctx.fillRect(0, 0, canvas.width, canvas.height); drawText("Đêm Lồng Đèn", "#EF4444");
  } else if (style === "trongcom") { ctx.fillStyle = "#EA580C"; ctx.fillRect(0, 0, canvas.width, canvas.height); drawText("Tình Bằng Trống Cơm", "#FFFbeb", "italic bold 70px serif");
  } else if (style === "banto") { ctx.fillStyle = "#18181B"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = "#EF4444"; ctx.lineWidth=10; ctx.strokeRect(20,20,canvas.width-40, canvas.height-40); ctx.strokeStyle = "#3B82F6"; ctx.lineWidth=10; ctx.strokeRect(40,40,canvas.width-80, canvas.height-80); drawText("Hoa Văn Thổ Cẩm", "#FACC15");
  } else if (style === "nhatrang") { ctx.fillStyle = "#38BDF8"; ctx.fillRect(0, 0, canvas.width, canvas.height); drawText("Biển Xanh Nắng Vàng", "#0C4A6E");
  } else if (style === "nemchua") { ctx.fillStyle = "#FCA5A5"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = "#22C55E"; ctx.fillRect(0, 0, 50, canvas.height); ctx.fillRect(canvas.width-50, 0, 50, canvas.height); drawText("Đặc Sản Quê Hương", "#7F1D1D"); 
  } else if (style === "birthday") {
    ctx.fillStyle = "#FEF08A"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i<40; i++) {
      ctx.fillStyle = ["#EF4444", "#3B82F6", "#10B981", "#A855F7", "#EC4899"][Math.floor(Math.random()*5)];
      ctx.beginPath(); ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*15 + 5, 0, Math.PI*2); ctx.fill();
    }
    drawText("🎉 HAPPY BIRTHDAY 🎉", "#B45309", "bold 80px sans-serif");
  } else if (style === "neon") {
    ctx.fillStyle = "#09090b"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 15; ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    ctx.strokeStyle = "#e879f9"; ctx.lineWidth = 8; ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    drawText("N E O N   V I B E S", "#22d3ee", "bold 80px sans-serif");
  }

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,1)";
  const count = layout === "single" ? 1 : layout === "vertical-2" ? 2 : layout === "vertical-3" || !layout ? 3 : layout === "grid-4" ? 4 : layout === "grid-6" ? 6 : 8;
  for(let index = 0; index < count; index++) {
      if (layout === "single") { ctx.fillRect(150, 100, 1500, 1000); } else if (layout === "vertical-2") { ctx.fillRect(75, 133 + index * 833, 1050, 700); } else if (layout === "vertical-3" || !layout) { ctx.fillRect(180, 30 + index * 590, 840, 560); } else if (layout === "grid-4") { let col = index % 2; let row = Math.floor(index / 2); ctx.fillRect(66 + col * 868, 44 + row * 579, 800, 533); } else if (layout === "grid-6") { let col = index % 2; let row = Math.floor(index / 2); ctx.fillRect(66 + col * 568, 200 + row * 450, 500, 333); } else if (layout === "grid-8") { let col = index % 2; let row = Math.floor(index / 2); ctx.fillRect(60 + col * 570, 88 + row * 428, 510, 340); }
  }
  ctx.globalCompositeOperation = "source-over";
  return canvas.toDataURL("image/png");
};