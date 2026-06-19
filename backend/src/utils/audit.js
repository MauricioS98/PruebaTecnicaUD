import sequelize from '../config/database.js';

export async function setAuditUser(userRef, transaction) {
  const value = String(userRef).trim();
  if (!value) {
    throw new Error('El usuario de auditoría no puede estar vacío');
  }

  await sequelize.query('SELECT audit.set_changed_by(:user)', {
    replacements: { user: value },
    transaction,
  });
}
