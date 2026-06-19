import sequelize, {
  Work,
  Composer,
  Genre,
  Composition,
  WorkGenre,
  Director,
  Artist,
  TypeInterpretation,
  TypeInstrument,
  Instrument,
  Interpretation,
  InterpretationArtist,
} from '../../models/index.js';
import { setAuditUser } from '../../utils/audit.js';
import { ApiError } from '../../utils/ApiError.js';
import { deleteScoreFile } from '../../utils/scoreFiles.js';
import { deleteAudioFile } from '../../utils/audioFiles.js';

const workIncludes = [
  {
    model: Composer,
    through: { attributes: [] },
    attributes: ['id_composer', 'nickname'],
  },
  {
    model: Genre,
    through: { attributes: [] },
    attributes: ['id_genre', 'name'],
  },
];

async function getUserComposer(userId, transaction = null) {
  return Composer.findOne({ where: { id_user: userId }, transaction });
}

async function assertWorkOwnership(workId, user, transaction = null) {
  if (user.is_admin) {
    const work = await Work.findByPk(workId, { transaction });
    if (!work) throw new ApiError(404, 'Obra no encontrada');
    return null;
  }

  const userComposer = await getUserComposer(user.id_user, transaction);
  if (!userComposer) {
    throw new ApiError(403, 'Se requiere el perfil de Compositor');
  }

  const link = await Composition.findOne({
    where: { id_work: workId, id_composer: userComposer.id_composer },
    transaction,
  });

  if (!link) {
    throw new ApiError(403, 'Solo puedes gestionar tus propias obras');
  }

  return userComposer;
}

function isHistoricWork(user, payload) {
  return !!user.is_admin && payload.mode === 'historic';
}

function normalizeComposerIds(ids) {
  return [...new Set((ids ?? []).filter((id) => Number.isInteger(id) && id > 0))];
}

export async function listWorks() {
  return Work.findAll({
    include: workIncludes,
    attributes: {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)::int
            FROM interpretation i
            WHERE i.id_work = "work".id_work
          )`),
          'interpretation_count',
        ],
      ],
    },
    order: [['name', 'ASC']],
  });
}

export async function getWorkById(id, transaction = null) {
  const work = await Work.findByPk(id, { include: workIncludes, transaction });
  if (!work) throw new ApiError(404, 'Obra no encontrada');
  return work;
}

export async function createWork(payload, user) {
  if (payload.mode === 'historic' && !user.is_admin) {
    throw new ApiError(403, 'Solo un administrador puede registrar obras históricas');
  }

  const isHistoric = isHistoricWork(user, payload);

  let composerIds;
  if (isHistoric) {
    composerIds = normalizeComposerIds(payload.composerIds);
  } else {
    const userComposer = await Composer.findOne({ where: { id_user: user.id_user } });
    if (!userComposer) {
      throw new ApiError(403, 'Se requiere el perfil de Compositor para crear obras');
    }
    composerIds = [...new Set([userComposer.id_composer, ...(payload.composerIds ?? [])])];
  }

  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);

    const work = await Work.create(
      {
        name: payload.name,
        description: payload.description ?? '',
        write_date: payload.write_date,
        score_pdf_url: payload.score_pdf_url ?? null,
      },
      { transaction }
    );

    if (composerIds.length) {
      await Composition.bulkCreate(
        composerIds.map((id_composer) => ({
          id_work: work.id_work,
          id_composer,
        })),
        { transaction }
      );
    }

    if (payload.genreIds?.length) {
      await WorkGenre.bulkCreate(
        payload.genreIds.map((id_genre) => ({
          id_work: work.id_work,
          id_genre,
        })),
        { transaction }
      );
    }

    return getWorkById(work.id_work, transaction);
  });
}

export async function updateWork(id, payload, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);

    const userComposer = await assertWorkOwnership(id, user, transaction);
    const isHistoric = isHistoricWork(user, payload);

    const work = await Work.findByPk(id, { transaction });
    if (!work) throw new ApiError(404, 'Obra no encontrada');

    const previousPdf = work.score_pdf_url;

    await work.update(
      {
        name: payload.name ?? work.name,
        description: payload.description ?? work.description,
        write_date: payload.write_date ?? work.write_date,
        score_pdf_url:
          payload.score_pdf_url !== undefined ? payload.score_pdf_url : work.score_pdf_url,
      },
      { transaction }
    );

    if (payload.composerIds !== undefined) {
      let composerIds;
      if (isHistoric || user.is_admin) {
        composerIds = normalizeComposerIds(payload.composerIds);
      } else {
        composerIds = [...new Set([userComposer.id_composer, ...payload.composerIds])];
      }
      await Composition.destroy({ where: { id_work: id }, transaction });
      if (composerIds.length) {
        await Composition.bulkCreate(
          composerIds.map((id_composer) => ({ id_work: id, id_composer })),
          { transaction }
        );
      }
    }

    if (payload.genreIds !== undefined) {
      await WorkGenre.destroy({ where: { id_work: id }, transaction });
      if (payload.genreIds.length) {
        await WorkGenre.bulkCreate(
          payload.genreIds.map((id_genre) => ({ id_work: id, id_genre })),
          { transaction }
        );
      }
    }

    if (
      payload.score_pdf_url &&
      previousPdf &&
      previousPdf !== payload.score_pdf_url
    ) {
      await deleteScoreFile(previousPdf);
    }

    return getWorkById(id, transaction);
  });
}

export async function deleteWork(id, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    await assertWorkOwnership(id, user, transaction);

    const work = await Work.findByPk(id, { transaction });
    if (!work) throw new ApiError(404, 'Obra no encontrada');

    const interpretationsCount = await Interpretation.count({
      where: { id_work: id },
      transaction,
    });

    if (interpretationsCount > 0) {
      throw new ApiError(
        409,
        'No puedes eliminar una obra que tiene interpretaciones registradas'
      );
    }

    const scorePdfUrl = work.score_pdf_url;
    await work.destroy({ transaction });
    await deleteScoreFile(scorePdfUrl);
    return { deleted: true };
  });
}

export async function listComposers() {
  return Composer.findAll({ order: [['nickname', 'ASC']] });
}

export async function updateComposer(id, payload, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const composer = await Composer.findByPk(id, { transaction });
    if (!composer) throw new ApiError(404, 'Compositor no encontrado');
    await composer.update(payload, { transaction });
    return composer;
  });
}

export async function listDirectors() {
  return Director.findAll({ order: [['nickname', 'ASC']] });
}

export async function getDirectorById(id) {
  const director = await Director.findByPk(id);
  if (!director) throw new ApiError(404, 'Director no encontrado');
  return director;
}

export async function updateDirector(id, payload, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const director = await Director.findByPk(id, { transaction });
    if (!director) throw new ApiError(404, 'Director no encontrado');
    await director.update(payload, { transaction });
    return director;
  });
}

export async function listArtists() {
  return Artist.findAll({ order: [['nickname', 'ASC']] });
}

export async function createArtist(payload, user) {
  const nickname = String(payload.nickname ?? '').trim();
  if (!nickname) {
    throw new ApiError(400, 'El nombre artístico es obligatorio');
  }

  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    return Artist.create(
      {
        id_user: null,
        nickname,
        description: String(payload.description ?? '').trim(),
      },
      { transaction }
    );
  });
}

export async function getArtistById(id) {
  const artist = await Artist.findByPk(id);
  if (!artist) throw new ApiError(404, 'Artista no encontrado');
  return artist;
}

export async function updateArtist(id, payload, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const artist = await Artist.findByPk(id, { transaction });
    if (!artist) throw new ApiError(404, 'Artista no encontrado');
    await artist.update(payload, { transaction });
    return artist;
  });
}

export async function listCatalogs() {
  const [genres, types, instruments, typeInstruments] = await Promise.all([
    Genre.findAll({ order: [['name', 'ASC']] }),
    TypeInterpretation.findAll({ order: [['name', 'ASC']] }),
    Instrument.findAll({ include: [TypeInstrument], order: [['name', 'ASC']] }),
    TypeInstrument.findAll({ order: [['name', 'ASC']] }),
  ]);
  return { genres, types, instruments, typeInstruments };
}

const interpretationIncludes = [
  { model: Work, attributes: ['id_work', 'name'] },
  { model: Director, attributes: ['id_director', 'nickname'] },
  { model: TypeInterpretation, attributes: ['id_type_interpretation', 'name', 'min_artist', 'max_artist'] },
  {
    model: InterpretationArtist,
    include: [
      { model: Artist, attributes: ['id_artist', 'nickname'] },
      { model: Instrument, attributes: ['id_instrument', 'name'] },
    ],
  },
];

export async function listInterpretations(filters = {}) {
  const where = {};
  if (filters.workId) where.id_work = filters.workId;
  if (filters.directorId) where.id_director = filters.directorId;

  const include = [...interpretationIncludes];
  if (filters.artistId) {
    include[3] = {
      ...include[3],
      where: { id_artist: filters.artistId },
      required: true,
    };
  }

  return Interpretation.findAll({
    where,
    include,
    order: [['load_file_date', 'DESC']],
  });
}

function validateInterpretationPayload(payload, type) {
  const isLegacy = payload.mode === 'legacy';

  if (!isLegacy && type) {
    const count = payload.artists?.length ?? 0;
    if (count < type.min_artist || count > type.max_artist) {
      throw new ApiError(
        400,
        `La interpretación requiere entre ${type.min_artist} y ${type.max_artist} artistas`
      );
    }
  }
}

function isHistoricInterpretation(user, payload) {
  return !!user.is_admin && payload.mode === 'legacy';
}

async function assertInterpretationOwnership(id, user, transaction = null) {
  if (user.is_admin) {
    const interpretation = await Interpretation.findByPk(id, { transaction });
    if (!interpretation) {
      throw new ApiError(404, 'Interpretación no encontrada');
    }
    return { userDirector: null, interpretation };
  }

  const userDirector = await Director.findOne({ where: { id_user: user.id_user }, transaction });
  if (!userDirector) {
    throw new ApiError(403, 'Se requiere el perfil de Director');
  }

  const interpretation = await Interpretation.findByPk(id, { transaction });
  if (!interpretation) {
    throw new ApiError(404, 'Interpretación no encontrada');
  }

  if (interpretation.id_director !== userDirector.id_director) {
    throw new ApiError(403, 'Solo puedes gestionar tus propias interpretaciones');
  }

  return { userDirector, interpretation };
}

export async function createInterpretation(payload, user) {
  if (payload.mode === 'legacy' && !user.is_admin) {
    throw new ApiError(403, 'Solo un administrador puede registrar interpretaciones históricas');
  }

  const isHistoric = isHistoricInterpretation(user, payload);

  let userDirector = null;
  if (!isHistoric) {
    userDirector = await Director.findOne({ where: { id_user: user.id_user } });
    if (!userDirector) {
      throw new ApiError(403, 'Se requiere el perfil de Director para crear interpretaciones');
    }

    if (!payload.audio_mp3_url) {
      throw new ApiError(400, 'Debes adjuntar un archivo MP3 para la interpretación');
    }
  }

  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);

    let type = null;
    if (payload.id_type_interpretation) {
      type = await TypeInterpretation.findByPk(payload.id_type_interpretation, { transaction });
      if (!type) throw new ApiError(404, 'Tipo de interpretación no encontrado');
    }

    validateInterpretationPayload(payload, type);

    const interpretation = await Interpretation.create(
      {
        id_type_interpretation: payload.id_type_interpretation ?? null,
        id_work: payload.id_work,
        id_director: isHistoric ? null : userDirector.id_director,
        load_file_date: payload.load_file_date ?? new Date().toISOString().slice(0, 10),
        audio_mp3_url: payload.audio_mp3_url ?? null,
      },
      { transaction }
    );

    if (payload.artists?.length) {
      await InterpretationArtist.bulkCreate(
        payload.artists.map((a) => ({
          id_interpretation: interpretation.id_interpretation,
          id_artist: a.id_artist,
          id_instrument: a.id_instrument ?? null,
        })),
        { transaction }
      );
    }

    return Interpretation.findByPk(interpretation.id_interpretation, {
      include: interpretationIncludes,
      transaction,
    });
  });
}

export async function updateInterpretation(id, payload, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);

    const { interpretation } = await assertInterpretationOwnership(id, user, transaction);
    const isHistoric = isHistoricInterpretation(user, payload);
    const previousAudio = interpretation.audio_mp3_url;

    const nextTypeId =
      payload.id_type_interpretation !== undefined
        ? payload.id_type_interpretation
        : interpretation.id_type_interpretation;

    let type = null;
    if (nextTypeId) {
      type = await TypeInterpretation.findByPk(nextTypeId, { transaction });
      if (!type) throw new ApiError(404, 'Tipo de interpretación no encontrado');
    }

    if (payload.artists) {
      validateInterpretationPayload({ ...payload, mode: isHistoric ? 'legacy' : payload.mode }, type);
    }

    const nextAudioUrl =
      payload.audio_mp3_url !== undefined ? payload.audio_mp3_url : interpretation.audio_mp3_url;

    if (!isHistoric && !nextAudioUrl) {
      throw new ApiError(400, 'La interpretación debe tener un archivo MP3');
    }

    await interpretation.update(
      {
        id_work: payload.id_work ?? interpretation.id_work,
        id_type_interpretation: nextTypeId,
        load_file_date: payload.load_file_date ?? interpretation.load_file_date,
        audio_mp3_url: nextAudioUrl,
      },
      { transaction }
    );

    if (payload.artists) {
      await InterpretationArtist.destroy({ where: { id_interpretation: id }, transaction });
      if (payload.artists.length) {
        await InterpretationArtist.bulkCreate(
          payload.artists.map((a) => ({
            id_interpretation: id,
            id_artist: a.id_artist,
            id_instrument: a.id_instrument ?? null,
          })),
          { transaction }
        );
      }
    }

    if (
      payload.audio_mp3_url &&
      previousAudio &&
      previousAudio !== payload.audio_mp3_url
    ) {
      await deleteAudioFile(previousAudio);
    }

    return Interpretation.findByPk(id, {
      include: interpretationIncludes,
      transaction,
    });
  });
}

export async function deleteInterpretation(id, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const { interpretation } = await assertInterpretationOwnership(id, user, transaction);
    const audioUrl = interpretation.audio_mp3_url;
    await interpretation.destroy({ transaction });
    await deleteAudioFile(audioUrl);
    return { deleted: true };
  });
}
