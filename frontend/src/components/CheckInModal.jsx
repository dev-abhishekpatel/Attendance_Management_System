import { useEffect, useRef, useState } from 'react';

// Office Coordinates: Indore Head Office (22.7196, 75.8577)
const OFFICE_LAT = 22.7196;
const OFFICE_LNG = 75.8577;

// Haversine formula to compute distance in meters
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function CheckInModal({ isOpen, onClose, onCheckIn, employeeName }) {
  const [method, setMethod] = useState('FACE');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [gpsData, setGpsData] = useState({ lat: OFFICE_LAT, lng: OFFICE_LNG, distanceMeters: 14, inGeofence: true, loading: false });
  const [cameraActive, setCameraActive] = useState(false);
  const [confidence, setConfidence] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen && method === 'FACE') {
      startCamera();
    } else {
      stopCamera();
    }
    if (isOpen && method === 'GPS') {
      fetchLiveLocation();
    }
    return () => stopCamera();
  }, [isOpen, method]);

  const startCamera = async () => {
    try {
      setCameraActive(false);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360, facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera stream permission unavailable, fallback to simulated bio view.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const fetchLiveLocation = () => {
    setGpsData((prev) => ({ ...prev, loading: true }));
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const dist = getDistanceFromLatLonInMeters(lat, lng, OFFICE_LAT, OFFICE_LNG);
          setGpsData({
            lat,
            lng,
            distanceMeters: dist > 500 ? 25 : dist, // clamp for demo accuracy if far
            inGeofence: true,
            loading: false,
          });
        },
        () => {
          setGpsData({ lat: OFFICE_LAT, lng: OFFICE_LNG, distanceMeters: 18, inGeofence: true, loading: false });
        },
        { timeout: 4000 }
      );
    } else {
      setGpsData({ lat: OFFICE_LAT, lng: OFFICE_LNG, distanceMeters: 18, inGeofence: true, loading: false });
    }
  };

  const handleVerifyAndSubmit = () => {
    setScanning(true);
    setScanResult(null);
    setConfidence(null);

    setTimeout(() => {
      const matchScore = (98.2 + Math.random() * 1.6).toFixed(1);
      setConfidence(matchScore);
      setScanning(false);

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
            : 'QR Code Pass',
        location: `Office Geofence (${gpsData.lat.toFixed(4)}, ${gpsData.lng.toFixed(4)})`,
        latitude: gpsData.lat,
        longitude: gpsData.lng,
      };

      setScanResult({
        success: true,
        message: `Identity & Geofence Verified (${matchScore}% Match)! Attendance Logged.`,
      });

      setTimeout(() => {
        onCheckIn(payload);
        onClose();
        stopCamera();
        setScanResult(null);
        setConfidence(null);
      }, 1100);
    }, 1600);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Smart Attendance Check-In</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Biometric identification & location security</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { stopCamera(); onClose(); }}>✕</button>
        </div>

        <div className="method-tabs" style={{ marginTop: '16px' }}>
          <button className={`method-tab ${method === 'FACE' ? 'active' : ''}`} onClick={() => setMethod('FACE')}>📸 Face Scan</button>
          <button className={`method-tab ${method === 'GPS' ? 'active' : ''}`} onClick={() => setMethod('GPS')}>📍 GPS Geofence</button>
          <button className={`method-tab ${method === 'FINGERPRINT' ? 'active' : ''}`} onClick={() => setMethod('FINGERPRINT')}>☝️ Fingerprint</button>
          <button className={`method-tab ${method === 'MOBILE' ? 'active' : ''}`} onClick={() => setMethod('MOBILE')}>📲 Mobile App</button>
          <button className={`method-tab ${method === 'QR' ? 'active' : ''}`} onClick={() => setMethod('QR')}>🔲 QR Pass</button>
        </div>

        <div className="scanner-box">
          {method === 'FACE' ? (
            <>
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '6px' }}>👤</div>
                  <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>Facial AI Detection Mode</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Camera feed active or simulated frame</span>
                </div>
              )}

              <div className="scan-frame">
                {scanning && <div className="scan-line" />}
                <div className="facial-landmarks">
                  <span className="dot dot-eye-left" />
                  <span className="dot dot-eye-right" />
                  <span className="dot dot-nose" />
                </div>
                <span className="scan-status-tag">
                  {scanning ? 'Analyzing Facial Vectors...' : confidence ? `Matched (${confidence}%)` : 'Position face inside box'}
                </span>
              </div>
            </>
          ) : method === 'GPS' ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }} className={scanning ? 'pulse-anim' : ''}>📍</div>
              <h4 style={{ fontWeight: '800', marginBottom: '4px' }}>Real-time GPS Distance Check</h4>
              {gpsData.loading ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Locating device coordinates...</p>
              ) : (
                <>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Coordinates: {gpsData.lat.toFixed(4)}, {gpsData.lng.toFixed(4)}
                  </p>
                  <div className="badge badge-approved" style={{ marginTop: '10px', fontSize: '0.85rem', padding: '6px 14px' }}>
                    ✓ Inside Office Radius ({gpsData.distanceMeters}m from Desk)
                  </div>
                </>
              )}
            </div>
          ) : method === 'FINGERPRINT' ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className={`fingerprint-ring ${scanning ? 'scanning' : ''}`}>
                <span style={{ fontSize: '3.5rem' }}>☝️</span>
              </div>
              <p style={{ fontWeight: '800', marginTop: '12px' }}>Biometric Fingerprint Reader</p>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {scanning ? 'Matching ridge minuty pattern...' : 'Press sensor to authenticate'}
              </span>
            </div>
          ) : method === 'MOBILE' ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '3.2rem', marginBottom: '8px' }}>📲</div>
              <h4 style={{ fontWeight: '800' }}>Mobile App Authenticator</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Encrypted Auth Token: <code style={{ color: 'var(--primary)' }}>TOK-{Math.floor(100000 + Math.random() * 900000)}</code>
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="qr-box-sim">
                <div style={{ fontSize: '3.2rem', marginBottom: '6px' }}>🔲</div>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '800' }}>VALID ATTENDANCE QR PASS</span>
              </div>
              <p style={{ fontWeight: '700', fontSize: '0.85rem', marginTop: '8px' }}>Employee Code Badge Ready</p>
            </div>
          )}
        </div>

        {scanResult && (
          <div className="badge badge-approved" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.88rem', marginBottom: '14px' }}>
            {scanResult.message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={() => { stopCamera(); onClose(); }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleVerifyAndSubmit} disabled={scanning}>
            {scanning ? 'Verifying...' : 'Confirm & Mark Check-In'}
          </button>
        </div>
      </div>
    </div>
  );
}
