import { getDashboardData } from './dashboard.service.js';

function serializeRecord(record) {
  return typeof record?.get === 'function' ? record.get({ plain: true }) : record;
}

export async function index(req, res, next) {
  try {
    const data = await getDashboardData(req.user);
    res.json({
      success: true,
      data: {
        ...data,
        works: data.works.map(serializeRecord),
        interpretations: data.interpretations.map(serializeRecord),
      },
    });
  } catch (error) {
    next(error);
  }
}
