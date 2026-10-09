import { useState } from 'react';
import { exportToCSV } from '../services/api';

const AVATARS = ['👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '🧑‍🔬', '🧙‍♂️', '🦸‍♂️', '🚀'];

export default function ProfilePage({ user, attendanceHistory = [], onUpdateProfile }) {
  const [userStatus, setUserStatus] = useState('Available');
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍💻');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'Abhishek Sharma',
    email: user?.email || 'abhishek@company.com',
    phone: '+91 98765 43210',
    emergencyContact: '+91 91234 56789',
    department: 'Engineering',
    designation: 'Senior Fullstack Engineer',
    shift: 'Morning (09:00 AM - 06:00 PM)',
    branch: 'Indore Head Office',
  });

  // Filter logs for this employee
  const myLogs = attendanceHistory.filter(
    (log) => log.employee?.toLowerCase() === (user?.name || '').toLowerCase() || log.employeeId === user?.id
  );

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({ ...user, ...form });
    }
    setIsEditing(false);
  };

  const handleExportMyLogs = () => {
    exportToCSV(`Attendance_History_${form.name.replace(/\s+/g, '_')}`, myLogs.length ? myLogs : attendanceHistory);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="section-header">
        <div>
          <h1>My Employee Profile & Portal</h1>
          <p className="subtitle">Manage personal attendance details, work status, and account settings.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportMyLogs}>
            📥 Export My Attendance Log
          </button>
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile Details
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* PROFILE CARD */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <div className="profile-avatar-box">
              <span style={{ fontSize: '2.5rem' }}>{selectedAvatar}</span>
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{form.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{form.email}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-approved">{user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}</span>
                <span className="badge badge-wfh">{form.department}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Current Duty Status</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Available 🟢', 'In Meeting 🟡', 'On Break ☕', 'Working Remote 💻'].map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm ${userStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUserStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
            <div>
              <span className="form-label">Employee Code</span>
              <p style={{ fontWeight: '700', marginTop: '2px' }}><code>EMP-001</code></p>
            </div>
            <div>
              <span className="form-label">Designation</span>
              <p style={{ fontWeight: '700', marginTop: '2px' }}>{form.designation}</p>
            </div>
            <div>
              <span className="form-label">Office Branch</span>
              <p style={{ fontWeight: '700', marginTop: '2px' }}>{form.branch}</p>
            </div>
            <div>
              <span className="form-label">Shift Hours</span>
              <p style={{ fontWeight: '700', marginTop: '2px' }}>{form.shift}</p>
            </div>
            <div>
              <span className="form-label">Phone Contact</span>
              <p style={{ fontWeight: '700', marginTop: '2px' }}>{form.phone}</p>
            </div>
            <div>
              <span className="form-label">Emergency Phone</span>
              <p style={{ fontWeight: '700', marginTop: '2px' }}>{form.emergencyContact}</p>
            </div>
          </div>
        </div>

        {/* PERSONAL STATS SUMMARY */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px' }}>Personal Performance & Leaves</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="stat-card blue" style={{ padding: '14px' }}>
              <div className="stat-header">Monthly Attendance</div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>96.5%</div>
              <div className="stat-footer">Target: 95%</div>
            </div>

            <div className="stat-card green" style={{ padding: '14px' }}>
              <div className="stat-header">Days Present</div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>21 / 22</div>
              <div className="stat-footer">On time: 20 days</div>
            </div>

            <div className="stat-card amber" style={{ padding: '14px' }}>
              <div className="stat-header">Casual Leaves</div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>8 Left</div>
              <div className="stat-footer">Total annual quota: 12</div>
            </div>

            <div className="stat-card purple" style={{ padding: '14px' }}>
              <div className="stat-header">Sick Leaves</div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>10 Left</div>
              <div className="stat-footer">Total annual quota: 12</div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--surface-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', marginBottom: '8px' }}>Security & Biometric Credentials</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-approved">✓ Face ID Registered</span>
              <span className="badge badge-approved">✓ Fingerprint Enrolled</span>
              <span className="badge badge-wfh">✓ Mobile GPS Linked</span>
            </div>
          </div>
        </div>
      </div>

      {/* PERSONAL ATTENDANCE LOG TABLE */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px' }}>My Personal Check-In Records</h3>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
                <th>Verification Method</th>
                <th>Location / Device</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(myLogs.length ? myLogs : attendanceHistory).slice(0, 6).map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '700' }}>{item.date}</td>
                  <td>{item.checkIn}</td>
                  <td>{item.checkOut || '-'}</td>
                  <td>{item.method}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.location || 'Office Desk'}</td>
                  <td>
                    <span className={`badge badge-${item.status?.toLowerCase()}`}>
                      <span className="badge-dot" /> {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Edit Profile Information</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Choose Avatar Icon</label>
                <div style={{ display: 'flex', gap: '10px', fontSize: '1.5rem', flexWrap: 'wrap' }}>
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      style={{
                        background: selectedAvatar === av ? 'var(--primary-soft)' : 'var(--surface-card)',
                        border: selectedAvatar === av ? '2px solid var(--primary)' : '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact</label>
                  <input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
