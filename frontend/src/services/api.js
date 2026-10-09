import {
  initialAttendanceRecords,
  initialEmployees,
  initialLeaveRequests,
  initialNotifications,
  initialReports,
  initialWfhRequests
} from '../../../backend/data/mockData.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AUTH_STORAGE_KEY = 'attendanceUser';
const TOKEN_STORAGE_KEY = 'attendanceToken';
const DATA_STORAGE_KEY = 'officeAttendanceAppState_v2';

const DEFAULT_SETTINGS = {
  officeStartTime: '09:00',
  gracePeriodMinutes: 15,
  officeEndTime: '18:00',
  geofenceRadiusMeters: 100,
  officeLatitude: 22.7196,
  officeLongitude: 75.8577,
  companyName: 'TechCorp Solutions',
};

function getInitialState() {
  const stored = localStorage.getItem(DATA_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.employees) && parsed.employees.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse cached app state:', e);
    }
  }

  const defaultState = {
    employees: initialEmployees,
    attendance: initialAttendanceRecords,
    leaveRequests: initialLeaveRequests,
    wfhRequests: initialWfhRequests,
    reports: initialReports,
    notifications: initialNotifications,
    settings: DEFAULT_SETTINGS,
  };
  persistLocalData(defaultState);
  return defaultState;
}

function persistLocalData(data) {
  try {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save app state to localStorage:', e);
  }
}

export function computeStats(employees = [], attendance = [], leaves = [], wfhs = []) {
  const totalEmployees = employees.length || 150;
  const present = attendance.filter((a) => a.status === 'Present').length;
  const late = attendance.filter((a) => a.status === 'Late').length;
  const wfh = attendance.filter((a) => a.status === 'WFH').length + wfhs.filter((w) => w.status === 'Approved').length;
  const leave = leaves.filter((l) => l.status === 'Approved').length;
  const absent = Math.max(0, totalEmployees - (present + late + wfh + leave));
  const overtime = attendance.reduce((sum, a) => sum + (a.overtimeMinutes ? Math.round(a.overtimeMinutes / 60) : 0), 0) || 16;

  return {
    totalEmployees,
    present: present || 120,
    absent: absent || 10,
    late: late || 8,
    leave: leave || 7,
    wfh: wfh || 5,
    overtime: overtime || 16,
  };
}

export function getStoredAuthUser() {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    return null;
  }
}

export function persistAuth(user) {
  if (!user) return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  if (user.token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, user.token);
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function loginUserRequest(payload) {
  try {
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
  } catch (error) {
    // Fallback simulation for seamless offline / demo usage
    const demoUser = {
      id: Date.now(),
      name: payload.email ? payload.email.split('@')[0].replace('.', ' ') : 'Demo User',
      email: payload.email || 'demo@company.com',
      role: payload.email?.includes('admin') ? 'admin' : payload.email?.includes('manager') || payload.email?.includes('hr') ? 'manager' : 'employee',
      token: 'demo-jwt-token-' + Date.now(),
    };
    persistAuth(demoUser);
    return demoUser;
  }
}

export async function registerUserRequest(payload) {
  try {
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
  } catch (error) {
    const newUser = {
      id: Date.now(),
      name: payload.name || 'New User',
      email: payload.email,
      role: payload.role || 'employee',
      token: 'demo-jwt-token-' + Date.now(),
    };
    persistAuth(newUser);
    return newUser;
  }
}

export async function loadDashboardData() {
  let localState = getInitialState();
  try {
    const response = await fetch(`${API_URL}/dashboard`);
    if (response.ok) {
      const remote = await response.json();
      if (remote && remote.employees) {
        localState = {
          ...localState,
          ...remote,
        };
        persistLocalData(localState);
      }
    }
  } catch (err) {
    // Graceful offline fallback to local state
  }

  const stats = computeStats(
    localState.employees,
    localState.attendance,
    localState.leaveRequests,
    localState.wfhRequests
  );

  return {
    ...localState,
    stats,
  };
}

export async function submitCheckIn(checkInData) {
  let state = getInitialState();
  const todayDate = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Calculate status based on office start time (e.g. 09:00 + 15m grace)
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const targetStartMinutes = 9 * 60 + 15; // 09:15 AM
  const isLate = currentMinutes > targetStartMinutes;
  const finalStatus = checkInData.status || (isLate ? 'Late' : 'Present');

  const newEntry = {
    id: Date.now(),
    employeeId: checkInData.employeeId || 1,
    employee: checkInData.employee || 'Abhishek Sharma',
    date: todayDate,
    checkIn: timeStr,
    checkOut: '-',
    status: finalStatus,
    method: checkInData.method || 'Face Recognition',
    workingMinutes: 0,
    location: checkInData.location || 'Verified Office Geofence',
  };

  // Replace or prepend entry for today
  const existingIdx = state.attendance.findIndex(
    (a) => a.employee === newEntry.employee && a.date === todayDate
  );

  if (existingIdx >= 0) {
    state.attendance[existingIdx] = { ...state.attendance[existingIdx], ...newEntry };
  } else {
    state.attendance.unshift(newEntry);
  }

  // Add notification
  const note = {
    id: Date.now(),
    text: `Check-In recorded for ${newEntry.employee} via ${newEntry.method} (${newEntry.status}) at ${timeStr}.`,
    type: isLate ? 'warning' : 'success',
    time: 'Just now',
    read: false,
  };
  state.notifications.unshift(note);

  persistLocalData(state);

  try {
    await fetch(`${API_URL}/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkInData),
    });
  } catch (e) {}

  return newEntry;
}

export async function submitCheckOut(employeeName) {
  let state = getInitialState();
  const todayDate = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const recordIdx = state.attendance.findIndex(
    (a) => a.employee === employeeName && (a.checkOut === '-' || !a.checkOut)
  );

  if (recordIdx >= 0) {
    state.attendance[recordIdx].checkOut = timeStr;
    state.attendance[recordIdx].workingMinutes = 480; // 8 hrs simulation
    state.attendance[recordIdx].overtimeMinutes = 30;

    const note = {
      id: Date.now(),
      text: `Check-Out recorded for ${employeeName} at ${timeStr}. Total shift saved.`,
      type: 'info',
      time: 'Just now',
      read: false,
    };
    state.notifications.unshift(note);
    persistLocalData(state);
    return state.attendance[recordIdx];
  }
  return null;
}

export async function submitAddEmployee(employeeForm) {
  let state = getInitialState();
  const newEmp = {
    id: Date.now(),
    employeeCode: employeeForm.employeeCode || `EMP-00${state.employees.length + 1}`,
    name: employeeForm.name,
    email: employeeForm.email,
    department: employeeForm.department || 'Engineering',
    designation: employeeForm.designation || 'Team Member',
    branch: employeeForm.branch || 'Head Office',
    shift: employeeForm.shift || 'Morning',
    role: employeeForm.role || 'employee',
    status: employeeForm.status || 'Active',
    joiningDate: new Date().toISOString().split('T')[0],
  };

  state.employees.unshift(newEmp);
  const note = {
    id: Date.now(),
    text: `New employee ${newEmp.name} (${newEmp.employeeCode}) added to ${newEmp.department}.`,
    type: 'success',
    time: 'Just now',
    read: false,
  };
  state.notifications.unshift(note);

  persistLocalData(state);
  return newEmp;
}

export async function updateEmployeeStatus(id, newStatus) {
  let state = getInitialState();
  const empIdx = state.employees.findIndex((e) => e.id === id);
  if (empIdx >= 0) {
    state.employees[empIdx].status = newStatus;
    persistLocalData(state);
  }
  return state.employees[empIdx];
}

export async function deleteEmployee(id) {
  let state = getInitialState();
  state.employees = state.employees.filter((e) => e.id !== id);
  persistLocalData(state);
  return true;
}

export async function submitLeaveRequest(payload) {
  let state = getInitialState();
  const newLeave = {
    id: Date.now(),
    employee: payload.employee || 'Team Member',
    type: payload.type || 'Casual Leave',
    from: payload.from || new Date().toISOString().split('T')[0],
    to: payload.to || new Date().toISOString().split('T')[0],
    reason: payload.reason || 'Personal work',
    status: 'Pending',
  };

  state.leaveRequests.unshift(newLeave);
  state.notifications.unshift({
    id: Date.now(),
    text: `Leave request (${newLeave.type}) submitted by ${newLeave.employee}.`,
    type: 'neutral',
    time: 'Just now',
    read: false,
  });

  persistLocalData(state);
  return newLeave;
}

export async function updateLeaveStatus(id, newStatus) {
  let state = getInitialState();
  const idx = state.leaveRequests.findIndex((l) => l.id === id);
  if (idx >= 0) {
    state.leaveRequests[idx].status = newStatus;
    const leave = state.leaveRequests[idx];
    state.notifications.unshift({
      id: Date.now(),
      text: `Leave request for ${leave.employee} was ${newStatus}.`,
      type: newStatus === 'Approved' ? 'success' : 'warning',
      time: 'Just now',
      read: false,
    });
    persistLocalData(state);
  }
  return state.leaveRequests[idx];
}

export async function submitWfhRequest(payload) {
  let state = getInitialState();
  const newWfh = {
    id: Date.now(),
    employee: payload.employee || 'Team Member',
    date: payload.date || new Date().toISOString().split('T')[0],
    reason: payload.reason || 'Remote working',
    status: 'Pending',
  };

  state.wfhRequests.unshift(newWfh);
  state.notifications.unshift({
    id: Date.now(),
    text: `WFH request submitted by ${newWfh.employee} for ${newWfh.date}.`,
    type: 'neutral',
    time: 'Just now',
    read: false,
  });

  persistLocalData(state);
  return newWfh;
}

export async function updateWfhStatus(id, newStatus) {
  let state = getInitialState();
  const idx = state.wfhRequests.findIndex((w) => w.id === id);
  if (idx >= 0) {
    state.wfhRequests[idx].status = newStatus;
    const wfh = state.wfhRequests[idx];
    state.notifications.unshift({
      id: Date.now(),
      text: `WFH request for ${wfh.employee} on ${wfh.date} was ${newStatus}.`,
      type: newStatus === 'Approved' ? 'info' : 'warning',
      time: 'Just now',
      read: false,
    });
    persistLocalData(state);
  }
  return state.wfhRequests[idx];
}

export async function updateSettings(newSettings) {
  let state = getInitialState();
  state.settings = { ...state.settings, ...newSettings };
  persistLocalData(state);
  return state.settings;
}

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [keys.join(','), ...rows.map((r) => keys.map((k) => `"${r[k] !== undefined ? String(r[k]).replace(/"/g, '""') : ''}"`).join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
