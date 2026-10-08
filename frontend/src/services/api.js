const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_STORAGE_KEY = 'attendanceUser';
const TOKEN_STORAGE_KEY = 'attendanceToken';

function getEmptyDashboardData() {
  return {
    stats: {
      totalEmployees: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      wfh: 0,
      overtime: 0,
    },
    employees: [],
    attendance: [],
    leaveRequests: [],
    wfhRequests: [],
    reports: [],
    notifications: [],
  };
}

function persistAuth(user) {
  if (!user) return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  if (user.token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, user.token);
  }
}

export function getStoredAuthUser() {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function loginUserRequest(payload) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  persistAuth(data);
  return data;
}

export async function registerUserRequest(payload) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  persistAuth(data);
  return data;
}

export async function loadDashboardData() {
  try {
    const response = await fetch(`${API_URL}/dashboard`);
    if (!response.ok) {
      throw new Error('API unavailable');
    }
    const data = await response.json();
    return {
      stats: data.stats || getEmptyDashboardData().stats,
      employees: Array.isArray(data.employees) ? data.employees : [],
      attendance: Array.isArray(data.attendance) ? data.attendance : [],
      leaveRequests: Array.isArray(data.leaveRequests) ? data.leaveRequests : [],
      wfhRequests: Array.isArray(data.wfhRequests) ? data.wfhRequests : [],
      reports: Array.isArray(data.reports) ? data.reports : [],
      notifications: Array.isArray(data.notifications) ? data.notifications : [],
    };
  } catch (error) {
    return getEmptyDashboardData();
  }
}

export async function submitLeaveRequest(payload) {
  try {
    const response = await fetch(`${API_URL}/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Leave request failed');
    }

    return await response.json();
  } catch (error) {
    return {
      ...payload,
      id: Date.now(),
      status: 'Pending',
    };
  }
}

export async function submitWfhRequest(payload) {
  try {
    const response = await fetch(`${API_URL}/wfh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('WFH request failed');
    }

    return await response.json();
  } catch (error) {
    return {
      ...payload,
      id: Date.now(),
      status: 'Pending',
    };
  }
}
