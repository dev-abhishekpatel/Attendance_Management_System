import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: String,
      default: '',
    },
    checkOut: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'Leave', 'WFH', 'Half Day'],
      default: 'Present',
    },
    method: {
      type: String,
      enum: ['FACE', 'FINGERPRINT', 'GPS', 'MOBILE_BIOMETRIC', 'QR'],
      default: 'GPS',
    },
    location: {
      latitude: Number,
      longitude: Number,
    },
    workingMinutes: {
      type: Number,
      default: 0,
    },
    overtimeMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
