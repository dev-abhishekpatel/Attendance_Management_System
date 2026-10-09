import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotificationDropdown({ notifications = [], onMarkAllRead, onClearAll }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="btn btn-secondary btn-sm notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications & Updates"
      >
        🔔
        {unreadCount > 0 && <span className="notification-badge-count">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-popup-card">
          <div className="popup-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>Notifications</strong>
              {unreadCount > 0 && <span className="badge badge-late">{unreadCount} new</span>}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn-text-action" onClick={onMarkAllRead}>Mark read</button>
              <button className="btn-text-action" onClick={onClearAll}>Clear</button>
            </div>
          </div>

          <div className="popup-body">
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No notifications right now 🎉
              </div>
            ) : (
              notifications.slice(0, 6).map((item) => (
                <div key={item.id} className={`popup-item ${!item.read ? 'unread' : ''}`}>
                  <span className="popup-icon">
                    {item.type === 'success' ? '✅' : item.type === 'warning' ? '⚠️' : item.type === 'info' ? 'ℹ️' : '📢'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p className="popup-text">{item.text}</p>
                    <span className="popup-time">{item.time || 'Recently'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="popup-footer">
            <Link to="/notifications" onClick={() => setIsOpen(false)} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
              View All Activity →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
