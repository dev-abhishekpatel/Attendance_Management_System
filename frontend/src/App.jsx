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
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/attendance', label: 'Attendance' },
    { path: '/leave', label: 'Leave' },
    { path: '/wfh', label: 'WFH' },
    { path: '/profile', label: 'Profile' },
  ],
  user: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/attendance', label: 'My Attendance' },
    { path: '/services', label: 'Requests' },
    { path: '/profile', label: 'Profile' },
  ],
};

const roleMeta = {
  admin: {
    label: 'Admin',
    title: 'Executive Dashboard',
    summary: 'Manage attendance, workforce operations, approvals, and office performance from a single command center.',
    permissions: ['dashboard', 'employees', 'attendance', 'leave', 'wfh', 'reports', 'settings', 'profile'],
  },
  manager: {
    label: 'Manager',
    title: 'Team Operations Workspace',
    summary: 'Review team productivity, monitor attendance, and manage department-level requests with full visibility.',
    permissions: ['dashboard', 'employees', 'attendance', 'leave', 'wfh', 'reports', 'profile'],
  },
  employee: {
    label: 'Employee',
    title: 'Employee Workspace',
    summary: 'Track attendance, submit leave or WFH requests, and stay aligned with daily operations.',
    permissions: ['dashboard', 'attendance', 'leave', 'wfh', 'profile'],
  },
  user: {
    label: 'User',
    title: 'User Portal',
    summary: 'Manage personal requests, stay updated on approvals, and keep your profile and access information current.',
    permissions: ['dashboard', 'attendance', 'services', 'profile'],
  },
};

function normalizeRole(role) {
  const normalized = String(role || 'employee').toLowerCase();
  if (normalized === 'hr' || normalized === 'manager') return 'manager';
  if (normalized === 'admin') return 'admin';
  if (normalized === 'user') return 'user';
  if (normalized === 'employee') return 'employee';
  return 'employee';
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

function matchesCurrentUser(record, user) {
  if (!user) return true;

  const role = normalizeRole(user.role);
  if (role === 'admin' || role === 'manager') return true;

  const userNames = [user.name, user.email, user.email?.split('@')[0]]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  const recordName = String(record?.employee || record?.name || '').trim().toLowerCase();
  return userNames.some((name) => name && (recordName === name || recordName.includes(name) || name.includes(recordName)));
}

function getScopedDashboardData(data, user) {
  if (!data || !user) return data;

  const role = normalizeRole(user.role);
  if (role === 'admin' || role === 'manager') return data;

  const userName = String(user.name || '').trim();
  return {
    ...data,
    employees: Array.isArray(data.employees)
      ? data.employees.filter((employee) => matchesCurrentUser(employee, user))
      : [],
    attendance: Array.isArray(data.attendance)
      ? data.attendance.filter((entry) => matchesCurrentUser(entry, user))
      : [],
    leaveRequests: Array.isArray(data.leaveRequests)
      ? data.leaveRequests.filter((entry) => matchesCurrentUser(entry, user))
      : [],
    wfhRequests: Array.isArray(data.wfhRequests)
      ? data.wfhRequests.filter((entry) => matchesCurrentUser(entry, user))
      : [],
    reports: userName ? data.reports?.filter((report) => report?.title?.toLowerCase().includes('attendance') || report?.title?.toLowerCase().includes('leave')) || [] : [],
    notifications: Array.isArray(data.notifications)
      ? data.notifications.filter((item) => {
          const content = String(item?.text || '').toLowerCase();
          return !content || content.includes(userName.toLowerCase()) || item?.type === 'success' || item?.type === 'info';
        })
      : [],
  };
}

function StatCard({ label, value, tone = 'blue', detail }) {
  return (
    <div className={`stat-box ${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
      {detail ? <span>{detail}</span> : null}
    </div>
  );
}

function AppShell({ user, navItems, onLogout, children, isGuest = false }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to={user ? '/dashboard' : '/'}>Office Attendance</Link>

        <nav className="nav-links">
          {(navItems || guestNavItems).map((item) => (
            <Link key={item.path} to={item.path}>{item.label}</Link>
          ))}
        </nav>

        {isGuest ? (
          <div className="auth-actions">
            <Link to="/login" className="button primary small">Login</Link>
            <Link to="/signup" className="button secondary small">Sign Up</Link>
          </div>
        ) : (
          <div className="account-box">
            <div className="account-copy">
              <span className="user-name">{user?.name || 'Team Member'}</span>
              <span className="user-role-mini">{getRoleLabel(user?.role)}</span>
            </div>
            <button type="button" className="button secondary small" onClick={onLogout}>Logout</button>
          </div>
        )}
      </header>

      <main className="page-shell">{children}</main>

      <footer className="app-footer">
        <div>
          <strong>Office Attendance</strong>
          <p>Smart attendance, approval, and workforce management built for modern businesses.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li>Dashboard</li>
            <li>Attendance</li>
            <li>Support Center</li>
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
        <span className="tag">Workforce management platform</span>
        <h1>Professional attendance and operations for real teams</h1>
        <p>
          Track attendance, manage approvals, simplify remote work, and keep your office running smoothly with one modern system.
        </p>
        <div className="actions">
          <Link to="/login" className="button primary">Login</Link>
          <Link to="/signup" className="button secondary">Create Account</Link>
        </div>
      </div>

      <div className="feature-grid">
        <div className="mini-card">
          <h4>Role-based access</h4>
          <p>Separate experiences for Admin, Employee, and User roles with relevant controls and workflows.</p>
        </div>
        <div className="mini-card">
          <h4>Operational visibility</h4>
          <p>Surface key metrics, approvals, and team updates without adding operational noise.</p>
        </div>
        <div className="mini-card">
          <h4>Production-ready UX</h4>
          <p>Modern cards, clean typography, responsive layouts, and realistic workflows for business use.</p>
        </div>
      </div>

      <div className="role-overview">
        <div className="role-panel admin-panel">
          <span className="panel-chip">Admin</span>
          <h3>Executive control</h3>
          <p>Monitor staffing health, attendance compliance, approvals, and team performance across the organization.</p>
        </div>
        <div className="role-panel employee-panel">
          <span className="panel-chip">Employee</span>
          <h3>Daily workflow</h3>
          <p>Capture attendance, manage leave, use WFH requests, and keep personal work status visible.</p>
        </div>
        <div className="role-panel user-panel">
          <span className="panel-chip">User</span>
          <h3>Service access</h3>
          <p>Access requests, approvals, and profile visibility without unnecessary admin-side complexity.</p>
        </div>
      </div>
    </div>
  );
}

function AuthPage({ onAuth, initialMode = 'login' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
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
      const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
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
          <button type="button" className={mode === 'login' ? 'toggle active' : 'toggle'} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'signup' ? 'toggle active' : 'toggle'} onClick={() => setMode('signup')}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="stacked-form">
          {mode === 'signup' && (
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full name" required />
          )}

          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email address" required />
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" minLength="6" required />

          {mode === 'signup' && (
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="user">User</option>
            </select>
          )}

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="button primary full" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && <p className="demo-note">Use your registered account credentials to continue.</p>}
      </div>
    </div>
  );
}

function ProfilePage({ user }) {
  const currentRole = normalizeRole(user?.role);
  const permissions = roleMeta[currentRole]?.permissions || [];

  return (
    <div className="page">
      <div className="card wide-card table-card">
        <div className="section-header">
          <div>
            <span className="tag">Profile</span>
            <h2>{user?.name || 'Team Member'}</h2>
          </div>
          <div className="role-badge">{getRoleLabel(user?.role)}</div>
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
            <p>{currentRole === 'admin' ? 'Administration' : currentRole === 'manager' ? 'Operations' : currentRole === 'user' ? 'Customer Success' : 'General Team'}</p>
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
      <div className="card wide-card table-card">
        <div className="section-header">
          <div>
            <span className="tag">Requests</span>
            <h2>Service and Support Hub</h2>
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
  if (!data) return <div className="page"><div className="card wide-card">Loading dashboard...</div></div>;

  const roleName = normalizeRole(user?.role);
  const roleInfo = roleMeta[roleName] || roleMeta.employee;

  const dashboardContent = {
    admin: {
      cards: [
        { label: 'Total Employees', value: data.stats.totalEmployees || 0, tone: 'blue', detail: 'Across departments' },
        { label: 'Present Today', value: data.stats.present || 0, tone: 'green', detail: 'Checked in' },
        { label: 'Absent', value: data.stats.absent || 0, tone: 'red', detail: 'Accounts to review' },
        { label: 'Late Arrivals', value: data.stats.late || 0, tone: 'amber', detail: 'Needs follow-up' },
        { label: 'Leave Requests', value: data.stats.leave || 0, tone: 'purple', detail: 'Awaiting approval' },
        { label: 'WFH Team', value: data.stats.wfh || 0, tone: 'cyan', detail: 'Remote work active' },
      ],
      recentTitle: 'Operational Overview',
      quickActions: [
        'Review pending approvals before noon.',
        'Audit attendance compliance by team.',
        'Publish the daily staffing summary.',
      ],
    },
    manager: {
      cards: [
        { label: 'Team Members', value: data.stats.totalEmployees || 0, tone: 'blue', detail: 'Managed under this team' },
        { label: 'Present', value: data.stats.present || 0, tone: 'green', detail: 'Checked in today' },
        { label: 'Late', value: data.stats.late || 0, tone: 'amber', detail: 'Review required' },
        { label: 'Pending Leave', value: data.stats.leave || 0, tone: 'purple', detail: 'Approval queue' },
        { label: 'WFH', value: data.stats.wfh || 0, tone: 'cyan', detail: 'Remote work load' },
        { label: 'Reports', value: 'Ready', tone: 'red', detail: 'Updated summary' },
      ],
      recentTitle: 'Department Snapshot',
      quickActions: [
        'Monitor shift coverage and productivity.',
        'Review leave requests with cross-team impact.',
        'Validate manager-level summaries before sign-off.',
      ],
    },
    employee: {
      cards: [
        { label: 'My Attendance', value: data.stats.present || 0, tone: 'blue', detail: 'Recorded days' },
        { label: 'Leave Balance', value: '12 Days', tone: 'green', detail: 'Available this cycle' },
        { label: 'WFH Days', value: data.stats.wfh || 0, tone: 'purple', detail: 'Approved' },
        { label: 'Tasks Due', value: '03', tone: 'amber', detail: 'In my queue' },
        { label: 'Shift Status', value: 'On Time', tone: 'cyan', detail: 'Current performance' },
        { label: 'Alerts', value: '01', tone: 'red', detail: 'Needs attention' },
      ],
      recentTitle: 'My Recent Activity',
      quickActions: [
        'Update your attendance entry before close of day.',
        'Submit or review your leave and WFH requests.',
        'Check your pending tasks and approvals.',
      ],
    },
    user: {
      cards: [
        { label: 'Open Requests', value: '04', tone: 'blue', detail: 'Currently active' },
        { label: 'Approved', value: '09', tone: 'green', detail: 'This month' },
        { label: 'Pending Approval', value: '02', tone: 'amber', detail: 'Awaiting review' },
        { label: 'Profile Completion', value: '92%', tone: 'purple', detail: 'Updated profile' },
        { label: 'Support Tickets', value: '01', tone: 'cyan', detail: 'Awaiting response' },
        { label: 'Notifications', value: '03', tone: 'red', detail: 'Unread updates' },
      ],
      recentTitle: 'Recent Requests',
      quickActions: [
        'Track your pending workplace requests.',
        'Refresh profile and access details if needed.',
        'Review recent approvals and support updates.',
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
        <div className="role-badge">{roleInfo.label.toUpperCase()}</div>
      </div>

      <div className="hero-inline">
        <p>{roleInfo.summary}</p>
      </div>

      <div className="stats-grid">
        {content.cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} tone={card.tone} detail={card.detail} />
        ))}
      </div>

      <div className="content-grid two-col">
        <div className="card panel-card">
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

        <div className="card panel-card">
          <h3>Priority Actions</h3>
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
      <div className="card wide-card table-card">
        <div className="section-header">
          <div>
            <span className="tag">Team Directory</span>
            <h2>Employees</h2>
          </div>
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
                  <td>{getRoleLabel(employee.role || 'employee')}</td>
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
      <div className="card wide-card table-card">
        <div className="section-header">
          <div>
            <span className="tag">Daily Tracking</span>
            <h2>Attendance</h2>
          </div>
          <button type="button" className="button primary">Mark Attendance</button>
        </div>

        <div className="stats-grid compact">
          <StatCard label="Present" value={data?.stats?.present || 0} tone="green" />
          <StatCard label="Late" value={data?.stats?.late || 0} tone="amber" />
          <StatCard label="Absent" value={data?.stats?.absent || 0} tone="red" />
          <StatCard label="WFH" value={data?.stats?.wfh || 0} tone="cyan" />
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
      <div className="card panel-card">
        <h2>Leave Request</h2>
        <form onSubmit={handleSubmit} className="stacked-form">
          <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} placeholder="Employee name" />
          <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Leave type" />
          <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
          <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} />
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave" rows="4" />
          <button className="button primary" type="submit">Submit Leave</button>
        </form>
      </div>

      <div className="card panel-card">
        <h2>Approval Queue</h2>
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
      <div className="card panel-card">
        <h2>WFH Request</h2>
        <form onSubmit={handleSubmit} className="stacked-form">
          <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} placeholder="Employee name" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason for remote work" rows="4" />
          <button className="button primary" type="submit">Request WFH</button>
        </form>
      </div>

      <div className="card panel-card">
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
      <div className="card wide-card table-card">
        <div className="section-header">
          <div>
            <span className="tag">Insights</span>
            <h2>Reports & Analytics</h2>
          </div>
        </div>
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
      <div className="card wide-card table-card">
        <div className="section-header">
          <div>
            <span className="tag">Updates</span>
            <h2>Notifications</h2>
          </div>
        </div>
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
      <div className="card wide-card table-card">
        <div className="section-header">
          <div>
            <span className="tag">Configuration</span>
            <h2>System Settings</h2>
          </div>
        </div>
        <div className="settings-grid">
          <div className="mini-card">
            <h4>Office Settings</h4>
            <p>Office hours, timezone, branch settings</p>
          </div>
          <div className="mini-card">
            <h4>Access Control</h4>
            <p>Biometric, geofence, and security policy</p>
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
    const requestPayload = {
      ...payload,
      employee: payload.employee || user?.name || 'Employee',
    };

    const response = await submitLeaveRequest(requestPayload);
    setData((prev) => ({ ...prev, leaveRequests: [response, ...(prev?.leaveRequests || [])] }));
  };

  const handleWfhSubmit = async (payload) => {
    const requestPayload = {
      ...payload,
      employee: payload.employee || user?.name || 'Employee',
    };

    const response = await submitWfhRequest(requestPayload);
    setData((prev) => ({ ...prev, wfhRequests: [response, ...(prev?.wfhRequests || [])] }));
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

  const scopedData = getScopedDashboardData(data, user);

  const renderProtectedRoutes = () => (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage data={scopedData} user={user} />} />
      <Route path="/employees" element={canAccessPermission(user?.role, 'employees') ? <EmployeesPage data={scopedData} userRole={user?.role} /> : <Navigate to="/dashboard" replace />} />
      <Route path="/attendance" element={canAccessPermission(user?.role, 'attendance') ? <AttendancePage data={scopedData} /> : <Navigate to="/dashboard" replace />} />
      <Route path="/leave" element={canAccessPermission(user?.role, 'leave') ? <LeavePage data={scopedData} onSubmit={handleLeaveSubmit} /> : <Navigate to="/dashboard" replace />} />
      <Route path="/wfh" element={canAccessPermission(user?.role, 'wfh') ? <WfhPage data={scopedData} onSubmit={handleWfhSubmit} /> : <Navigate to="/dashboard" replace />} />
      <Route path="/reports" element={canAccessPermission(user?.role, 'reports') ? <ReportsPage data={scopedData} /> : <Navigate to="/dashboard" replace />} />
      <Route path="/notifications" element={<NotificationsPage data={scopedData} />} />
      <Route path="/settings" element={canAccessPermission(user?.role, 'settings') ? <SettingsPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/profile" element={<ProfilePage user={user} />} />
      <Route path="/services" element={canAccessPermission(user?.role, 'services') ? <ServicesPage /> : <Navigate to="/dashboard" replace />} />
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
