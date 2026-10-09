import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUserRequest, registerUserRequest } from '../services/api';

const DEMO_USERS = [
  { role: 'admin', label: '👑 Admin', email: 'admin@company.com', pass: 'admin123', desc: 'Full System Control' },
  { role: 'manager', label: '👔 Manager / HR', email: 'manager@company.com', pass: 'hr123', desc: 'Approvals & Workforce' },
  { role: 'employee', label: '💻 Employee', email: 'employee@company.com', pass: 'emp123', desc: 'Check-In & Self Service' },
  { role: 'user', label: '👤 Guest User', email: 'user@company.com', pass: 'user123', desc: 'Read-Only Workspace' },
];

export default function AuthPage({ onAuth, initialMode = 'login' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Engineering',
    role: 'employee',
    rememberMe: true,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute password strength score (0 to 100)
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', tone: 'var(--text-muted)' };
    let score = 0;
    if (pass.length >= 6) score += 30;
    if (pass.length >= 10) score += 20;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;

    if (score < 50) return { score, label: 'Weak', tone: 'var(--danger)' };
    if (score < 75) return { score, label: 'Good', tone: 'var(--warning)' };
    return { score: 100, label: 'Strong', tone: 'var(--success)' };
  };

  const strength = getPasswordStrength(form.password);

  const handleSelectDemo = (demo) => {
    setForm((prev) => ({
      ...prev,
      email: demo.email,
      password: demo.pass,
      role: demo.role,
    }));
    setMode('login');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match! Please check again.');
      return;
    }

    setLoading(true);
    try {
      const res =
        mode === 'login'
          ? await loginUserRequest({ email: form.email, password: form.password })
          : await registerUserRequest(form);

      onAuth(res);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(`Password reset instructions sent to ${forgotEmail}.`);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess('');
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '30px auto' }}>
      <div className="glass-card" style={{ padding: '32px' }}>
        {/* BRAND LOGO HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-icon" style={{ width: '56px', height: '56px', fontSize: '1.4rem', margin: '0 auto 12px' }}>
            OA
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.03em' }}>
            {mode === 'login' ? 'Sign In to Workspace' : 'Create Workforce Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            {mode === 'login'
              ? 'Enter credentials or select a quick demo role'
              : 'Join the office attendance platform & track shifts'}
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: 'var(--input-bg)', padding: '4px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border)' }}>
          <button
            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => { setMode('login'); setError(''); }}
          >
            🔑 Login
          </button>
          <button
            className={`btn ${mode === 'signup' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            ✨ Sign Up
          </button>
        </div>

        {/* ONE-CLICK DEMO ROLES SELECTOR */}
        {mode === 'login' && (
          <div style={{ marginBottom: '20px', background: 'var(--surface-card)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span className="form-label" style={{ marginBottom: '8px', display: 'block' }}>⚡ Quick Demo Logins</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleSelectDemo(demo)}
                  style={{
                    background: form.email === demo.email ? 'var(--primary-soft)' : 'var(--input-bg)',
                    border: form.email === demo.email ? '1px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-main)' }}>{demo.label}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{demo.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Abhishek Sharma"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="btn-text-action"
                  onClick={() => setShowForgotModal(true)}
                  style={{ fontSize: '0.78rem' }}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* PASSWORD STRENGTH BAR IN SIGNUP MODE */}
            {mode === 'signup' && form.password && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: strength.tone, fontWeight: '700' }}>
                  <span>Strength: {strength.label}</span>
                </div>
                <div style={{ height: '4px', width: '100%', background: 'var(--border)', borderRadius: '999px', marginTop: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${strength.score}%`, background: strength.tone, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}
          </div>

          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Support">Support</option>
                    <option value="Design">Design</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign System Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager / HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {error && (
            <div style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger-border)', color: '#f87171', padding: '10px 14px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '600' }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }} disabled={loading}>
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Workspace' : 'Create & Register Account'}
          </button>
        </form>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Reset Password</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForgotModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Enter your registered email address and we will send a password reset code.
            </p>

            <form onSubmit={handleSendResetLink} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="user@company.com"
                  required
                />
              </div>

              {forgotSuccess && (
                <div className="badge badge-approved" style={{ width: '100%', padding: '10px', justifyContent: 'center' }}>
                  {forgotSuccess}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Reset Code</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
