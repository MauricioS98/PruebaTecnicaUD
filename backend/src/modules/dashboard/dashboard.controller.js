import { getDashboardData } from './dashboard.service.js';

export async function index(req, res, next) {
  try {
    const data = await getDashboardData(req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
