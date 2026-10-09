export default function LogoutModal({ isOpen, onClose, onConfirmLogout, user }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🚪</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '6px' }}>End Workspace Session?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Are you sure you want to log out of <strong>{user?.name || 'your account'}</strong>?
        </p>

        <div style={{ background: 'var(--surface-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px', textAlign: 'left', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span className="form-label">Active Account</span>
            <strong style={{ color: 'var(--text-main)' }}>{user?.email || 'user@company.com'}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="form-label">Permission Role</span>
            <span className="badge badge-approved" style={{ fontSize: '0.7rem' }}>{user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirmLogout} style={{ flex: 1 }}>
            Confirm Logout
          </button>
        </div>
      </div>
    </div>
  );
}
