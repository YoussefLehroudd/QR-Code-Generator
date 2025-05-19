import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import './QrGenerator.css';



export default function QrGenerator() {
  const defaultUrl = 'https://portfolio-qjxg.onrender.com';
  const [text, setText] = useState(defaultUrl);
  const [selectedLogo, setSelectedLogo] = useState('/portfolio_logo.png');
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [showLogoSection, setShowLogoSection] = useState(false);
  const [showLogoSettings, setShowLogoSettings] = useState(false);
  const [isLogoSectionClosing, setIsLogoSectionClosing] = useState(false);
  const [isLogoSettingsClosing, setIsLogoSettingsClosing] = useState(false);

  const handleLogoSectionToggle = () => {
    if (showLogoSection) {
      setIsLogoSectionClosing(true);
      setTimeout(() => {
        setShowLogoSection(false);
        setIsLogoSectionClosing(false);
      }, 500);
    } else {
      setShowLogoSection(true);
    }
  };

  const handleLogoSettingsToggle = () => {
    if (showLogoSettings) {
      setIsLogoSettingsClosing(true);
      setTimeout(() => {
        setShowLogoSettings(false);
        setIsLogoSettingsClosing(false);
      }, 500);
    } else {
      setShowLogoSettings(true);
    }
  };
  const [processedLogo, setProcessedLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(50);
  const [logoBgColor, setLogoBgColor] = useState('#FFFFFF');
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const qrRef = useRef();

  const socialLogos = [
    { name: 'portfolio', url: '/portfolio_logo.png' },
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

  const processImage = useCallback((src, bgColor) => {
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
        
        // Fill with custom background color
        ctx.fillStyle = bgColor;
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
  }, []);

  useEffect(() => {
    if (selectedLogo) {
      processImage(selectedLogo, logoBgColor).then(setProcessedLogo);
    }
  }, [selectedLogo, processImage, logoBgColor]);

  // Rest of the component code remains unchanged...
  const [showSizeError, setShowSizeError] = useState(false);

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
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 3000); // Hide after 3 seconds
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

  const [downloading, setDownloading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('png');

  const downloadQR = async (format) => {
    try {
      if (!qrRef.current) return;
      setDownloading(true);

      const svg = qrRef.current.querySelector('svg');
      if (!svg) throw new Error('QR Code not found');

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          try {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            let blob;
            let fileName;

            switch (format) {
              case 'svg':
                blob = new Blob([svgData], { type: 'image/svg+xml' });
                fileName = 'qrcode.svg';
                break;

              case 'png':
                blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                fileName = 'qrcode.png';
                break;

              case 'jpg':
                blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
                fileName = 'qrcode.jpg';
                break;

              case 'pdf':
                const pdf = new jsPDF({
                  orientation: 'portrait',
                  unit: 'mm',
                  format: 'a4'
                });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = 100;
                const imgHeight = 100;
                const x = (pdfWidth - imgWidth) / 2;
                const y = (pdfHeight - imgHeight) / 2;
                
                pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
                pdf.save('qrcode.pdf');
                resolve();
                return;

              default:
                throw new Error('Unsupported format');
            }

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Failed to load QR code image'));
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      });
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download QR code. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  return (
    <div className="qr-container">
      {showSizeError && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#333',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div>Please upload an image less than 5MB</div>
          <button 
            onClick={() => setShowSizeError(false)}
            style={{
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '0.5rem 2rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            OK
          </button>
        </div>
      )}
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
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div 
                onClick={handleLogoSectionToggle}
                style={{
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <span style={{ fontWeight: '800' }}>Add logo</span>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  style={{
                    transform: showLogoSection ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <path 
                    d="M7 10L12 15L17 10" 
                    stroke="#000" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {(showLogoSection || isLogoSectionClosing) && (
                <div className={`section-content ${isLogoSectionClosing ? 'closing' : ''}`}
                  style={{
                    padding: '1.5rem'
                  }}>
                  <h2 style={{fontWeight: '500', marginTop: '-30px', marginBottom: '10px'}}>Select logo</h2>
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
                    <h2 style={{ marginBottom: '1rem', fontWeight: '500'}}>Upload your own logo</h2>
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

            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
              overflow: 'hidden'
            }}>
              <div 
                onClick={handleLogoSettingsToggle}
                style={{
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontWeight: '800' }}>Logo Settings</span>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  style={{
                    transform: showLogoSettings ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <path 
                    d="M7 10L12 15L17 10" 
                    stroke="#000" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {(showLogoSettings || isLogoSettingsClosing) && (
                <div className={`section-content ${isLogoSettingsClosing ? 'closing' : ''}`}
                  style={{
                    padding: '1.5rem'
                  }}>
                  <div className="settings-group">
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>QR Code Color:</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={qrFgColor}
                          onChange={(e) => setQrFgColor(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <input
                          type="color"
                          value={qrFgColor}
                          onChange={(e) => setQrFgColor(e.target.value)}
                          style={{
                            width: '36px',
                            height: '36px',
                            padding: '2px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            overflow: 'hidden'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>QR Background:</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <input
                          type="color"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                           style={{
                            width: '36px',
                            height: '36px',
                            padding: '2px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            overflow: 'hidden'
                          }}
                        />
                      </div>
                    </div>
                    <label>
                      Logo Size:
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={logoSize}
                        onChange={(e) => setLogoSize(Number(e.target.value))}
                        className="size-slider"
                      />
                      <span>{logoSize}px</span>
                    </label>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Background Color:</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={logoBgColor}
                          onChange={(e) => setLogoBgColor(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                        <input
                          type="color"
                          value={logoBgColor}
                          onChange={(e) => setLogoBgColor(e.target.value)}
                           style={{
                            width: '36px',
                            height: '36px',
                            padding: '2px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            overflow: 'hidden'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

         {text && (
                  <div className="qr-preview" ref={qrRef}>
                    <QRCodeSVG 
                      value={text} 
                      size={256}
                      level="H"
                      fgColor={qrFgColor}
                      bgColor={qrBgColor}
                      {...(processedLogo && {
                        imageSettings: {
                          src: processedLogo,
                          height: logoSize,
                          width: logoSize,
                          excavate: true
                        }
                      })}
                    />
                    <button 
                      onClick={() => setShowDownloadModal(true)}
                      className="download-btn primary"
                    >
                      <span>Download QR Code</span>
                    </button>
        
                    {showDownloadModal && (
                      <div className="modal-overlay" onClick={() => setShowDownloadModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                          <button className="modal-close" onClick={() => setShowDownloadModal(false)}>
                            Close ✕
                          </button>
                          <h2 className="modal-title">Download your QR code</h2>
                          <p className="modal-subtitle">Select the format to download</p>
                          <div className="qr-preview-small">
                            <QRCodeSVG 
                              value={text} 
                              size={128}
                              level="H"
                              fgColor={qrFgColor}
                              bgColor={qrBgColor}
                              {...(processedLogo && {
                                imageSettings: {
                                  src: processedLogo,
                                  height: logoSize / 2,
                                  width: logoSize / 2,
                                  excavate: true
                                }
                              })}
                            />
                          </div>
                          <select 
                            className="format-select"
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                          >
                            <option value="png" className={selectedFormat === 'png' ? 'selected-option' : ''}>
                              PNG Image {selectedFormat === 'png' && '✓'}
                            </option>
                            <option value="svg" className={selectedFormat === 'svg' ? 'selected-option' : ''}>
                              SVG Vector {selectedFormat === 'svg' && '✓'}
                            </option>
                            <option value="jpg" className={selectedFormat === 'jpg' ? 'selected-option' : ''}>
                              JPG Image {selectedFormat === 'jpg' && '✓'}
                            </option>
                            <option value="pdf" className={selectedFormat === 'pdf' ? 'selected-option' : ''}>
                              PDF Document {selectedFormat === 'pdf' && '✓'}
                            </option>
                          </select>
                          <div className="modal-buttons">
                            <button 
                              className="download-btn primary"
                              onClick={() => {
                                downloadQR(selectedFormat);
                                setShowDownloadModal(false);
                              }}
                              disabled={downloading}
                            >
                              {downloading ? 'Downloading...' : 'Download'}
                            </button>
                            <button 
                              className="download-btn secondary"
                              onClick={async () => {
                                try {
                                  const canvas = document.createElement('canvas');
                                  const svg = qrRef.current.querySelector('svg');
                                  const svgData = new XMLSerializer().serializeToString(svg);
                                  const img = new Image();
                                  
                                  img.onload = async () => {
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    const ctx = canvas.getContext('2d');
                                    ctx.fillStyle = '#ffffff';
                                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                                    ctx.drawImage(img, 0, 0);
                                    
                                    canvas.toBlob(async (blob) => {
                                      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                                      if (navigator.share) {
                                        await navigator.share({
                                          title: 'QR Code',
                                          text: 'Check out this QR code!',
                                          url: text,
                                          files: [file]
                                        });
                                      } else {
                                        alert('Web Share API is not supported in your browser');
                                      }
                                    }, 'image/png');
                                  };
                                  
                                  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                                } catch (error) {
                                  console.error('Error sharing:', error);
                                  alert('Failed to share QR code');
                                }
                              }}
                            >
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}  
      </div>
    </div>
  );
}
