import { requireComposerProfile } from './requireComposer.js';

export async function requireComposerOrAdmin(req, res, next) {
  if (req.user?.is_admin) {
    next();
    return;
  }

  await requireComposerProfile(req, res, next);
}
