import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  clearStoredAuth,
  getStoredAuthUser,
  loadDashboardData,
  loginUserRequest,
  registerUserRequest,
  submitLeaveRequest,
  submitWfhRequest,
} from './services/api';

const guestNavItems = [
  { path: '/', label: 'Home' },
  { path: '/login', label: 'Login' },
  { path: '/signup', label: 'Sign Up' },
];

const navConfig = {
  admin: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/employees', label: 'Employees' },
    { path: '/attendance', label: 'Attendance' },
    { path: '/leave', label: 'Leave' },
    { path: '/wfh', label: 'WFH' },
    { path: '/reports', label: 'Reports' },
    { path: '/settings', label: 'Settings' },
    { path: '/profile', label: 'Profile' },
  ],
  manager: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/employees', label: 'Employees' },
    { path: '/attendance', label: 'Attendance' },
    { path: '/leave', label: 'Leave' },
    { path: '/wfh', label: 'WFH' },
    { path: '/reports', label: 'Reports' },
    { path: '/profile', label: 'Profile' },
  ],
  employee: [
    { path: '/dashboard', label: 'My Dashboard' },
    { path: '/attendance', label: 'Attendance' },
    { path: '/leave', label: 'Leave' },
    { path: '/wfh', label: 'WFH' },
    { path: '/profile', label: 'Profile' },
  ],
};

const roleMeta = {
  admin: {
    label: 'Admin',
    title: 'Admin Dashboard',
    summary: 'Manage attendance, teams, approvals, and office operations.',
    permissions: ['dashboard', 'employees', 'attendance', 'leave', 'wfh', 'reports', 'settings', 'profile'],
  },
  manager: {
    label: 'Manager',
    title: 'Manager Workspace',
    summary: 'Review team activity, monitor attendance, and manage departmental requests.',
    permissions: ['dashboard', 'employees', 'attendance', 'leave', 'wfh', 'reports', 'profile'],
  },
  employee: {
    label: 'Employee',
    title: 'Employee Workspace',
    summary: 'Track your daily attendance, leave requests, and WFH updates.',
    permissions: ['dashboard', 'attendance', 'leave', 'wfh', 'profile'],
  },
};

function normalizeRole(role) {
  const normalized = String(role || 'employee').toLowerCase();
  if (normalized === 'hr' || normalized === 'manager') return 'manager';
  if (normalized === 'admin') return 'admin';
  if (normalized === 'user') return 'employee';
  return normalized === 'employee' ? 'employee' : 'employee';
}

function getRoleLabel(role) {
  return roleMeta[normalizeRole(role)]?.label || 'Employee';
}

function getNavItems(role) {
  return navConfig[normalizeRole(role)] || navConfig.employee;
}

function canAccessPermission(role, permission) {
  const permissions = roleMeta[normalizeRole(role)]?.permissions || roleMeta.employee.permissions;
  return permissions.includes(permission);
}

function StatCard({ label, value, tone = 'blue' }) {
  return (
    <div className={`stat-box ${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
}

function AppShell({ user, navItems, onLogout, children, isGuest = false }) {
  return (
    <div className="app-shell">
      <nav className="topbar">
        <Link className="brand" to={user ? '/dashboard' : '/'}>
          Office Attendance
        </Link>

        <div className="nav-links">
          {(navItems || guestNavItems).map((item) => (
            <Link key={item.path} to={item.path}>{item.label}</Link>
          ))}
        </div>

        {isGuest ? (
          <div className="auth-actions">
            <Link to="/login" className="button primary small">Login</Link>
            <Link to="/signup" className="button secondary small">Sign Up</Link>
          </div>
        ) : (
          <div className="account-box">
            <span className="user-name">{user?.name || 'Team Member'}</span>
            <span className="user-role-mini">{getRoleLabel(user?.role)}</span>
            <button type="button" className="button secondary small" onClick={onLogout}>Logout</button>
          </div>
        )}
      </nav>

      <main className="page-shell">{children}</main>

      <footer className="app-footer">
        <div>
          <strong>Office Attendance</strong>
          <p>Attendance, leave, and work-from-home management designed for modern teams.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li>Dashboard</li>
            <li>Attendance</li>
            <li>Support</li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>help@officeattendance.com</li>
            <li>+91 98765 43210</li>
            <li>Mon-Fri • 9AM to 6PM</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

function HomePage() {
  return (
    <div className="page home-page">
      <div className="hero-card">
        <span className="tag">Office Attendance System</span>
        <h1>Smart workforce management for modern offices</h1>
        <p>
          Monitor attendance, simplify leave approvals, manage WFH schedules, and keep your team organized in one clean workspace.
        </p>
        <div className="actions">
          <Link to="/login" className="button primary">Login</Link>
          <Link to="/signup" className="button secondary">Create Account</Link>
        </div>
      </div>

      <div className="feature-grid">
        <div className="mini-card">
          <h4>Role-based access</h4>
          <p>Separate views for Admin, Employee, and User roles to keep work simple and structured.</p>
        </div>
        <div className="mini-card">
          <h4>Real-time visibility</h4>
          <p>Keep track of attendance, late arrivals, leave requests, and WFH approvals instantly.</p>
        </div>
        <div className="mini-card">
          <h4>Mobile-friendly UI</h4>
          <p>Clean and responsive design that works across desktop, tablet, and mobile screens.</p>
        </div>
      </div>
    </div>
  );
}

function AuthPage({ onAuth, initialMode = 'login' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      const result = mode === 'login'
        ? await loginUserRequest({ email: payload.email, password: payload.password })
        : await registerUserRequest(payload);

      onAuth(result);
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page centered">
      <div className="card form-card auth-card">
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <span className="tag">{mode === 'login' ? 'Secure access' : 'Join the platform'}</span>
        </div>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'toggle active' : 'toggle'}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'toggle active' : 'toggle'}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stacked-form">
          {mode === 'signup' && (
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
          )}

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            required
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            minLength="6"
            required
          />

          {mode === 'signup' && (
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          )}

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="button primary full" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="demo-note">
            Use your registered account credentials to continue.
          </p>
        )}
      </div>
    </div>
  );
}

function ProfilePage({ user }) {
  const currentRole = normalizeRole(user?.role);
  const permissions = roleMeta[currentRole]?.permissions || [];

  return (
    <div className="page">
      <div className="card wide-card profile-card">
        <div className="section-header">
          <div>
            <span className="tag">Profile</span>
            <h2>{user?.name || 'Team Member'}</h2>
          </div>
          <div className="user-role">{getRoleLabel(user?.role)}</div>
        </div>

        <div className="settings-grid">
          <div className="mini-card">
            <h4>Assigned Role</h4>
            <p>{getRoleLabel(user?.role)}</p>
          </div>
          <div className="mini-card">
            <h4>Email</h4>
            <p>{user?.email || 'team@officeattendance.com'}</p>
          </div>
          <div className="mini-card">
            <h4>Department</h4>
            <p>{currentRole === 'admin' ? 'Administration' : currentRole === 'manager' ? 'Operations' : 'General Team'}</p>
          </div>
          <div className="mini-card">
            <h4>Permissions</h4>
            <p>{permissions.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesPage() {
  return (
    <div className="page">
      <div className="card wide-card">
        <div className="section-header">
          <div>
            <span className="tag">Services</span>
            <h2>Available Requests</h2>
          </div>
        </div>
        <div className="settings-grid">
          <div className="mini-card">
            <h4>Access Request</h4>
            <p>Request new workspace or software access.</p>
          </div>
          <div className="mini-card">
            <h4>IT Support</h4>
            <p>Report device, network, or hardware issues.</p>
          </div>
          <div className="mini-card">
            <h4>Travel Assistance</h4>
            <p>Track travel approvals and expense support.</p>
          </div>
          <div className="mini-card">
            <h4>HR Services</h4>
            <p>Check policy, onboarding, and payroll updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ data, user }) {
  if (!data) return <div className="page"><div className="card">Loading dashboard...</div></div>;

  const roleName = normalizeRole(user?.role);
  const roleInfo = roleMeta[roleName] || roleMeta.employee;

  const dashboardContent = {
    admin: {
      cards: [
        { label: 'Total Employees', value: data.stats.totalEmployees || 0, tone: 'blue' },
        { label: 'Present', value: data.stats.present || 0, tone: 'green' },
        { label: 'Absent', value: data.stats.absent || 0, tone: 'red' },
        { label: 'Late', value: data.stats.late || 0, tone: 'amber' },
        { label: 'Leave', value: data.stats.leave || 0, tone: 'purple' },
        { label: 'WFH', value: data.stats.wfh || 0, tone: 'cyan' },
      ],
      recentTitle: 'Team Attendance Overview',
      quickActions: [
        'Review pending leave approvals.',
        'Check late employee reports.',
        'Share daily staffing summary.',
      ],
    },
    manager: {
      cards: [
        { label: 'Team Members', value: data.stats.totalEmployees || 0, tone: 'blue' },
        { label: 'Present', value: data.stats.present || 0, tone: 'green' },
        { label: 'Late', value: data.stats.late || 0, tone: 'amber' },
        { label: 'Pending Leave', value: data.stats.leave || 0, tone: 'purple' },
        { label: 'WFH', value: data.stats.wfh || 0, tone: 'cyan' },
        { label: 'Reports', value: 'Ready', tone: 'red' },
      ],
      recentTitle: 'Department Overview',
      quickActions: [
        'Monitor employee attendance trends.',
        'Approve team leave requests.',
        'Review manager-level reports.',
      ],
    },
    employee: {
      cards: [
        { label: 'My Attendance', value: data.stats.present || 0, tone: 'blue' },
        { label: 'Leave Balance', value: '12 Days', tone: 'green' },
        { label: 'WFH Days', value: data.stats.wfh || 0, tone: 'purple' },
        { label: 'Pending Tasks', value: '03', tone: 'amber' },
        { label: 'Shift Status', value: 'On Time', tone: 'cyan' },
        { label: 'Alerts', value: '01', tone: 'red' },
      ],
      recentTitle: 'My Recent Records',
      quickActions: [
        'Update your attendance entry.',
        'Submit leave or WFH request.',
        'Check your assigned tasks.',
      ],
    },
  };

  const content = dashboardContent[roleName] || dashboardContent.employee;
  const recentRows = Array.isArray(data.attendance) && data.attendance.length > 0
    ? data.attendance.slice(0, 4)
    : [{ id: 'empty', employee: 'No attendance records', status: 'Waiting', checkIn: '--:--' }];

  return (
    <div className="page dashboard-page">
      <div className="section-header">
        <div>
          <span className="tag">{roleInfo.label} Portal</span>
          <h2>{roleInfo.title}</h2>
        </div>
        {user && <div className="user-role">{roleInfo.label.toUpperCase()}</div>}
      </div>

      <div className="hero-inline">
        <p>{roleInfo.summary}</p>
      </div>

      <div className="stats-grid">
        {content.cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </div>

      <div className="content-grid two-col">
        <div className="card">
          <h3>{content.recentTitle}</h3>
          <div className="list-table">
            {recentRows.map((row) => (
              <div className="table-row" key={row.id || row.employee}>
                <span>{row.employee}</span>
                <span>{row.status}</span>
                <span>{row.checkIn || row.date || '--'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <ul className="notification-list">
            {content.quickActions.map((action, index) => (
              <li key={`${action}-${index}`} className={index % 2 === 0 ? 'note info' : 'note success'}>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function EmployeesPage({ data, userRole }) {
  const currentRole = normalizeRole(userRole);
  const canManageEmployees = currentRole === 'admin' || currentRole === 'manager';

  return (
    <div className="page">
      <div className="card wide-card">
        <div className="section-header">
          <h2>Employees</h2>
          {canManageEmployees && <button type="button" className="button primary">Add Employee</button>}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Code</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.employees || []).map((employee) => (
                <tr key={employee.id || employee.employeeCode || employee.name}>
                  <td>{employee.name}</td>
                  <td>{getRoleLabel(employee.role || (currentRole === 'admin' ? 'employee' : 'employee'))}</td>
                  <td>{employee.employeeCode || 'N/A'}</td>
                  <td>{employee.department || 'General'}</td>
                  <td>{employee.designation || 'Team Member'}</td>
                  <td><span className="status-pill">{employee.status || 'Active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AttendancePage({ data }) {
  return (
    <div className="page">
      <div className="card wide-card">
        <div className="section-header">
          <h2>Attendance</h2>
          <button type="button" className="button primary">Mark Attendance</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {(data?.attendance || []).map((row) => (
                <tr key={row.id}>
                  <td>{row.employee}</td>
                  <td>{row.date}</td>
                  <td>{row.checkIn}</td>
                  <td>{row.checkOut}</td>
                  <td><span className="status-pill">{row.status}</span></td>
                  <td>{row.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeavePage({ data, onSubmit }) {
  const [form, setForm] = useState({ employee: '', type: '', from: '', to: '', reason: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
    setForm({ employee: '', type: '', from: '', to: '', reason: '' });
  };

  return (
    <div className="page two-column-layout">
      <div className="card">
        <h2>Leave Requests</h2>
        <form onSubmit={handleSubmit} className="stacked-form">
          <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} placeholder="Employee name" />
          <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Leave type" />
          <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
          <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason" rows="4" />
          <button className="button primary" type="submit">Submit Leave</button>
        </form>
      </div>

      <div className="card">
        <h2>Pending Requests</h2>
        <div className="list-stack">
          {(data?.leaveRequests || []).map((item) => (
            <div className="request-card" key={item.id}>
              <div className="request-head">
                <strong>{item.employee}</strong>
                <span className="status-pill">{item.status}</span>
              </div>
              <p>{item.type}</p>
              <small>{item.from} to {item.to}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WfhPage({ data, onSubmit }) {
  const [form, setForm] = useState({ employee: '', date: '', reason: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
    setForm({ employee: '', date: '', reason: '' });
  };

  return (
    <div className="page two-column-layout">
      <div className="card">
        <h2>WFH Request</h2>
        <form onSubmit={handleSubmit} className="stacked-form">
          <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} placeholder="Employee name" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason" rows="4" />
          <button className="button primary" type="submit">Request WFH</button>
        </form>
      </div>

      <div className="card">
        <h2>WFH Overview</h2>
        <div className="list-stack">
          {(data?.wfhRequests || []).map((item) => (
            <div className="request-card" key={item.id}>
              <div className="request-head">
                <strong>{item.employee}</strong>
                <span className="status-pill">{item.status}</span>
              </div>
              <p>{item.reason}</p>
              <small>{item.date}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsPage({ data }) {
  return (
    <div className="page">
      <div className="card wide-card">
        <h2>Reports</h2>
        <div className="stats-grid compact">
          {(data?.reports || []).map((report) => (
            <div className="stat-box simple" key={report.id}>
              <p>{report.title}</p>
              <h3>{report.value}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsPage({ data }) {
  return (
    <div className="page">
      <div className="card wide-card">
        <h2>Notifications</h2>
        <ul className="notification-list large">
          {(data?.notifications || []).map((item) => (
            <li key={item.id} className={`note ${item.type}`}>
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="page">
      <div className="card wide-card">
        <h2>Settings</h2>
        <div className="settings-grid">
          <div className="mini-card">
            <h4>Company Settings</h4>
            <p>Office hours, timezone, branch settings</p>
          </div>
          <div className="mini-card">
            <h4>Biometric Settings</h4>
            <p>Face, fingerprint, GPS, geofence rules</p>
          </div>
          <div className="mini-card">
            <h4>Security</h4>
            <p>JWT, rate limiting, password policy</p>
          </div>
          <div className="mini-card">
            <h4>Notifications</h4>
            <p>Email, SMS, push notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [loggedIn, setLoggedIn] = useState(Boolean(getStoredAuthUser()));
  const [user, setUser] = useState(getStoredAuthUser());

  useEffect(() => {
    async function fetchData() {
      const response = await loadDashboardData();
      setData(response);
    }

    fetchData();
  }, []);

  const handleAuth = (authUser) => {
    setUser(authUser);
    setLoggedIn(true);
  };

  const handleLeaveSubmit = async (payload) => {
    const response = await submitLeaveRequest(payload);
    setData((prev) => ({
      ...prev,
      leaveRequests: [response, ...(prev?.leaveRequests || [])],
    }));
  };

  const handleWfhSubmit = async (payload) => {
    const response = await submitWfhRequest(payload);
    setData((prev) => ({
      ...prev,
      wfhRequests: [response, ...(prev?.wfhRequests || [])],
    }));
  };

  const handleLogout = () => {
    clearStoredAuth();
    setUser(null);
    setLoggedIn(false);
  };

  const renderGuestRoutes = () => (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage onAuth={handleAuth} initialMode="login" />} />
      <Route path="/signup" element={<AuthPage onAuth={handleAuth} initialMode="signup" />} />
      <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      <Route path="/employees" element={<Navigate to="/login" replace />} />
      <Route path="/attendance" element={<Navigate to="/login" replace />} />
      <Route path="/leave" element={<Navigate to="/login" replace />} />
      <Route path="/wfh" element={<Navigate to="/login" replace />} />
      <Route path="/reports" element={<Navigate to="/login" replace />} />
      <Route path="/notifications" element={<Navigate to="/login" replace />} />
      <Route path="/settings" element={<Navigate to="/login" replace />} />
      <Route path="/profile" element={<Navigate to="/login" replace />} />
      <Route path="/services" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const renderProtectedRoutes = () => (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage data={data} user={user} />} />
      <Route
        path="/employees"
        element={
          canAccessPermission(user?.role, 'employees') ? (
            <EmployeesPage data={data} userRole={user?.role} />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/attendance"
        element={canAccessPermission(user?.role, 'attendance') ? <AttendancePage data={data} /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/leave"
        element={canAccessPermission(user?.role, 'leave') ? <LeavePage data={data} onSubmit={handleLeaveSubmit} /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/wfh"
        element={canAccessPermission(user?.role, 'wfh') ? <WfhPage data={data} onSubmit={handleWfhSubmit} /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/reports"
        element={canAccessPermission(user?.role, 'reports') ? <ReportsPage data={data} /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/notifications" element={<NotificationsPage data={data} />} />
      <Route
        path="/settings"
        element={canAccessPermission(user?.role, 'settings') ? <SettingsPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/profile" element={<ProfilePage user={user} />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );

  if (!loggedIn) {
    return (
      <AppShell isGuest navItems={guestNavItems}>
        {renderGuestRoutes()}
      </AppShell>
    );
  }

  return (
    <AppShell user={user} navItems={getNavItems(user?.role)} onLogout={handleLogout}>
      {renderProtectedRoutes()}
    </AppShell>
  );
}
