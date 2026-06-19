import * as catalogService from './catalog.service.js';
import { parseWorkPayload } from '../../middlewares/uploadScore.js';
import { parseInterpretationPayload } from '../../middlewares/uploadAudio.js';

export async function listWorks(_req, res, next) {
  try {
    const data = await catalogService.listWorks();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getWork(req, res, next) {
  try {
    const data = await catalogService.getWorkById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createWork(req, res, next) {
  try {
    const data = await catalogService.createWork(parseWorkPayload(req), req.user);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateWork(req, res, next) {
  try {
    const data = await catalogService.updateWork(req.params.id, parseWorkPayload(req), req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function deleteWork(req, res, next) {
  try {
    const data = await catalogService.deleteWork(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listComposers(_req, res, next) {
  try {
    const data = await catalogService.listComposers();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateComposer(req, res, next) {
  try {
    const data = await catalogService.updateComposer(req.params.id, req.body, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listDirectors(_req, res, next) {
  try {
    const data = await catalogService.listDirectors();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getDirector(req, res, next) {
  try {
    const data = await catalogService.getDirectorById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateDirector(req, res, next) {
  try {
    const data = await catalogService.updateDirector(req.params.id, req.body, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listArtists(_req, res, next) {
  try {
    const data = await catalogService.listArtists();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createArtist(req, res, next) {
  try {
    const data = await catalogService.createArtist(req.body, req.user);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getArtist(req, res, next) {
  try {
    const data = await catalogService.getArtistById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateArtist(req, res, next) {
  try {
    const data = await catalogService.updateArtist(req.params.id, req.body, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listCatalogs(_req, res, next) {
  try {
    const data = await catalogService.listCatalogs();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listInterpretations(req, res, next) {
  try {
    const data = await catalogService.listInterpretations({
      artistId: req.query.artistId,
      directorId: req.query.directorId,
      workId: req.query.workId,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createInterpretation(req, res, next) {
  try {
    const data = await catalogService.createInterpretation(
      parseInterpretationPayload(req),
      req.user
    );
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateInterpretation(req, res, next) {
  try {
    const data = await catalogService.updateInterpretation(
      req.params.id,
      parseInterpretationPayload(req),
      req.user
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function deleteInterpretation(req, res, next) {
  try {
    const data = await catalogService.deleteInterpretation(req.params.id, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
