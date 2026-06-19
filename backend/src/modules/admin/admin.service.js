import sequelize from '../../config/database.js';
import { UserApp } from '../../models/index.js';
import { resolveUserProfiles } from '../auth/auth.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { setAuditUser } from '../../utils/audit.js';

export async function listUsers() {
  const users = await UserApp.findAll({
    attributes: ['id_user', 'name', 'email', 'is_admin'],
    order: [['name', 'ASC']],
  });

  return Promise.all(
    users.map(async (user) => {
      const context = await resolveUserProfiles(user.id_user);
      return {
        id: user.id_user,
        name: user.name,
        email: user.email,
        isAdmin: !!user.is_admin,
        profileLabel: context.profileLabel,
      };
    })
  );
}

export async function setUserAdminStatus(actorUser, targetUserId, isAdmin) {
  const nextIsAdmin = !!isAdmin;

  if (Number(targetUserId) === actorUser.id_user && !nextIsAdmin) {
    throw new ApiError(400, 'No puedes quitarte el rol de administrador a ti mismo');
  }

  const user = await UserApp.findByPk(targetUserId);
  if (!user) {
    throw new ApiError(404, 'Usuario no encontrado');
  }

  if (!nextIsAdmin && user.is_admin) {
    const adminCount = await UserApp.count({ where: { is_admin: true } });
    if (adminCount <= 1) {
      throw new ApiError(400, 'Debe existir al menos un administrador');
    }
  }

  return sequelize.transaction(async (transaction) => {
    await setAuditUser(actorUser.email, transaction);
    user.is_admin = nextIsAdmin;
    await user.save({ transaction });

    const context = await resolveUserProfiles(user.id_user);
    return {
      id: user.id_user,
      name: user.name,
      email: user.email,
      isAdmin: !!user.is_admin,
      profileLabel: context.profileLabel,
    };
  });
}
