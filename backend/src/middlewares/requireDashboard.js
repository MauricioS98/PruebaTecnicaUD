import { requireWriteAccess } from './requireWrite.js';

export async function requireDashboardAccess(req, res, next) {
  if (req.user?.is_admin) {
    next();
    return;
  }

  await requireWriteAccess(req, res, next);
}
