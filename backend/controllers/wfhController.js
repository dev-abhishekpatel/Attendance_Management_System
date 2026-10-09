import { initialWfhRequests } from '../data/mockData.js';

export const getWfhRequests = (req, res) => {
  res.json(initialWfhRequests);
};

export const createWfhRequest = (req, res) => {
  const { employee, date, reason } = req.body;

  if (!employee || !date) {
    return res.status(400).json({ message: 'Employee and date are required.' });
  }

  const newRequest = {
    id: Date.now(),
    employee,
    date,
    reason: reason || 'No reason provided',
    status: 'Pending',
  };

  initialWfhRequests.unshift(newRequest);
  res.status(201).json(newRequest);
};
