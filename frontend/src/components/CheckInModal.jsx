import { useEffect, useRef, useState } from 'react';

export default function CheckInModal({ isOpen, onClose, onCheckIn, employeeName }) {
  const [method, setMethod] = useState('FACE');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [gpsLocation, setGpsLocation] = useState({ lat: 22.7196, lng: 75.8577, inGeofence: true, accuracy: 12 });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen && method === 'FACE') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, method]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.warn('Camera stream permission unavailable, using facial simulator mode.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleVerifyAndSubmit = () => {
    setScanning(true);
    setScanResult(null);

    // Simulate real biometric verification & GPS distance validation
    setTimeout(() => {
      setScanning(false);
      const isSuccess = true;

      const payload = {
        employee: employeeName || 'Abhishek Sharma',
        method:
          method === 'FACE'
            ? 'Face Recognition'
            : method === 'FINGERPRINT'
            ? 'Fingerprint Scanner'
            : method === 'GPS'
            ? 'GPS Geofence'
            : method === 'MOBILE'
            ? 'Mobile Biometric'
            : 'QR Code Backup',
        location: `Office Geofence (${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)})`,
        latitude: gpsLocation.lat,
        longitude: gpsLocation.lng,
      };

      setScanResult({ success: true, message: 'Identity & Geofence Verified Successfully!' });

      setTimeout(() => {
        onCheckIn(payload);
        onClose();
        stopCamera();
        setScanResult(null);
      }, 1200);
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Attendance Check-In</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select biometric method and verify location</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { stopCamera(); onClose(); }}>✕</button>
        </div>

        <div className="method-tabs" style={{ marginTop: '16px' }}>
          <button className={`method-tab ${method === 'FACE' ? 'active' : ''}`} onClick={() => setMethod('FACE')}>📸 Face Scan</button>
          <button className={`method-tab ${method === 'GPS' ? 'active' : ''}`} onClick={() => setMethod('GPS')}>📍 GPS Location</button>
          <button className={`method-tab ${method === 'FINGERPRINT' ? 'active' : ''}`} onClick={() => setMethod('FINGERPRINT')}>☝️ Fingerprint</button>
          <button className={`method-tab ${method === 'MOBILE' ? 'active' : ''}`} onClick={() => setMethod('MOBILE')}>📲 Mobile App</button>
          <button className={`method-tab ${method === 'QR' ? 'active' : ''}`} onClick={() => setMethod('QR')}>🔲 QR Code</button>
        </div>

        <div className="scanner-box">
          {method === 'FACE' ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
              <div className="scan-frame">
                {scanning && <div className="scan-line" />}
                <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '6px' }}>
                  {scanning ? 'Scanning Face...' : 'Align face in frame'}
                </span>
              </div>
            </>
          ) : method === 'GPS' ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📍</div>
              <p style={{ fontWeight: '700' }}>Office Geofence Verification</p>
              <span className="badge badge-approved" style={{ marginTop: '8px' }}>
                Inside Office Radius (Distance: 18m)
              </span>
            </div>
          ) : method === 'FINGERPRINT' ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '8px', opacity: scanning ? 0.6 : 1 }}>☝️</div>
              <p style={{ fontWeight: '700' }}>Touch Biometric Scanner</p>
            </div>
          ) : method === 'MOBILE' ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📲</div>
              <p style={{ fontWeight: '700' }}>Mobile App Token Active</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🔲</div>
              <p style={{ fontWeight: '700' }}>Scan Backup QR Badge</p>
            </div>
          )}
        </div>

        {scanResult && (
          <div className="badge badge-approved" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.88rem', marginBottom: '14px' }}>
            ✓ {scanResult.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={() => { stopCamera(); onClose(); }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleVerifyAndSubmit} disabled={scanning}>
            {scanning ? 'Verifying...' : 'Confirm Check-In'}
          </button>
        </div>
      </div>
    </div>
  );
}
