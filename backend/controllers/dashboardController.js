import { attendanceRecords, dashboardStats, employees, leaveRequests, notifications, reports, wfhRequests } from '../data/mockData.js';

export const getDashboardData = (req, res) => {
  res.json({
    stats: dashboardStats,
    employees,
    attendance: attendanceRecords,
    leaveRequests,
    wfhRequests,
    reports,
    notifications,
  });
};
