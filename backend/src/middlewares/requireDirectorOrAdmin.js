import { requireDirectorProfile } from './requireDirector.js';

export async function requireDirectorOrAdmin(req, res, next) {
  if (req.user?.is_admin) {
    next();
    return;
  }

  await requireDirectorProfile(req, res, next);
}
