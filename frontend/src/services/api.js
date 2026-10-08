const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fallbackData = {
  stats: {
    totalEmployees: 150,
    present: 120,
    absent: 10,
    late: 8,
    leave: 7,
    wfh: 5,
    overtime: 16,
  },
  employees: [
    { id: 1, employeeCode: 'EMP-001', name: 'Abhishek Sharma', department: 'Engineering', designation: 'Senior Developer', status: 'Present', branch: 'Head Office', shift: 'Morning' },
    { id: 2, employeeCode: 'EMP-002', name: 'Priya Verma', department: 'HR', designation: 'HR Manager', status: 'Late', branch: 'Head Office', shift: 'Morning' },
    { id: 3, employeeCode: 'EMP-003', name: 'Rohit Kumar', department: 'Sales', designation: 'Sales Executive', status: 'WFH', branch: 'Lucknow', shift: 'Evening' },
    { id: 4, employeeCode: 'EMP-004', name: 'Sneha Gupta', department: 'Finance', designation: 'Accountant', status: 'Absent', branch: 'Delhi', shift: 'Morning' },
  ],
  attendance: [
    { id: 1, employee: 'Abhishek Sharma', date: '2026-10-08', checkIn: '09:02 AM', checkOut: '06:15 PM', status: 'Present', method: 'Face Recognition' },
    { id: 2, employee: 'Priya Verma', date: '2026-10-08', checkIn: '09:18 AM', checkOut: '06:30 PM', status: 'Late', method: 'GPS' },
    { id: 3, employee: 'Rohit Kumar', date: '2026-10-08', checkIn: '10:00 AM', checkOut: '05:30 PM', status: 'WFH', method: 'Mobile Biometric' },
  ],
  leaveRequests: [
    { id: 1, employee: 'Meera Patel', type: 'Casual Leave', from: '2026-10-10', to: '2026-10-12', status: 'Pending', reason: 'Family function' },
    { id: 2, employee: 'Rohit Kumar', type: 'Sick Leave', from: '2026-10-09', to: '2026-10-09', status: 'Approved', reason: 'Health issue' },
  ],
  wfhRequests: [
    { id: 1, employee: 'Rohit Kumar', date: '2026-10-08', reason: 'Client coordination', status: 'Approved' },
    { id: 2, employee: 'Meera Patel', date: '2026-10-11', reason: 'Design review', status: 'Pending' },
  ],
  reports: [
    { id: 1, title: 'Daily Attendance', value: '94.2%' },
    { id: 2, title: 'Late Employees', value: '08' },
    { id: 3, title: 'Overtime Hours', value: '16.5h' },
    { id: 4, title: 'Leave Approval Rate', value: '92%' },
  ],
  notifications: [
    { id: 1, text: 'Attendance marked successfully for Abhishek.', type: 'success' },
    { id: 2, text: 'Priya is late today.', type: 'warning' },
    { id: 3, text: 'WFH request approved for Rohit.', type: 'info' },
  ],
};

export async function loadDashboardData() {
  try {
    const response = await fetch(`${API_URL}/dashboard`);
    if (!response.ok) {
      throw new Error('API unavailable');
    }
    const data = await response.json();
    return {
      stats: data.stats || fallbackData.stats,
      employees: data.employees || fallbackData.employees,
      attendance: data.attendance || fallbackData.attendance,
      leaveRequests: data.leaveRequests || fallbackData.leaveRequests,
      wfhRequests: data.wfhRequests || fallbackData.wfhRequests,
      reports: data.reports || fallbackData.reports,
      notifications: data.notifications || fallbackData.notifications,
    };
  } catch (error) {
    return fallbackData;
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
