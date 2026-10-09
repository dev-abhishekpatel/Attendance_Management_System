import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AddEmployeeModal from './components/AddEmployeeModal';
import AnalyticsWidget from './components/AnalyticsWidget';
import AuthPage from './components/AuthPage';
import CheckInModal from './components/CheckInModal';
import DigitalClockWidget from './components/DigitalClockWidget';
import LogoutModal from './components/LogoutModal';
import NotificationDropdown from './components/NotificationDropdown';
import PaginationControls from './components/PaginationControls';
import ProfilePage from './components/ProfilePage';
import {
  clearNotifications,
  clearStoredAuth,
  deleteEmployee,
  exportToCSV,
  getStoredAuthUser,
  loadDashboardData,
  markAllNotificationsRead,
  resetSystemState,
  submitAddEmployee,
  submitCheckIn,
  submitCheckOut,
  submitLeaveRequest,
  submitWfhRequest,
  updateEmployeeStatus,
  updateLeaveStatus,
  updateSettings,
  updateWfhStatus,
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
    { path: '/notifications', label: 'Updates' },
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
    { path: '/notifications', label: 'Updates' },
    { path: '/profile', label: 'Profile' },
  ],
  employee: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/attendance', label: 'Attendance' },
    { path: '/leave', label: 'Leave' },
    { path: '/wfh', label: 'WFH' },
    { path: '/notifications', label: 'Updates' },
    { path: '/profile', label: 'Profile' },
  ],
  user: [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/attendance', label: 'My Attendance' },
    { path: '/notifications', label: 'Updates' },
    { path: '/profile', label: 'Profile' },
  ],
};

const roleMeta = {
  admin: { label: 'Admin', title: 'Executive Command Center' },
  manager: { label: 'Manager / HR', title: 'Workforce Operations Hub' },
  employee: { label: 'Employee', title: 'Employee Portal' },
  user: { label: 'User', title: 'User Workspace' },
};

function normalizeRole(role) {
  const norm = String(role || 'employee').toLowerCase();
  if (norm === 'hr' || norm === 'manager') return 'manager';
  if (norm === 'admin') return 'admin';
  if (norm === 'user') return 'user';
  return 'employee';
}

function getRoleLabel(role) {
  return roleMeta[normalizeRole(role)]?.label || 'Employee';
}

function getNavItems(role) {
  return navConfig[normalizeRole(role)] || navConfig.employee;
}

function StatCard({ label, value, tone = 'blue', detail, icon }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-header">
        <span>{label}</span>
        {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {detail && <div className="stat-footer">{detail}</div>}
    </div>
  );
}

function ToastAlert({ message, type = 'success', onClose }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1100,
        background: type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: '700',
        animation: 'modalIn 0.3s ease',
      }}
    >
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: '800' }}>✕</button>
    </div>
  );
}

function AppShell({
  user,
  navItems,
  onOpenLogout,
  theme,
  onToggleTheme,
  children,
  isGuest = false,
  notifications = [],
  onMarkAllRead,
  onClearNotifications,
}) {
  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <Link className="brand-wrapper" to={user ? '/dashboard' : '/'}>
          <div className="brand-icon">OA</div>
          <span className="brand-title">Office Attendance</span>
        </Link>

        <nav className="nav-links">
          {(navItems || guestNavItems).map((item) => (
            <Link key={item.path} to={item.path}>{item.label}</Link>
          ))}
        </nav>

        <div className="topbar-right">
          {!isGuest && (
            <NotificationDropdown
              notifications={notifications}
              onMarkAllRead={onMarkAllRead}
              onClearAll={onClearNotifications}
            />
          )}

          <button className="btn btn-secondary btn-sm" onClick={onToggleTheme} title="Toggle Theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {isGuest ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-secondary btn-sm">Sign Up</Link>
            </div>
          ) : (
            <div className="account-badge">
              <div className="avatar-circle">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{user?.name || 'Team Member'}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{getRoleLabel(user?.role)}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={onOpenLogout} style={{ marginLeft: '6px' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="page-shell">{children}</main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-col">
            <h4>Office Attendance System</h4>
            <p>Next-generation biometric, GPS, face recognition, and remote workforce management platform.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', lineHeight: '2' }}>
              <li><Link to="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link></li>
              <li><Link to="/attendance" style={{ color: 'inherit', textDecoration: 'none' }}>Attendance Logs</Link></li>
              <li><Link to="/leave" style={{ color: 'inherit', textDecoration: 'none' }}>Leave & WFH Center</Link></li>
              <li><Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>My Profile</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support & Operations</h4>
            <p>📧 help@officeattendance.com</p>
            <p>📞 +91 98765 43210</p>
            <p>📍 Office Geofence Active (22.7196, 75.8577)</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomePage() {
  return (
    <div style={{ maxWidth: '960px', margin: '30px auto 0' }}>
      <div className="glass-card" style={{ padding: '44px', textAlign: 'center' }}>
        <span className="badge badge-present" style={{ padding: '6px 16px', fontSize: '0.8rem', marginBottom: '16px' }}>
          ✨ Intelligent Biometric & GPS Platform
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', margin: '16px 0', letterSpacing: '-0.04em' }}>
          Smart Office Attendance & Workforce Operations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '660px', margin: '0 auto 28px' }}>
          Track daily check-ins with Face Recognition, GPS Geofencing, and Fingerprint validation. Streamline leave approvals and monitor real-time workforce productivity.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>Get Started / Login</Link>
          <Link to="/signup" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '1rem' }}>Register Account</Link>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({ data, user, onOpenCheckIn, onOpenAddEmp, onQuickCheckOut }) {
  if (!data) return <div className="glass-card">Loading dashboard data...</div>;

  const stats = data.stats || {};
  const currentRole = normalizeRole(user?.role);
  const canManage = currentRole === 'admin' || currentRole === 'manager';

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = (data.attendance || []).find(
    (a) => (a.employee?.toLowerCase() === user?.name?.toLowerCase() || a.employeeId === user?.id) && a.date === todayStr
  );

  return (
    <div>
      <DigitalClockWidget
        onOpenCheckIn={onOpenCheckIn}
        user={user}
        onQuickCheckOut={onQuickCheckOut}
        todayAttendance={todayAttendance}
      />

      <div className="section-header">
        <div>
          <span className="badge badge-approved" style={{ marginBottom: '8px' }}>
            {getRoleLabel(user?.role)} Workspace
          </span>
          <h1>{roleMeta[currentRole]?.title || 'Dashboard'}</h1>
          <p className="subtitle">Real-time attendance tracking, approvals, and staffing statistics.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={onOpenCheckIn}>
            📸 Mark Attendance
          </button>
          {canManage && (
            <button className="btn btn-secondary" onClick={onOpenAddEmp}>
              ➕ Add Employee
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Employees" value={stats.totalEmployees || 0} tone="blue" icon="👥" detail="Enrolled workforce" />
        <StatCard label="Present Today" value={stats.present || 0} tone="green" icon="✅" detail="On-time check-ins" />
        <StatCard label="Late Arrivals" value={stats.late || 0} tone="amber" icon="⏰" detail="Requires review" />
        <StatCard label="Remote / WFH" value={stats.wfh || 0} tone="cyan" icon="💻" detail="Approved remote work" />
        <StatCard label="On Leave" value={stats.leave || 0} tone="purple" icon="🏖️" detail="Active leave approved" />
        <StatCard label="Absent" value={stats.absent || 0} tone="red" icon="❌" detail="Unverified absences" />
      </div>

      <AnalyticsWidget stats={stats} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginTop: '26px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Recent Attendance Activity</h3>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Check-In</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {(data.attendance || []).slice(0, 5).map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: '700' }}>{row.employee}</td>
                    <td>
                      <span className={`badge badge-${row.status?.toLowerCase()}`}>
                        <span className="badge-dot" /> {row.status}
                      </span>
                    </td>
                    <td>{row.checkIn}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>System Activity Feed</h3>
          <div className="notification-feed">
            {(data.notifications || []).slice(0, 4).map((item) => (
              <div key={item.id} className="notification-item">
                <div style={{ fontSize: '1.2rem' }}>
                  {item.type === 'success' ? '✅' : item.type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div>
                  <p style={{ fontSize: '0.88rem', fontWeight: '600' }}>{item.text}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time || 'Today'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeesPage({ data, onOpenAddEmp, onStatusChange, onDelete }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const filtered = (data?.employees || []).filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortCol] || '';
    let valB = b[sortCol] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    exportToCSV('Employees_Directory', filtered);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Employee Directory</h1>
          <p className="subtitle">Manage company staff, assignments, shifts, and access roles.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExport}>📥 Export CSV</button>
          <button className="btn btn-primary" onClick={onOpenAddEmp}>➕ Add Employee</button>
        </div>
      </div>

      <div className="glass-card">
        <div className="controls-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search by name, code, or email..." />
          </div>

          <div className="filter-group">
            <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}>
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="Support">Support</option>
              <option value="Design">Design</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="sortable-th" onClick={() => handleSort('employeeCode')}>
                  Code {sortCol === 'employeeCode' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('name')}>
                  Employee Name {sortCol === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('department')}>
                  Department {sortCol === 'department' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Designation</th>
                <th>Branch</th>
                <th>Shift</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((emp) => (
                <tr key={emp.id}>
                  <td><code>{emp.employeeCode}</code></td>
                  <td>
                    <div>
                      <strong style={{ display: 'block' }}>{emp.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.email}</span>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.branch || 'Head Office'}</td>
                  <td>{emp.shift || 'Morning'}</td>
                  <td>
                    <span className={`badge badge-${emp.status === 'Active' ? 'active' : 'inactive'}`}>
                      <span className="badge-dot" /> {emp.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onStatusChange(emp.id, emp.status === 'Active' ? 'Inactive' : 'Active')}
                      >
                        {emp.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(emp.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalItems={sorted.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onItemsPerPageChange={(num) => { setItemsPerPage(num); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}

function AttendancePage({ data, onOpenCheckIn, onCheckOut }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const filtered = (data?.attendance || []).filter((row) => {
    const matchesSearch = row.employee.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter;
    const matchesMethod = methodFilter === 'ALL' || row.method?.toLowerCase().includes(methodFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortCol] || '';
    let valB = b[sortCol] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    exportToCSV('Attendance_Logs', filtered);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Attendance Tracking</h1>
          <p className="subtitle">Daily check-in / check-out records, biometric verification logs, and location data.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExport}>📥 Export CSV</button>
          <button className="btn btn-primary" onClick={onOpenCheckIn}>📸 Mark Attendance</button>
        </div>
      </div>

      <div className="glass-card">
        <div className="controls-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Filter attendance by employee name..." />
          </div>

          <div className="filter-group">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="ALL">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="WFH">WFH</option>
              <option value="Absent">Absent</option>
            </select>

            <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}>
              <option value="ALL">All Verification Methods</option>
              <option value="Face">Face Recognition</option>
              <option value="GPS">GPS Location</option>
              <option value="Fingerprint">Fingerprint</option>
              <option value="Mobile">Mobile Biometric</option>
              <option value="QR">QR Code</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="sortable-th" onClick={() => handleSort('employee')}>
                  Employee {sortCol === 'employee' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="sortable-th" onClick={() => handleSort('date')}>
                  Date {sortCol === 'date' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Method</th>
                <th>Location / Geofence</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: '700' }}>{row.employee}</td>
                  <td>{row.date}</td>
                  <td>{row.checkIn}</td>
                  <td>{row.checkOut || '-'}</td>
                  <td>
                    <span className={`badge badge-${row.status?.toLowerCase()}`}>
                      <span className="badge-dot" /> {row.status}
                    </span>
                  </td>
                  <td>{row.method}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.location || 'Office Geofence'}</td>
                  <td>
                    {row.checkOut === '-' || !row.checkOut ? (
                      <button className="btn btn-success btn-sm" onClick={() => onCheckOut(row.employee)}>
                        Check-Out
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '700' }}>Complete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalItems={sorted.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onItemsPerPageChange={(num) => { setItemsPerPage(num); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}

function LeavePage({ data, onSubmitLeave, onUpdateLeaveStatus, user }) {
  const [form, setForm] = useState({ employee: user?.name || '', type: 'Casual Leave', from: '', to: '', reason: '' });
  const currentRole = normalizeRole(user?.role);
  const canApprove = currentRole === 'admin' || currentRole === 'manager';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitLeave(form);
    setForm({ employee: user?.name || '', type: 'Casual Leave', from: '', to: '', reason: '' });
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Leave Management</h1>
          <p className="subtitle">Submit leave applications and review approval requests.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Apply for Leave</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Employee Name</label>
              <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} placeholder="Full Name" required />
            </div>

            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="Casual Leave">Casual Leave (12 left)</option>
                <option value="Sick Leave">Sick Leave (10 left)</option>
                <option value="Earned Leave">Earned Leave (15 left)</option>
                <option value="Maternity / Paternity">Maternity / Paternity</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">To Date</label>
                <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="State reason for leave..." rows="3" required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>Submit Leave Request</button>
          </form>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Approval Queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(data?.leaveRequests || []).map((item) => (
              <div key={item.id} style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{item.employee}</strong>
                  <span className={`badge badge-${item.status?.toLowerCase()}`}>
                    <span className="badge-dot" /> {item.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.type} • {item.from} to {item.to}</p>
                <p style={{ fontSize: '0.82rem', marginTop: '6px' }}>"{item.reason}"</p>

                {canApprove && item.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="btn btn-success btn-sm" onClick={() => onUpdateLeaveStatus(item.id, 'Approved')}>✓ Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onUpdateLeaveStatus(item.id, 'Rejected')}>✕ Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WfhPage({ data, onSubmitWfh, onUpdateWfhStatus, user }) {
  const [form, setForm] = useState({ employee: user?.name || '', date: '', reason: '' });
  const currentRole = normalizeRole(user?.role);
  const canApprove = currentRole === 'admin' || currentRole === 'manager';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitWfh(form);
    setForm({ employee: user?.name || '', date: '', reason: '' });
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Work From Home (WFH)</h1>
          <p className="subtitle">Remote attendance authorization and schedule requests.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Request WFH</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Employee Name</label>
              <input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} placeholder="Full Name" required />
            </div>

            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Reason for WFH</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Describe remote work objectives..." rows="3" required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>Submit WFH Request</button>
          </form>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>WFH Requests Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(data?.wfhRequests || []).map((item) => (
              <div key={item.id} style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{item.employee}</strong>
                  <span className={`badge badge-${item.status?.toLowerCase()}`}>
                    <span className="badge-dot" /> {item.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date: {item.date}</p>
                <p style={{ fontSize: '0.82rem', marginTop: '6px' }}>"{item.reason}"</p>

                {canApprove && item.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="btn btn-success btn-sm" onClick={() => onUpdateWfhStatus(item.id, 'Approved')}>✓ Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => onUpdateWfhStatus(item.id, 'Rejected')}>✕ Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsPage({ data }) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Analytics & Reports</h1>
          <p className="subtitle">High-level workforce compliance, overtime insights, and export options.</p>
        </div>
        <button className="btn btn-primary" onClick={() => exportToCSV('Attendance_Reports', data.reports || [])}>
          📥 Export Reports CSV
        </button>
      </div>

      <div className="stats-grid">
        {(data?.reports || []).map((r) => (
          <StatCard key={r.id} label={r.title} value={r.value} tone="purple" detail={`Trend: ${r.trend || 'Stable'}`} />
        ))}
      </div>

      <AnalyticsWidget stats={data?.stats} />
    </div>
  );
}

function NotificationsPage({ data, onMarkAllRead, onClearNotifications }) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Notifications & Activity Feed</h1>
          <p className="subtitle">Real-time attendance events, check-ins, and approval updates.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={onMarkAllRead}>✓ Mark All Read</button>
          <button className="btn btn-danger btn-sm" onClick={onClearNotifications}>🗑️ Clear Feed</button>
        </div>
      </div>

      <div className="glass-card">
        <div className="notification-feed">
          {(data?.notifications || []).length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No notifications logged.
            </div>
          ) : (
            (data?.notifications || []).map((item) => (
              <div key={item.id} className="notification-item">
                <div style={{ fontSize: '1.4rem' }}>
                  {item.type === 'success' ? '✅' : item.type === 'warning' ? '⚠️' : item.type === 'info' ? 'ℹ️' : '📢'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.92rem', fontWeight: '700' }}>{item.text}</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.time || 'Recently'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ settings, onSaveSettings, onResetSystem }) {
  const [form, setForm] = useState(
    settings || {
      companyName: 'TechCorp Solutions',
      officeStartTime: '09:00',
      gracePeriodMinutes: 15,
      officeEndTime: '18:00',
      geofenceRadiusMeters: 100,
      officeLatitude: 22.7196,
      officeLongitude: 75.8577,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(form);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Office Configuration & Management</h1>
          <p className="subtitle">Manage shifts, grace period rules, GPS geofence coordinates, and app state reset.</p>
        </div>
        <button className="btn btn-danger" onClick={onResetSystem}>
          ⚠️ Reset System Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px' }}>Shift & Geofence Rules</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Company / Organization Name</label>
              <input value={form.companyName || ''} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Office Start Time</label>
                <input type="time" value={form.officeStartTime || '09:00'} onChange={(e) => setForm({ ...form, officeStartTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Grace Period (Minutes)</label>
                <input type="number" value={form.gracePeriodMinutes || 15} onChange={(e) => setForm({ ...form, gracePeriodMinutes: Number(e.target.value) })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Office Latitude</label>
                <input type="number" step="0.0001" value={form.officeLatitude || 22.7196} onChange={(e) => setForm({ ...form, officeLatitude: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Office Longitude</label>
                <input type="number" step="0.0001" value={form.officeLongitude || 75.8577} onChange={(e) => setForm({ ...form, officeLongitude: Number(e.target.value) })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Geofence Radius (Meters)</label>
              <input type="number" value={form.geofenceRadiusMeters || 100} onChange={(e) => setForm({ ...form, geofenceRadiusMeters: Number(e.target.value) })} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>Save Settings</button>
          </form>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px' }}>System Diagnostics & Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--surface-card)', borderRadius: '8px' }}>
              <span className="form-label">System Version</span>
              <strong>v2.5.0 Pro</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--surface-card)', borderRadius: '8px' }}>
              <span className="form-label">Biometric AI Engine</span>
              <strong style={{ color: '#10b981' }}>FaceMatch v3.2 Active</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--surface-card)', borderRadius: '8px' }}>
              <span className="form-label">GPS Geofence Engine</span>
              <strong style={{ color: '#38bdf8' }}>Active (100m Radius)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--surface-card)', borderRadius: '8px' }}>
              <span className="form-label">Local Cache Status</span>
              <strong>Synced LocalStorage</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(getStoredAuthUser());
  const [loggedIn, setLoggedIn] = useState(Boolean(getStoredAuthUser()));
  const [theme, setTheme] = useState('dark');

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const refreshData = async () => {
    const res = await loadDashboardData();
    setData(res);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAuth = (authUser) => {
    setUser(authUser);
    setLoggedIn(true);
    showToast(`Welcome back, ${authUser.name}! Logged in as ${getRoleLabel(authUser.role)}.`);
    refreshData();
  };

  const handleLogout = () => {
    clearStoredAuth();
    setUser(null);
    setLoggedIn(false);
    setIsLogoutOpen(false);
    showToast('Successfully logged out.');
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleCheckInSubmit = async (payload) => {
    await submitCheckIn(payload);
    await refreshData();
    showToast(`Check-In recorded via ${payload.method}!`);
  };

  const handleCheckOutSubmit = async (employeeName) => {
    await submitCheckOut(employeeName);
    await refreshData();
    showToast(`Check-Out recorded for ${employeeName}`);
  };

  const handleAddEmployee = async (form) => {
    await submitAddEmployee(form);
    await refreshData();
    showToast(`Employee ${form.name} added successfully!`);
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateEmployeeStatus(id, newStatus);
    await refreshData();
    showToast(`Employee status updated to ${newStatus}`);
  };

  const handleDeleteEmployee = async (id) => {
    await deleteEmployee(id);
    await refreshData();
    showToast('Employee deleted from directory.');
  };

  const handleLeaveSubmit = async (form) => {
    await submitLeaveRequest(form);
    await refreshData();
    showToast('Leave request submitted!');
  };

  const handleLeaveStatus = async (id, newStatus) => {
    await updateLeaveStatus(id, newStatus);
    await refreshData();
    showToast(`Leave request ${newStatus}`);
  };

  const handleWfhSubmit = async (form) => {
    await submitWfhRequest(form);
    await refreshData();
    showToast('WFH request submitted!');
  };

  const handleWfhStatus = async (id, newStatus) => {
    await updateWfhStatus(id, newStatus);
    await refreshData();
    showToast(`WFH request ${newStatus}`);
  };

  const handleSaveSettings = async (newSettings) => {
    await updateSettings(newSettings);
    await refreshData();
    showToast('Office configuration saved!');
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await refreshData();
    showToast('All notifications marked as read.');
  };

  const handleClearNotifications = async () => {
    await clearNotifications();
    await refreshData();
    showToast('Notifications feed cleared.');
  };

  const handleResetSystem = async () => {
    if (window.confirm('Are you sure you want to reset all local attendance and employee data to factory defaults?')) {
      await resetSystemState();
      await refreshData();
      showToast('System reset to default mock data successfully.');
    }
  };

  return (
    <AppShell
      user={user}
      navItems={loggedIn ? getNavItems(user?.role) : guestNavItems}
      onOpenLogout={() => setIsLogoutOpen(true)}
      theme={theme}
      onToggleTheme={handleToggleTheme}
      isGuest={!loggedIn}
      notifications={data?.notifications || []}
      onMarkAllRead={handleMarkAllRead}
      onClearNotifications={handleClearNotifications}
    >
      <ToastAlert message={toastMessage} onClose={() => setToastMessage('')} />

      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onCheckIn={handleCheckInSubmit}
        employeeName={user?.name}
      />

      <AddEmployeeModal
        isOpen={isAddEmpOpen}
        onClose={() => setIsAddEmpOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirmLogout={handleLogout}
        user={user}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={loggedIn ? <Navigate to="/dashboard" replace /> : <AuthPage onAuth={handleAuth} initialMode="login" />} />
        <Route path="/signup" element={loggedIn ? <Navigate to="/dashboard" replace /> : <AuthPage onAuth={handleAuth} initialMode="signup" />} />

        {loggedIn ? (
          <>
            <Route path="/dashboard" element={<DashboardPage data={data} user={user} onOpenCheckIn={() => setIsCheckInOpen(true)} onOpenAddEmp={() => setIsAddEmpOpen(true)} onQuickCheckOut={handleCheckOutSubmit} />} />
            <Route path="/employees" element={<EmployeesPage data={data} onOpenAddEmp={() => setIsAddEmpOpen(true)} onStatusChange={handleStatusChange} onDelete={handleDeleteEmployee} />} />
            <Route path="/attendance" element={<AttendancePage data={data} onOpenCheckIn={() => setIsCheckInOpen(true)} onCheckOut={handleCheckOutSubmit} />} />
            <Route path="/leave" element={<LeavePage data={data} onSubmitLeave={handleLeaveSubmit} onUpdateLeaveStatus={handleLeaveStatus} user={user} />} />
            <Route path="/wfh" element={<WfhPage data={data} onSubmitWfh={handleWfhSubmit} onUpdateWfhStatus={handleWfhStatus} user={user} />} />
            <Route path="/reports" element={<ReportsPage data={data} />} />
            <Route path="/notifications" element={<NotificationsPage data={data} onMarkAllRead={handleMarkAllRead} onClearNotifications={handleClearNotifications} />} />
            <Route path="/settings" element={<SettingsPage settings={data?.settings} onSaveSettings={handleSaveSettings} onResetSystem={handleResetSystem} />} />
            <Route path="/profile" element={<ProfilePage user={user} attendanceHistory={data?.attendance || []} onUpdateProfile={(u) => setUser(u)} />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </AppShell>
  );
}
