import {
  dashboardStats,
  initialAttendanceRecords,
  initialEmployees,
  initialLeaveRequests,
  initialNotifications,
  initialReports,
  initialWfhRequests
} from '../data/mockData.js';

export const getDashboardData = (req, res) => {
  res.json({
    stats: dashboardStats,
    employees: initialEmployees,
    attendance: initialAttendanceRecords,
    leaveRequests: initialLeaveRequests,
    wfhRequests: initialWfhRequests,
    reports: initialReports,
    notifications: initialNotifications,
  });
};
