import { Link, Route, Routes } from 'react-router-dom';

const Home = () => (
  <div className="page">
    <div className="card">
      <span className="tag">Office Attendance System</span>
      <h1>Welcome to the Attendance Dashboard</h1>
      <p>
        This starter app includes the MERN stack foundation for employee attendance,
        login, employee records, and attendance tracking.
      </p>
      <div className="actions">
        <Link to="/login" className="button primary">Login</Link>
        <Link to="/dashboard" className="button secondary">Dashboard</Link>
      </div>
    </div>
  </div>
);

const Login = () => (
  <div className="page">
    <div className="card form-card">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Email" defaultValue="admin@example.com" />
        <input type="password" placeholder="Password" defaultValue="password123" />
        <button type="button" className="button primary full">Sign In</button>
      </form>
    </div>
  </div>
);

const Dashboard = () => (
  <div className="page">
    <div className="stats-grid">
      <div className="stat-box">
        <p>Total Employees</p>
        <h3>150</h3>
      </div>
      <div className="stat-box">
        <p>Present</p>
        <h3>120</h3>
      </div>
      <div className="stat-box">
        <p>Late</p>
        <h3>08</h3>
      </div>
      <div className="stat-box">
        <p>WFH</p>
        <h3>05</h3>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="brand">Office Attendance</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
