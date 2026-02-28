// import React, { useState, useEffect, useRef } from 'react';
// // import QRCode from 'qrcode';

// function App() {
//   const [devices, setDevices] = useState([]);
//   const [selectedDevice, setSelectedDevice] = useState('');
//   const [stream, setStream] = useState(null);
//   const [photos, setPhotos] = useState([]);
//   const [selectedPhotos, setSelectedPhotos] = useState([]);
//   // const [qrLinks, setQrLinks] = useState([]);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   // Khởi tạo Google API
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://apis.google.com/js/api.js';
//     script.onload = () => {
//       window.gapi.load('auth2', () => {
//         window.gapi.auth2.init({
//           client_id: 'YOUR_CLIENT_ID'  // Thay bằng Client ID thực tế
//         });
//       });
//     };
//     document.body.appendChild(script);

//     // Liệt kê thiết bị camera
//     navigator.mediaDevices.enumerateDevices().then(devices => {
//       const videoDevices = devices.filter(device => device.kind === 'videoinput');
//       setDevices(videoDevices);
//     });
//   }, []);

//   // Bắt đầu camera
//   const startCamera = () => {
//     navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedDevice } })
//       .then(s => {
//         setStream(s);
//         if (videoRef.current) {
//           videoRef.current.srcObject = s;
//         }
//       })
//       .catch(err => console.error('Lỗi truy cập camera:', err));
//   };

//   // Chụp ảnh
//   const capturePhoto = () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     ctx.drawImage(video, 0, 0);
//     const dataUrl = canvas.toDataURL('image/png');
//     setPhotos(prev => [...prev, dataUrl]);
//   };

//   // Chọn ảnh để thêm frame
//   const toggleSelect = (index) => {
//     if (selectedPhotos.includes(index)) {
//       setSelectedPhotos(prev => prev.filter(i => i !== index));
//     } else {
//       setSelectedPhotos(prev => [...prev, index]);
//       // Thêm frame overlay (vẽ trên canvas tạm thời)
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext('2d');
//       const img = new Image();
//       img.src = '/frame.png';  // Đường dẫn đến frame trong public
//       img.onload = () => {
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//         const framedDataUrl = canvas.toDataURL('image/png');
//         setPhotos(prev => prev.map((photo, i) => i === index ? framedDataUrl : photo));
//       };
//     }
//   };

//   // // In: Tải lên Drive và tạo QR
//   // const printPhotos = () => {
//   //   if (selectedPhotos.length === 0) return alert('Chọn ít nhất một ảnh!');
    
//   //   window.gapi.auth2.getAuthInstance().signIn().then(() => {
//   //     selectedPhotos.forEach(index => {
//   //       const photoData = photos[index].split(',')[1];
//   //       uploadToDrive(photoData, `photo_${index}.png`);
//   //     });
//   //   });
//   // };

//   // Hàm tải lên Google Drive
//   // const uploadToDrive = (data, filename) => {
//   //   const file = new Blob([atob(data)], { type: 'image/png' });
//   //   const metadata = {
//   //     name: filename,
//   //     mimeType: 'image/png'
//   //   };
//   //   const form = new FormData();
//   //   form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
//   //   form.append('file', file);
    
//   //   fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
//   //     method: 'POST',
//   //     headers: {
//   //       Authorization: `Bearer ${window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
//   //     },
//   //     body: form
//   //   }).then(response => response.json()).then(file => {
//   //     const link = `https://drive.google.com/file/d/${file.id}/view`;
//   //     // setQrLinks(prev => [...prev, link]);
//   //     generateQR(link);
//   //   }).catch(err => console.error('Lỗi tải lên Drive:', err));
//   // };

//   // // Tạo mã QR
//   // const generateQR = (link) => {
//   //   // Sử dụng QRCode để tạo canvas QR
//   //   const canvas = document.createElement('canvas');
//   //   QRCode.toCanvas(canvas, link, { width: 200 }, (error) => {
//   //     if (error) console.error(error);
//   //     // Thêm canvas vào DOM (hoặc lưu vào state nếu cần)
//   //     document.getElementById('qrContainer').appendChild(canvas);
//   //   });
//   // };

//   return (
//   <div className="booth-container">
//       <h1>Photobooth</h1>
      
//       {/* Chọn thiết bị camera */}
//       <label htmlFor="deviceSelect">Chọn camera:</label>
//       <select id="deviceSelect" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
//         <option value="">Chọn camera</option>
//         {devices.map(device => (
//           <option key={device.deviceId} value={device.deviceId}>
//             {device.label || `Camera ${device.deviceId}`}
//           </option>
//         ))}
//       </select>
//       <button onClick={startCamera}>Bắt đầu</button>
      
//       {/* Video và nút chụp */}
//       <video ref={videoRef} autoPlay style={{ width: '400px', height: '300px', border: '1px solid #ccc' }} />
//       <button onClick={capturePhoto} style={{ display: stream ? 'block' : 'none' }}>Chụp ảnh</button>
      
//       {/* Danh sách ảnh */}
//       <h2>Danh sách ảnh</h2>
//       <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
//         {photos.map((photo, index) => (
//           <img
//             key={index}
//             src={photo}
//            alt={`Ảnh số ${index}`}
//             style={{
//               width: '100px',
//               height: '100px',
//               margin: '10px',
//               border: selectedPhotos.includes(index) ? '2px solid red' : '1px solid #000',
//               cursor: 'pointer'
//             }}
//             onClick={() => toggleSelect(index)}
//           />
//         ))}
//       </div>
//       {/* <button onClick={printPhotos} style={{ display: photos.length > 0 ? 'block' : 'none' }}>
//         In (Tải lên Drive & Tạo QR)
//       </button> */}
      
//       {/* Mã QR */}
//       {/* <div id="qrContainer" style={{ marginTop: '20px' }}></div>
      
//       <canvas ref={canvasRef} style={{ display: 'none' }} /> */}

//       /// mơi
//        <div className="booth-container">
//       <h2 className="booth-title">GET READY TO SMILE!</h2>
//       <p className="booth-countdown">3... 2... 1</p>

//       <div className="booth-main">
//         {/* Nút bên trái */}
//         <div className="booth-side left">
//           <button className="circle-btn">🎨</button>
//           <button className="circle-btn">🌈</button>
//           <button className="circle-btn">🔲</button>
//         </div>

//         {/* Ảnh trung tâm */}
//         <div className="booth-photo">
//             <video ref={videoRef} autoPlay style={{ width: '400px', height: '300px', border: '1px solid #ccc' }} />
        
//         </div>

//         {/* Nút bên phải */}
//         <div className="booth-side right">
//           <button className="circle-btn">🖼️</button>
//           <button className="circle-btn">⭐</button>
//           <button className="circle-btn">🔄</button>
//         </div>
//       </div>

//       {/* Nút dưới */}
//       <div className="booth-footer">
//         <button className="rect-btn gallery">GALLERY</button>
//         <button onClick={capturePhoto} className="rect-btn start">📸 START</button>
//         <button className="rect-btn retake">RETAKE</button>
//       </div>
//       <div className="image-list"> {photos.map((photo, index) => ( <div key={index} className="image-box"> <img src={photo} alt={`Ảnh số ${index}`} /> <div className="actions"> <button className="delete">🗑️</button> <button className="check">✔️</button> </div> </div> ))} </div>
//     </div>
//     </div>
//   );
// }

// export default App;
// //  import React, { useState, useEffect, useRef } from 'react';
// // import "./index.css";

// // export default function PhotoBooth() {
// //   const [photos, setPhotos] = useState([]);
// //   return (
//     // <div className="booth-container">
//     //   <h2 className="booth-title">GET READY TO SMILE!</h2>
//     //   <p className="booth-countdown">3... 2... 1</p>

//     //   <div className="booth-main">
//     //     {/* Nút bên trái */}
//     //     <div className="booth-side left">
//     //       <button className="circle-btn">🎨</button>
//     //       <button className="circle-btn">🌈</button>
//     //       <button className="circle-btn">🔲</button>
//     //     </div>

//     //     {/* Ảnh trung tâm */}
//     //     <div className="booth-photo">
//     //       <img
//     //         src="https://via.placeholder.com/400x300"
//     //         alt="Group photo"
//     //       />
//     //     </div>

//     //     {/* Nút bên phải */}
//     //     <div className="booth-side right">
//     //       <button className="circle-btn">🖼️</button>
//     //       <button className="circle-btn">⭐</button>
//     //       <button className="circle-btn">🔄</button>
//     //     </div>
//     //   </div>

//     //   {/* Nút dưới */}
//     //   <div className="booth-footer">
//     //     <button className="rect-btn gallery">GALLERY</button>
//     //     <button className="rect-btn start">📸 START</button>
//     //     <button className="rect-btn retake">RETAKE</button>
//     //   </div>
//     //   <div className="image-list"> {photos.map((photo, index) => ( <div key={index} className="image-box"> <img src={photo} alt={`Ảnh số ${index}`} /> <div className="actions"> <button className="delete">🗑️</button> <button className="check">✔️</button> </div> </div> ))} </div>
//     // </div>
// //   );
// // }
import React, { useState, useRef, useEffect } from 'react';

function App() {


  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [settings, setSettings] = useState({
    countdown: 3,
    photoCount: 1,
    filter: 'none',
    frame: null
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Liệt kê camera
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
    });
  }, []);

  // Bắt đầu camera
  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedDevice } })
      .then(s => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => console.error('Lỗi truy cập camera:', err));
  };

 const PHOTO_WIDTH = 600;
const PHOTO_HEIGHT = 400;

const capturePhoto = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');

  canvas.width = PHOTO_WIDTH;
  canvas.height = PHOTO_HEIGHT;

  // Vẽ video
  ctx.filter = settings.filter;
  ctx.drawImage(video, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);

  if (settings.frame) {
    const frameImg = new Image();
    frameImg.src = settings.frame;
    frameImg.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = PHOTO_WIDTH;
      tempCanvas.height = PHOTO_HEIGHT;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(frameImg, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);

      const imageData = tempCtx.getImageData(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      const data = imageData.data;

      // Biến pixel trắng thành trong suốt
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        if (r > 240 && g > 240 && b > 240) {
          data[i+3] = 0; // alpha = 0
        }
      }
      tempCtx.putImageData(imageData, 0, 0);

      // Vẽ frame đã xử lý lên canvas chính
      ctx.drawImage(tempCanvas, 0, 0);

      const dataUrl = canvas.toDataURL('image/png');
      setPhotos(prev => [...prev, dataUrl]);
    };
  } else {
    const dataUrl = canvas.toDataURL('image/png');
    setPhotos(prev => [...prev, dataUrl]);
  }
};



  // Chụp nhiều ảnh với countdown
  const captureWithSettings = async () => {
    for (let i = 0; i < settings.photoCount; i++) {
      await new Promise(resolve => setTimeout(resolve, settings.countdown * 1000));
      capturePhoto();
    }
  };

  // Chọn ảnh
  const toggleSelect = (index) => {
    if (selectedPhotos.includes(index)) {
      setSelectedPhotos(prev => prev.filter(i => i !== index));
    } else {
      setSelectedPhotos(prev => [...prev, index]);
    }
  };

  // In ảnh
  const printPhoto = (photo) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <body style="text-align:center;">
          <img src="${photo}" style="max-width:100%;"/>
          <script>window.print();</script>
        </body>
      </html>
    `);
  };
const [countdownValue, setCountdownValue] = useState(null);

const startCountdown = () => {
  let timeLeft = settings.countdown;
  setCountdownValue(timeLeft);

  const interval = setInterval(() => {
    timeLeft -= 1;
    setCountdownValue(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(interval);
      setCountdownValue(null); // ẩn số đếm
      captureWithSettings();   // bắt đầu chụp ảnh
    }
  }, 1000);
};

  return (
    <div className="booth-container">
      <h1>Photobooth 🎉</h1>

      {/* Setting */}
      <div className="settings">
        <h2>⚙️ Cài đặt</h2>
        <label>Chọn camera:</label>
        <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
          <option value="">Chọn camera</option>
          {devices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
        <button onClick={startCamera}>Bắt đầu</button>

        <label>⏱️ Hẹn giờ (giây):</label>
        <input type="number" value={settings.countdown}
          onChange={(e) => setSettings({ ...settings, countdown: parseInt(e.target.value) })} />

        <label>📷 Số ảnh chụp:</label>
        <select value={settings.photoCount}
          onChange={(e) => setSettings({ ...settings, photoCount: parseInt(e.target.value) })}>
          <option value={1}>1</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>

        <label>🎨 Filter:</label>
        <select value={settings.filter}
          onChange={(e) => setSettings({ ...settings, filter: e.target.value })}>
          <option value="none">None</option>
          <option value="grayscale(100%)">Grayscale</option>
          <option value="sepia(100%)">Sepia</option>
          <option value="brightness(1.5)">Bright</option>
        </select>

        <label>🖼️ Frame:</label>
        <input 
  type="file" 
  accept="image/png, image/jpeg, image/jpg" 
  onChange={(e) => {
    if (e.target.files[0]) {
      setSettings({ ...settings, frame: URL.createObjectURL(e.target.files[0]) });
    }
  }} 
/>

      </div>

    <div style={{ position: 'relative', display: 'inline-block' }}>
  <video 
    ref={videoRef} 
    autoPlay 
    style={{ 
      width: `${PHOTO_WIDTH}px`, 
      height: `${PHOTO_HEIGHT}px`, 
      border: '1px solid #ccc', 
      filter: settings.filter 
    }} 
  />
  {countdownValue !== null && (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '80px',
      fontWeight: 'bold',
      color: 'red',
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: '20px',
      borderRadius: '10px'
    }}>
      {countdownValue}
    </div>
  )}
</div>


      {/* Nút chụp */}
      <div className="booth-footer">
       <button onClick={startCountdown} className="rect-btn start">📸 START</button>

      </div>

      {/* Gallery */}
      <h2>📂 Gallery</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {photos.map((photo, index) => (
          <div key={index} style={{ margin: '10px', textAlign: 'center' }}>
            <img
              src={photo}
              alt={`Ảnh số ${index}`}
              style={{
                width: '100px',
                height: '100px',
                border: selectedPhotos.includes(index) ? '2px solid red' : '1px solid #000',
                cursor: 'pointer'
              }}
              onClick={() => toggleSelect(index)}
            />
            <div>
              <button onClick={() => printPhoto(photo)}>🖨️ Print</button>
            </div>
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
