import express from 'express';
import { createWfhRequest, getWfhRequests } from '../controllers/wfhController.js';

const router = express.Router();

router.get('/', getWfhRequests);
router.post('/', createWfhRequest);

export default router;
