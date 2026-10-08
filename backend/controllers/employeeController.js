import Employee from '../models/Employee.js';

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('userId', 'name email role');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch employees.' });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { userId, employeeCode, department, designation, phone, status } = req.body;

    if (!userId || !employeeCode) {
      return res.status(400).json({ message: 'userId and employeeCode are required.' });
    }

    const employee = await Employee.create({
      userId,
      employeeCode,
      department,
      designation,
      phone,
      status,
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create employee.' });
  }
};
