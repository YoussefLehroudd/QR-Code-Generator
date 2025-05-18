import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QrGenerator.css';

export default function QrGenerator() {
  const [text, setText] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [showLogoSection, setShowLogoSection] = useState(false);
  const [processedLogo, setProcessedLogo] = useState(null);

  const socialLogos = [
    { name: 'twitter', url: 'https://cdn-icons-png.flaticon.com/512/733/733579.png' },
    { name: 'youtube', url: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' },
    { name: 'instagram', url: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png' },
    { name: 'tiktok', url: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png' },
    { name: 'linkedin', url: 'https://cdn-icons-png.flaticon.com/512/174/174857.png' },
    { name: 'pinterest', url: 'https://cdn-icons-png.flaticon.com/512/145/145808.png' },
    { name: 'outlook', url: 'https://cdn-icons-png.flaticon.com/512/732/732223.png' },
    { name: 'apple', url: 'https://cdn-icons-png.flaticon.com/512/0/747.png' },
    { name: 'gmail', url: 'https://cdn-icons-png.flaticon.com/512/5968/5968534.png' },
    { name: 'whatsapp', url: 'https://cdn-icons-png.flaticon.com/512/733/733585.png' },
    { name: 'facebook', url: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' },
    { name: 'netflix', url: 'https://cdn-icons-png.flaticon.com/512/2504/2504929.png' }
  ];

  const processImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const padding = 10;
        const baseSize = Math.min(img.width, img.height);
        const size = baseSize + (padding * 2);
        
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        // Create rounded rectangle path
        const scale = 0.85;
        const scaledSize = baseSize * scale;
        const offsetX = (size - scaledSize) / 2;
        const offsetY = (size - scaledSize) / 2;
        const radius = 30;

        ctx.beginPath();
        ctx.moveTo(offsetX + radius, offsetY);
        ctx.lineTo(offsetX + scaledSize - radius, offsetY);
        ctx.quadraticCurveTo(offsetX + scaledSize, offsetY, offsetX + scaledSize, offsetY + radius);
        ctx.lineTo(offsetX + scaledSize, offsetY + scaledSize - radius);
        ctx.quadraticCurveTo(offsetX + scaledSize, offsetY + scaledSize, offsetX + scaledSize - radius, offsetY + scaledSize);
        ctx.lineTo(offsetX + radius, offsetY + scaledSize);
        ctx.quadraticCurveTo(offsetX, offsetY + scaledSize, offsetX, offsetY + scaledSize - radius);
        ctx.lineTo(offsetX, offsetY + radius);
        ctx.quadraticCurveTo(offsetX, offsetY, offsetX + radius, offsetY);
        ctx.closePath();
        ctx.clip();

        // Draw the image
        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          scaledSize,
          scaledSize
        );
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = src;
    });
  };

  useEffect(() => {
    if (selectedLogo) {
      processImage(selectedLogo).then(setProcessedLogo);
    }
  }, [selectedLogo]);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedLogo(e.target.result);
        setSelectedLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image less than 5MB');
    }
  };

  const handleLogoSelect = (logoUrl) => {
    setSelectedLogo(logoUrl);
    setUploadedLogo(null);
  };

  const handleDeleteUpload = () => {
    setUploadedLogo(null);
    setSelectedLogo(null);
    setProcessedLogo(null);
  };

  return (
    <div className="qr-container">
      <div className="qr-content">
        <div className="qr-form">
          <h1 className="qr-title">QR Code Generator</h1>
          <input
            type="text"
            placeholder="Enter URL or text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="qr-input"
          />

          <div className="logo-section">
            <button 
              className="logo-toggle-btn"
              onClick={() => setShowLogoSection(!showLogoSection)}
            >
              Add logo {showLogoSection ? '▼' : '▲'}
            </button>

            {showLogoSection && (
              <div className="logo-content">
                <h2>Select logo</h2>
                <div className="logo-grid">
                  {socialLogos.map((logo) => (
                    <div 
                      key={logo.name}
                      className={`logo-item ${selectedLogo === logo.url ? 'selected' : ''}`}
                      onClick={() => handleLogoSelect(logo.url)}
                    >
                      <img src={logo.url} alt={logo.name} />
                    </div>
                  ))}
                </div>

                <div className="divider">
                  <span>or</span>
                </div>

                <div className="logo-upload">
                  <h2>Upload your own logo</h2>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/svg+xml"
                    onChange={handleLogoUpload}
                    id="logo-upload"
                    className="hidden"
                  />
                  {uploadedLogo ? (
                    <div className="uploaded-preview-container">
                      <img src={uploadedLogo} alt="Uploaded logo" className="uploaded-preview" />
                      <button onClick={() => document.getElementById('logo-upload').click()} className="edit-btn">
                      </button>
                      <button onClick={handleDeleteUpload} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="logo-upload" className="upload-area">
                      <div className="upload-label">
                        <div className="upload-icon">📁</div>
                        Upload image (jpg, png, svg)
                        <div className="upload-size">Maximum size: 5 MB</div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {text && (
          <div className="qr-preview">
            <QRCodeSVG 
              value={text} 
              size={256}
              level="H"
              {...(processedLogo && {
                imageSettings: {
                  src: processedLogo,
                  height: 50,
                  width: 50,
                  excavate: true
                }
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
