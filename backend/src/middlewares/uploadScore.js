import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import {
  SCORES_DIR,
  ensureScoresDir,
  generateScoreFilename,
} from '../utils/scoreFiles.js';

ensureScoresDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, SCORES_DIR);
  },
  filename: (_req, _file, cb) => {
    cb(null, generateScoreFilename());
  },
});

function pdfFilter(_req, file, cb) {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
    return;
  }
  cb(new Error('Solo se permiten archivos PDF'));
}

export const uploadScorePdf = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
}).single('scorePdf');

export function handleUploadError(err, _req, _res, next) {
  if (!err) {
    next();
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new ApiError(400, 'El PDF no puede superar 15 MB'));
      return;
    }
    next(new ApiError(400, err.message));
    return;
  }

  if (err.message === 'Solo se permiten archivos PDF') {
    next(new ApiError(400, err.message));
    return;
  }

  next(err);
}

export function parseWorkPayload(req) {
  const composerIds = req.body.composerIds
    ? JSON.parse(req.body.composerIds)
    : [];
  const genreIds = req.body.genreIds ? JSON.parse(req.body.genreIds) : [];

  return {
    name: req.body.name,
    description: req.body.description,
    write_date: req.body.write_date,
    mode: req.body.mode,
    composerIds,
    genreIds,
    score_pdf_url: req.file ? `/uploads/scores/${req.file.filename}` : undefined,
  };
}
