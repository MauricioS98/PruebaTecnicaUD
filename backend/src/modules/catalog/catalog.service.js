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

export async function listWorks() {
  return Work.findAll({
    include: workIncludes,
    order: [['name', 'ASC']],
  });
}

export async function getWorkById(id) {
  const work = await Work.findByPk(id, { include: workIncludes });
  if (!work) throw new ApiError(404, 'Obra no encontrada');
  return work;
}

export async function createWork(payload, user) {
  const userComposer = await Composer.findOne({ where: { id_user: user.id_user } });
  if (!userComposer) {
    throw new ApiError(403, 'Se requiere el perfil de Compositor para crear obras');
  }

  const composerIds = [
    ...new Set([userComposer.id_composer, ...(payload.composerIds ?? [])]),
  ];

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

    await Composition.bulkCreate(
      composerIds.map((id_composer) => ({
        id_work: work.id_work,
        id_composer,
      })),
      { transaction }
    );

    if (payload.genreIds?.length) {
      await WorkGenre.bulkCreate(
        payload.genreIds.map((id_genre) => ({
          id_work: work.id_work,
          id_genre,
        })),
        { transaction }
      );
    }

    return getWorkById(work.id_work);
  });
}

export async function updateWork(id, payload, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);

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

    if (payload.composerIds) {
      await Composition.destroy({ where: { id_work: id }, transaction });
      await Composition.bulkCreate(
        payload.composerIds.map((id_composer) => ({ id_work: id, id_composer })),
        { transaction }
      );
    }

    if (payload.genreIds) {
      await WorkGenre.destroy({ where: { id_work: id }, transaction });
      await WorkGenre.bulkCreate(
        payload.genreIds.map((id_genre) => ({ id_work: id, id_genre })),
        { transaction }
      );
    }

    if (
      payload.score_pdf_url &&
      previousPdf &&
      previousPdf !== payload.score_pdf_url
    ) {
      await deleteScoreFile(previousPdf);
    }

    return getWorkById(id);
  });
}

export async function deleteWork(id, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const work = await Work.findByPk(id, { transaction });
    if (!work) throw new ApiError(404, 'Obra no encontrada');
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

export async function createInterpretation(payload, user) {
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
        id_director: payload.id_director ?? null,
        load_file_date: payload.load_file_date ?? new Date().toISOString().slice(0, 10),
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

export async function deleteInterpretation(id, user) {
  return sequelize.transaction(async (transaction) => {
    await setAuditUser(user.email, transaction);
    const interpretation = await Interpretation.findByPk(id, { transaction });
    if (!interpretation) throw new ApiError(404, 'Interpretación no encontrada');
    await interpretation.destroy({ transaction });
    return { deleted: true };
  });
}
