import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { loadDashboardData, submitLeaveRequest, submitWfhRequest } from './services/api';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/employees', label: 'Employees' },
  { path: '/attendance', label: 'Attendance' },
  { path: '/leave', label: 'Leave' },
  { path: '/wfh', label: 'WFH' },
  { path: '/reports', label: 'Reports' },
  { path: '/notifications', label: 'Notifications' },
  { path: '/settings', label: 'Settings' },
];

function StatCard({ label, value, tone = 'blue' }) {
  return (
    <div className={`stat-box ${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  );
}

function HomePage() {
  return (
    <div className="page home-page">
      <div className="hero-card">
        <span className="tag">Office Attendance System</span>
        <h1>Smart attendance management for modern offices</h1>
        <p>
          Track attendance, manage shifts, approve leave, monitor WFH requests,
          and review team productivity from one place.
        </p>
        <div className="actions">
          <Link to="/login" className="button primary">Login</Link>
          <Link to="/dashboard" className="button secondary">Open Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem('attendanceUser', JSON.stringify({ email, role: 'admin' }));
    navigate('/dashboard');
  };

  return (
    <div className="page centered">
      <div className="card form-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit" className="button primary full">Sign In</button>
        </form>
      </div>
    </div>
  );
}

function DashboardPage({ data }) {
  if (!data) return <div className="page"><div className="card">Loading dashboard...</div></div>;

  return (
    <div className="page dashboard-page">
      <div className="section-header">
        <div>
          <span className="tag">Dashboard</span>
          <h2>Overview</h2>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Employees" value={data.stats.totalEmployees} tone="blue" />
        <StatCard label="Present" value={data.stats.present} tone="green" />
        <StatCard label="Absent" value={data.stats.absent} tone="red" />
        <StatCard label="Late" value={data.stats.late} tone="amber" />
        <StatCard label="Leave" value={data.stats.leave} tone="purple" />
        <StatCard label="WFH" value={data.stats.wfh} tone="cyan" />
      </div>

      <div className="content-grid two-col">
        <div className="card">
          <h3>Recent Attendance</h3>
          <div className="list-table">
            {data.attendance.slice(0, 4).map((row) => (
              <div className="table-row" key={row.id}>
                <span>{row.employee}</span>
                <span>{row.status}</span>
                <span>{row.checkIn}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Notifications</h3>
          <ul className="notification-list">
            {data.notifications.map((item) => (
              <li key={item.id} className={`note ${item.type}`}>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function EmployeesPage({ data }) {
  return (
    <div className="page">
      <div className="card wide-card">
        <div className="section-header">
          <h2>Employees</h2>
          <button className="button primary">Add Employee</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Code</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.employees || []).map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.employeeCode}</td>
                  <td>{employee.department}</td>
                  <td>{employee.designation}</td>
                  <td><span className="status-pill">{employee.status}</span></td>
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
          <button className="button primary">Mark Attendance</button>
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
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('attendanceUser')));

  useEffect(() => {
    async function fetchData() {
      const response = await loadDashboardData();
      setData(response);
    }

    fetchData();
  }, []);

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
    localStorage.removeItem('attendanceUser');
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return (
      <div className="app-shell">
        <nav className="topbar">
          <div className="brand">Office Attendance</div>
          <div className="nav-links">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>{item.label}</Link>
            ))}
          </div>
          <Link to="/login" className="button primary small">Login</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Navigate to="/login" replace />} />
          <Route path="/employees" element={<Navigate to="/login" replace />} />
          <Route path="/attendance" element={<Navigate to="/login" replace />} />
          <Route path="/leave" element={<Navigate to="/login" replace />} />
          <Route path="/wfh" element={<Navigate to="/login" replace />} />
          <Route path="/reports" element={<Navigate to="/login" replace />} />
          <Route path="/notifications" element={<Navigate to="/login" replace />} />
          <Route path="/settings" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="brand">Office Attendance</div>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>{item.label}</Link>
          ))}
        </div>
        <button className="button secondary small" onClick={handleLogout}>Logout</button>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage data={data} />} />
        <Route path="/employees" element={<EmployeesPage data={data} />} />
        <Route path="/attendance" element={<AttendancePage data={data} />} />
        <Route path="/leave" element={<LeavePage data={data} onSubmit={handleLeaveSubmit} />} />
        <Route path="/wfh" element={<WfhPage data={data} onSubmit={handleWfhSubmit} />} />
        <Route path="/reports" element={<ReportsPage data={data} />} />
        <Route path="/notifications" element={<NotificationsPage data={data} />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}
