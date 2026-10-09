import { initialReports } from '../data/mockData.js';

export const getReports = (req, res) => {
  res.json(initialReports);
};
