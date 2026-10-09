import { initialLeaveRequests } from '../data/mockData.js';

export const getLeaveRequests = (req, res) => {
  res.json(initialLeaveRequests);
};

export const createLeaveRequest = (req, res) => {
  const { employee, type, from, to, reason } = req.body;

  if (!employee || !type || !from || !to) {
    return res.status(400).json({ message: 'Employee, type, from and to are required.' });
  }

  const newRequest = {
    id: Date.now(),
    employee,
    type,
    from,
    to,
    reason: reason || 'No reason provided',
    status: 'Pending',
  };

  initialLeaveRequests.unshift(newRequest);
  res.status(201).json(newRequest);
};
