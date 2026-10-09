import { useEffect, useState } from 'react';

export default function DigitalClockWidget({ onOpenCheckIn, user, onQuickCheckOut, todayAttendance }) {
  const [time, setTime] = useState(new Date());
  const [locationStatus, setLocationStatus] = useState('Detecting GPS...');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStatus(`GPS Verified (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        },
        () => {
          setLocationStatus('Indore Head Office Geofence (22.7196, 75.8577)');
        },
        { timeout: 5000 }
      );
    } else {
      setLocationStatus('Indore Head Office Geofence (22.7196, 75.8577)');
    }
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  const isCheckedIn = todayAttendance && todayAttendance.checkIn && todayAttendance.checkIn !== '-';
  const isCheckedOut = todayAttendance && todayAttendance.checkOut && todayAttendance.checkOut !== '-';

  return (
    <div className="digital-clock-banner">
      <div className="clock-left">
        <div className="live-clock-time">{formattedTime}</div>
        <div className="live-clock-date">{formattedDate}</div>
      </div>

      <div className="clock-center">
        <div className="shift-pill">
          <span className="live-pulse-dot" />
          <span>Shift: Morning (09:00 AM - 06:00 PM)</span>
        </div>
        <div className="geo-pill">
          <span>📍 {locationStatus}</span>
        </div>
      </div>

      <div className="clock-right">
        {isCheckedOut ? (
          <span className="badge badge-approved" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            ✓ Today's Shift Completed
          </span>
        ) : isCheckedIn ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-present" style={{ padding: '8px 12px' }}>
              Checked In at {todayAttendance.checkIn}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => onQuickCheckOut(user?.name)}>
              🚪 Check-Out
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onOpenCheckIn} style={{ padding: '10px 20px', fontSize: '0.92rem' }}>
            📸 Mark Attendance
          </button>
        )}
      </div>
    </div>
  );
}
