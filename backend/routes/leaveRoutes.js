import express from 'express';
import { createLeaveRequest, getLeaveRequests } from '../controllers/leaveController.js';

const router = express.Router();

router.get('/', getLeaveRequests);
router.post('/', createLeaveRequest);

export default router;
