import { reports } from '../data/mockData.js';

export const getReports = (req, res) => {
  res.json(reports);
};
