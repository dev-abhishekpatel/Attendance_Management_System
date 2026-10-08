import Attendance from '../models/Attendance.js';

export const checkIn = async (req, res) => {
  try {
    const { employeeId, method, latitude, longitude } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: 'employeeId is required.' });
    }

    const today = new Date();
    const date = today.toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ employeeId, date: date });

    if (attendance) {
      return res.status(400).json({ message: 'Attendance already checked in today.' });
    }

    const newAttendance = await Attendance.create({
      employeeId,
      date,
      checkIn: new Date().toLocaleTimeString(),
      status: 'Present',
      method: method || 'GPS',
      location: {
        latitude,
        longitude,
      },
    });

    res.status(201).json({
      message: 'Check-in successful.',
      attendance: newAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Check-in failed.' });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ employeeId, date: today });

    if (!attendance) {
      return res.status(404).json({ message: 'No check-in record found for today.' });
    }

    attendance.checkOut = new Date().toLocaleTimeString();
    await attendance.save();

    res.json({
      message: 'Check-out successful.',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Check-out failed.' });
  }
};

export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const entries = await Attendance.find({ date: today }).populate('employeeId');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch attendance.' });
  }
};
