import React, { useState, useRef } from 'react';

const PhotoTest = () => {
  const [frameStr, setFrameStr] = useState("");
  const [photoStrs, setPhotoStrs] = useState([]);
  const [resultImg, setResultImg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  const handleFrameUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFrameStr(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotosUpload = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    })).then(results => setPhotoStrs(results));
  };

  // Thuật toán quét điểm ảnh để tìm tọa độ lỗ hổng
  const detectHoles = (canvas, ctx) => {
    const scale = 0.1; // Thu nhỏ ảnh lại 10 lần để quét cho nhanh, không bị đơ trình duyệt
    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = Math.floor(canvas.width * scale) || 1;
    smallCanvas.height = Math.floor(canvas.height * scale) || 1;
    const smallCtx = smallCanvas.getContext("2d");
    smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
    
    const imageData = smallCtx.getImageData(0, 0, smallCanvas.width, smallCanvas.height);
    const data = imageData.data;
    const width = smallCanvas.width;
    const height = smallCanvas.height;
    const visited = new Uint8Array(width * height);
    const holes = [];

    // Hàm kiểm tra xem pixel có phải là lỗ hổng không (Trong suốt hoặc Trắng tinh)
    const isHolePixel = (idx) => {
      const r = data[idx * 4];
      const g = data[idx * 4 + 1];
      const b = data[idx * 4 + 2];
      const a = data[idx * 4 + 3];
      // Alpha thấp (trong suốt) HOẶC R,G,B cao và Alpha cao (Màu trắng)
      return a < 128 || (r > 240 && g > 240 && b > 240 && a > 200);
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        // Nếu pixel là trong suốt hoặc trắng và chưa được duyệt
        if (!visited[idx] && isHolePixel(idx)) {
          let minX = x, maxX = x, minY = y, maxY = y;
          const queue = [idx];
          visited[idx] = 1;
          let head = 0;
          
          // Lan truyền (Flood Fill) để tìm toàn bộ diện tích của 1 lỗ hổng
          while(head < queue.length) {
            const currIdx = queue[head++];
            const cx = currIdx % width;
            const cy = Math.floor(currIdx / width);

            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;

            const neighbors = [];
            if (cx > 0) neighbors.push(currIdx - 1);
            if (cx < width - 1) neighbors.push(currIdx + 1);
            if (cy > 0) neighbors.push(currIdx - width);
            if (cy < height - 1) neighbors.push(currIdx + width);

            for(let i=0; i<neighbors.length; i++) {
              const ni = neighbors[i];
              if (!visited[ni] && isHolePixel(ni)) {
                visited[ni] = 1;
                queue.push(ni);
              }
            }
          }
          const w = maxX - minX + 1;
          const h = maxY - minY + 1;
          // Lọc nhiễu: Lỗ hổng phải đủ lớn (lớn hơn 5% kích thước khung)
          if (w > width * 0.05 && h > height * 0.05) { 
            holes.push({ dx: Math.floor(minX / scale), dy: Math.floor(minY / scale), dw: Math.floor(w / scale), dh: Math.floor(h / scale) });
          }
        }
      }
    }
    // Sắp xếp các lỗ hổng từ trên xuống dưới, từ trái sang phải
    holes.sort((a, b) => {
      if (Math.abs(a.dy - b.dy) > (50 / scale)) return a.dy - b.dy;
      return a.dx - b.dx;
    });
    return holes;
  };

  const generate = async () => {
    if(!frameStr) return alert("Vui lòng tải Frame lên trước!");
    if(photoStrs.length === 0) return alert("Vui lòng tải ít nhất 1 ảnh chụp!");

    setIsProcessing(true);
    const frameImg = new Image();
    await new Promise(r => { frameImg.onload = r; frameImg.src = frameStr; });

    const canvas = canvasRef.current;
    canvas.width = frameImg.width;
    canvas.height = frameImg.height;
    const ctx = canvas.getContext("2d");

    // Nháp 1: Vẽ frame để tìm tọa độ lỗ hổng
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.drawImage(frameImg, 0, 0);
    const boxes = detectHoles(canvas, ctx);

    // VẼ CHÍNH THỨC
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // BƯỚC 1: VẼ FRAME LÊN TRƯỚC
    ctx.drawImage(frameImg, 0, 0);

    // --- THUẬT TOÁN MỚI: XÓA PHÔNG TRẮNG TẠI CÁC LỖ ---
    // Dành cho trường hợp user thiết kế ô hình chữ nhật màu trắng thay vì đục lỗ trong suốt
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const fData = frameData.data;
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      // Mở rộng vùng quét ra một chút (margin) để tránh viền răng cưa
      const margin = 10; 
      const startX = Math.max(0, box.dx - margin);
      const startY = Math.max(0, box.dy - margin);
      const endX = Math.min(canvas.width, box.dx + box.dw + margin);
      const endY = Math.min(canvas.height, box.dy + box.dh + margin);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * canvas.width + x) * 4;
          // Nếu pixel đó là màu trắng, biến nó thành trong suốt để lộ ảnh đằng sau
          if (fData[idx] > 240 && fData[idx + 1] > 240 && fData[idx + 2] > 240 && fData[idx + 3] > 200) {
            fData[idx + 3] = 0; 
          }
        }
      }
    }
    ctx.putImageData(frameData, 0, 0);

    // BƯỚC 2: CHUYỂN CHẾ ĐỘ VẼ RA ĐẰNG SAU FRAME (Luồn ảnh vào lỗ)
    ctx.globalCompositeOperation = 'destination-over';

    const loadedPhotos = await Promise.all(photoStrs.map(src => new Promise(r => {
      const img = new Image(); img.onload = () => r(img); img.src = src;
    })));

    // Vẽ ảnh lọt vào các hộp
    for(let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const img = loadedPhotos[i % loadedPhotos.length]; // Lặp lại ảnh nếu thiếu

      ctx.save();
      ctx.beginPath();
      ctx.rect(box.dx, box.dy, box.dw, box.dh);
      ctx.clip(); // Giới hạn vùng vẽ để không lem sang ảnh bên cạnh

      // Căn giữa và scale ảnh (như object-fit: cover)
      const imgRatio = img.width / img.height;
      const boxRatio = box.dw / box.dh;
      let drawW = box.dw, drawH = box.dh, offsetX = box.dx, offsetY = box.dy;
      if (imgRatio > boxRatio) { drawW = box.dh * imgRatio; offsetX = box.dx - (drawW - box.dw) / 2; } 
      else { drawH = box.dw / imgRatio; offsetY = box.dy - (drawH - box.dh) / 2; }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    }

    // BƯỚC 3: Vẽ phông nền trắng sau cùng
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'source-over'; // Trả về mặc định
    setResultImg(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", background: "#f3f4f6", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", background: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", color: "#111827", marginBottom: "30px" }}>🧪 Trang Test Auto-Hole Detection (Vẽ Ảnh Đằng Sau Frame)</h2>
        
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px", padding: "20px", border: "2px dashed #d1d5db", borderRadius: "12px", textAlign: "center" }}>
            <h3 style={{ color: "#374151" }}>1. Chọn Frame (PNG trong suốt)</h3>
            <input type="file" accept="image/png" onChange={handleFrameUpload} />
            {frameStr && <img src={frameStr} alt="frame" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", marginTop: "15px", background: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><rect width=\"10\" height=\"10\" fill=\"%23e5e7eb\"/><rect x=\"10\" y=\"10\" width=\"10\" height=\"10\" fill=\"%23e5e7eb\"/><rect x=\"10\" width=\"10\" height=\"10\" fill=\"%23f9fafb\"/><rect y=\"10\" width=\"10\" height=\"10\" fill=\"%23f9fafb\"/></svg>')" }}/>}
          </div>
          <div style={{ flex: "1 1 300px", padding: "20px", border: "2px dashed #d1d5db", borderRadius: "12px", textAlign: "center" }}>
            <h3 style={{ color: "#374151" }}>2. Chọn Các Ảnh Chụp</h3>
            <input type="file" accept="image/*" multiple onChange={handlePhotosUpload} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px", justifyContent: "center" }}>
              {photoStrs.map((src, i) => <img key={i} src={src} alt={`uploaded-${i}`} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}/>)}
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: "center" }}>
          <button onClick={generate} disabled={isProcessing} style={{ padding: "15px 40px", background: isProcessing ? "#9ca3af" : "#4f46e5", color: "#fff", border: "none", borderRadius: "30px", fontSize: "18px", fontWeight: "bold", cursor: isProcessing ? "not-allowed" : "pointer" }}>
            {isProcessing ? "⏳ Đang tính toán..." : "✨ Ghép Ảnh Thông Minh"}
          </button>
        </div>
        
        {resultImg && (
          <div style={{ marginTop: "40px", textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
            <h3 style={{ color: "#10b981" }}>🎉 Kết quả (Ảnh ghép):</h3>
            <img src={resultImg} alt="Result" style={{ maxWidth: "100%", maxHeight: "600px", objectFit: "contain", border: "4px solid #10b981", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }} />
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};
export default PhotoTest;