export const dashboardStats = {
  totalEmployees: 150,
  present: 120,
  absent: 10,
  late: 8,
  leave: 7,
  wfh: 5,
  overtime: 16,
};

export const employees = [
  { id: 1, employeeCode: 'EMP-001', name: 'Abhishek Sharma', department: 'Engineering', designation: 'Senior Developer', status: 'Present', branch: 'Head Office', shift: 'Morning' },
  { id: 2, employeeCode: 'EMP-002', name: 'Priya Verma', department: 'HR', designation: 'HR Manager', status: 'Late', branch: 'Head Office', shift: 'Morning' },
  { id: 3, employeeCode: 'EMP-003', name: 'Rohit Kumar', department: 'Sales', designation: 'Sales Executive', status: 'WFH', branch: 'Lucknow', shift: 'Evening' },
  { id: 4, employeeCode: 'EMP-004', name: 'Sneha Gupta', department: 'Finance', designation: 'Accountant', status: 'Absent', branch: 'Delhi', shift: 'Morning' },
  { id: 5, employeeCode: 'EMP-005', name: 'Ankit Singh', department: 'Support', designation: 'Support Lead', status: 'Present', branch: 'Head Office', shift: 'Morning' },
  { id: 6, employeeCode: 'EMP-006', name: 'Meera Patel', department: 'Design', designation: 'UI Designer', status: 'Leave', branch: 'Pune', shift: 'Morning' },
];

export const attendanceRecords = [
  { id: 1, employee: 'Abhishek Sharma', date: '2026-10-08', checkIn: '09:02 AM', checkOut: '06:15 PM', status: 'Present', method: 'Face Recognition' },
  { id: 2, employee: 'Priya Verma', date: '2026-10-08', checkIn: '09:18 AM', checkOut: '06:30 PM', status: 'Late', method: 'GPS' },
  { id: 3, employee: 'Rohit Kumar', date: '2026-10-08', checkIn: '10:00 AM', checkOut: '05:30 PM', status: 'WFH', method: 'Mobile Biometric' },
  { id: 4, employee: 'Sneha Gupta', date: '2026-10-08', checkIn: '-', checkOut: '-', status: 'Absent', method: 'N/A' },
  { id: 5, employee: 'Ankit Singh', date: '2026-10-08', checkIn: '08:57 AM', checkOut: '06:11 PM', status: 'Present', method: 'Fingerprint' },
];

export const leaveRequests = [
  { id: 1, employee: 'Meera Patel', type: 'Casual Leave', from: '2026-10-10', to: '2026-10-12', status: 'Pending', reason: 'Family function' },
  { id: 2, employee: 'Rohit Kumar', type: 'Sick Leave', from: '2026-10-09', to: '2026-10-09', status: 'Approved', reason: 'Health issue' },
  { id: 3, employee: 'Sneha Gupta', type: 'Earned Leave', from: '2026-10-13', to: '2026-10-15', status: 'Pending', reason: 'Travel' },
];

export const wfhRequests = [
  { id: 1, employee: 'Rohit Kumar', date: '2026-10-08', reason: 'Client coordination', status: 'Approved' },
  { id: 2, employee: 'Meera Patel', date: '2026-10-11', reason: 'Design review', status: 'Pending' },
  { id: 3, employee: 'Abhishek Sharma', date: '2026-10-12', reason: 'Remote debugging', status: 'Pending' },
];

export const reports = [
  { id: 1, title: 'Daily Attendance', value: '94.2%' },
  { id: 2, title: 'Late Employees', value: '08' },
  { id: 3, title: 'Overtime Hours', value: '16.5h' },
  { id: 4, title: 'Leave Approval Rate', value: '92%' },
];

export const notifications = [
  { id: 1, text: 'Attendance marked successfully for Abhishek.', type: 'success' },
  { id: 2, text: 'Priya is late today.', type: 'warning' },
  { id: 3, text: 'WFH request approved for Rohit.', type: 'info' },
  { id: 4, text: 'Leave request is pending review.', type: 'neutral' },
];
