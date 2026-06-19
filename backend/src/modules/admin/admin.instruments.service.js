import sequelize, {
  TypeInstrument,
  Instrument,
  InterpretationArtist,
} from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { setAuditUser } from '../../utils/audit.js';

function normalizeText(value, field) {
  const text = String(value ?? '').trim();
  if (!text) {
    throw new ApiError(400, `${field} es obligatorio`);
  }
  return text;
}

export async function getInstrumentsCatalog() {
  const [typeInstruments, instruments] = await Promise.all([
    TypeInstrument.findAll({ order: [['name', 'ASC']] }),
    Instrument.findAll({
      include: [{ model: TypeInstrument, attributes: ['id_type_instrument', 'name'] }],
      order: [['name', 'ASC']],
    }),
  ]);

  return { typeInstruments, instruments };
}

export async function createTypeInstrument(payload, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    return TypeInstrument.create(
      {
        name: normalizeText(payload.name, 'El nombre'),
        description: String(payload.description ?? '').trim(),
      },
      { transaction }
    );
  });
}

export async function updateTypeInstrument(id, payload, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const type = await TypeInstrument.findByPk(id, { transaction });
    if (!type) throw new ApiError(404, 'Tipo de instrumento no encontrado');

    await type.update(
      {
        name: payload.name !== undefined ? normalizeText(payload.name, 'El nombre') : type.name,
        description:
          payload.description !== undefined
            ? String(payload.description ?? '').trim()
            : type.description,
      },
      { transaction }
    );

    return type;
  });
}

export async function deleteTypeInstrument(id, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const type = await TypeInstrument.findByPk(id, { transaction });
    if (!type) throw new ApiError(404, 'Tipo de instrumento no encontrado');

    const instrumentsCount = await Instrument.count({
      where: { id_type_instrument: id },
      transaction,
    });

    if (instrumentsCount > 0) {
      throw new ApiError(
        409,
        'No puedes eliminar un tipo que tiene instrumentos asociados'
      );
    }

    await type.destroy({ transaction });
    return { deleted: true };
  });
}

export async function createInstrument(payload, user) {
  const id_type_instrument = Number(payload.id_type_instrument);
  if (!Number.isInteger(id_type_instrument) || id_type_instrument <= 0) {
    throw new ApiError(400, 'Debes seleccionar un tipo de instrumento');
  }

  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);

    const type = await TypeInstrument.findByPk(id_type_instrument, { transaction });
    if (!type) throw new ApiError(404, 'Tipo de instrumento no encontrado');

    const instrument = await Instrument.create(
      {
        name: normalizeText(payload.name, 'El nombre'),
        description: String(payload.description ?? '').trim(),
        id_type_instrument,
      },
      { transaction }
    );

    return Instrument.findByPk(instrument.id_instrument, {
      include: [{ model: TypeInstrument, attributes: ['id_type_instrument', 'name'] }],
      transaction,
    });
  });
}

export async function updateInstrument(id, payload, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const instrument = await Instrument.findByPk(id, { transaction });
    if (!instrument) throw new ApiError(404, 'Instrumento no encontrado');

    let id_type_instrument = instrument.id_type_instrument;
    if (payload.id_type_instrument !== undefined) {
      id_type_instrument = Number(payload.id_type_instrument);
      if (!Number.isInteger(id_type_instrument) || id_type_instrument <= 0) {
        throw new ApiError(400, 'Debes seleccionar un tipo de instrumento');
      }
      const type = await TypeInstrument.findByPk(id_type_instrument, { transaction });
      if (!type) throw new ApiError(404, 'Tipo de instrumento no encontrado');
    }

    await instrument.update(
      {
        name:
          payload.name !== undefined
            ? normalizeText(payload.name, 'El nombre')
            : instrument.name,
        description:
          payload.description !== undefined
            ? String(payload.description ?? '').trim()
            : instrument.description,
        id_type_instrument,
      },
      { transaction }
    );

    return Instrument.findByPk(id, {
      include: [{ model: TypeInstrument, attributes: ['id_type_instrument', 'name'] }],
      transaction,
    });
  });
}

export async function deleteInstrument(id, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const instrument = await Instrument.findByPk(id, { transaction });
    if (!instrument) throw new ApiError(404, 'Instrumento no encontrado');

    const usageCount = await InterpretationArtist.count({
      where: { id_instrument: id },
      transaction,
    });

    if (usageCount > 0) {
      throw new ApiError(
        409,
        'No puedes eliminar un instrumento usado en interpretaciones'
      );
    }

    await instrument.destroy({ transaction });
    return { deleted: true };
  });
}
