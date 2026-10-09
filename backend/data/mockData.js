export const dashboardStats = {
  totalEmployees: 150,
  present: 120,
  absent: 10,
  late: 8,
  leave: 7,
  wfh: 5,
  overtime: 16,
};

export const initialEmployees = [
  { id: 1, employeeCode: 'EMP-001', name: 'Abhishek Sharma', email: 'abhishek@company.com', department: 'Engineering', designation: 'Senior Developer', status: 'Present', branch: 'Head Office', shift: 'Morning', role: 'admin', joiningDate: '2023-01-15' },
  { id: 2, employeeCode: 'EMP-002', name: 'Priya Verma', email: 'priya@company.com', department: 'HR', designation: 'HR Manager', status: 'Late', branch: 'Head Office', shift: 'Morning', role: 'manager', joiningDate: '2023-03-10' },
  { id: 3, employeeCode: 'EMP-003', name: 'Rohit Kumar', email: 'rohit@company.com', department: 'Sales', designation: 'Sales Executive', status: 'WFH', branch: 'Lucknow', shift: 'Evening', role: 'employee', joiningDate: '2023-06-20' },
  { id: 4, employeeCode: 'EMP-004', name: 'Sneha Gupta', email: 'sneha@company.com', department: 'Finance', designation: 'Accountant', status: 'Absent', branch: 'Delhi', shift: 'Morning', role: 'employee', joiningDate: '2023-08-01' },
  { id: 5, employeeCode: 'EMP-005', name: 'Ankit Singh', email: 'ankit@company.com', department: 'Support', designation: 'Support Lead', status: 'Present', branch: 'Head Office', shift: 'Morning', role: 'employee', joiningDate: '2024-02-12' },
  { id: 6, employeeCode: 'EMP-006', name: 'Meera Patel', email: 'meera@company.com', department: 'Design', designation: 'UI Designer', status: 'Leave', branch: 'Pune', shift: 'Morning', role: 'employee', joiningDate: '2024-05-18' },
  { id: 7, employeeCode: 'EMP-007', name: 'Karan Malhotra', email: 'karan@company.com', department: 'Engineering', designation: 'DevOps Engineer', status: 'Present', branch: 'Head Office', shift: 'Night', role: 'employee', joiningDate: '2024-07-01' },
  { id: 8, employeeCode: 'EMP-008', name: 'Neha Sharma', email: 'neha@company.com', department: 'Marketing', designation: 'Content Strategist', status: 'Present', branch: 'Head Office', shift: 'Morning', role: 'employee', joiningDate: '2024-09-10' },
];

export const initialAttendanceRecords = [
  { id: 1, employeeId: 1, employee: 'Abhishek Sharma', date: '2026-10-08', checkIn: '09:02 AM', checkOut: '06:15 PM', status: 'Present', method: 'Face Recognition', workingMinutes: 553, location: 'Office Geofence (22.7196, 75.8577)' },
  { id: 2, employeeId: 2, employee: 'Priya Verma', date: '2026-10-08', checkIn: '09:22 AM', checkOut: '06:30 PM', status: 'Late', method: 'GPS Location', workingMinutes: 548, location: 'Office Radius (22.7201, 75.8580)' },
  { id: 3, employeeId: 3, employee: 'Rohit Kumar', date: '2026-10-08', checkIn: '09:00 AM', checkOut: '05:30 PM', status: 'WFH', method: 'Mobile Biometric', workingMinutes: 510, location: 'Remote Work' },
  { id: 4, employeeId: 4, employee: 'Sneha Gupta', date: '2026-10-08', checkIn: '-', checkOut: '-', status: 'Absent', method: 'N/A', workingMinutes: 0, location: 'Unverified' },
  { id: 5, employeeId: 5, employee: 'Ankit Singh', date: '2026-10-08', checkIn: '08:55 AM', checkOut: '06:11 PM', status: 'Present', method: 'Fingerprint Scanner', workingMinutes: 556, location: 'Office Main Gate' },
  { id: 6, employeeId: 7, employee: 'Karan Malhotra', date: '2026-10-08', checkIn: '09:01 AM', checkOut: '06:05 PM', status: 'Present', method: 'QR Code', workingMinutes: 544, location: 'Office Lobby' },
];

export const initialLeaveRequests = [
  { id: 1, employeeId: 6, employee: 'Meera Patel', type: 'Casual Leave', from: '2026-10-10', to: '2026-10-12', status: 'Pending', reason: 'Family function in hometown' },
  { id: 2, employeeId: 3, employee: 'Rohit Kumar', type: 'Sick Leave', from: '2026-10-09', to: '2026-10-09', status: 'Approved', reason: 'High fever and doctor visit' },
  { id: 3, employeeId: 4, employee: 'Sneha Gupta', type: 'Earned Leave', from: '2026-10-13', to: '2026-10-15', status: 'Pending', reason: 'Personal vacation trip' },
  { id: 4, employeeId: 2, employee: 'Priya Verma', type: 'Casual Leave', from: '2026-10-16', to: '2026-10-16', status: 'Approved', reason: 'Doctor appointment' },
];

export const initialWfhRequests = [
  { id: 1, employeeId: 3, employee: 'Rohit Kumar', date: '2026-10-08', reason: 'Client coordination and remote deployment', status: 'Approved' },
  { id: 2, employeeId: 6, employee: 'Meera Patel', date: '2026-10-11', reason: 'Design sprint review and deep focus work', status: 'Pending' },
  { id: 3, employeeId: 1, employee: 'Abhishek Sharma', date: '2026-10-12', reason: 'System architecture setup & database maintenance', status: 'Pending' },
];

export const initialReports = [
  { id: 1, title: 'Overall Attendance Compliance', value: '94.2%', trend: '+2.4%' },
  { id: 2, title: 'Average Punctuality Rate', value: '88.5%', trend: '+1.1%' },
  { id: 3, title: 'Overtime Total (This Month)', value: '142.5 hrs', trend: '+12 hrs' },
  { id: 4, title: 'Leave Approval Efficiency', value: '96.0%', trend: 'Fast (< 4 hrs)' },
];

export const initialNotifications = [
  { id: 1, text: 'Attendance marked successfully via Face Recognition for Abhishek.', type: 'success', time: '10 mins ago', read: false },
  { id: 2, text: 'Priya Verma logged in late today at 09:22 AM.', type: 'warning', time: '1 hr ago', read: false },
  { id: 3, text: 'WFH request approved for Rohit Kumar for 2026-10-08.', type: 'info', time: '2 hrs ago', read: true },
  { id: 4, text: 'New leave request submitted by Meera Patel (Casual Leave).', type: 'neutral', time: '3 hrs ago', read: false },
];
