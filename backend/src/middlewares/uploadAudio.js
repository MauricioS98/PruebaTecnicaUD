import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { AUDIO_DIR, ensureAudioDir, generateAudioFilename } from '../utils/audioFiles.js';

ensureAudioDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AUDIO_DIR),
  filename: (_req, _file, cb) => cb(null, generateAudioFilename()),
});

function mp3Filter(_req, file, cb) {
  const allowed = ['audio/mpeg', 'audio/mp3'];
  if (allowed.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.mp3')) {
    cb(null, true);
    return;
  }
  cb(new Error('Solo se permiten archivos MP3'));
}

export const uploadInterpretationAudio = multer({
  storage,
  fileFilter: mp3Filter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single('audioMp3');

export function handleAudioUploadError(err, _req, _res, next) {
  if (!err) {
    next();
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new ApiError(400, 'El MP3 no puede superar 50 MB'));
      return;
    }
    next(new ApiError(400, err.message));
    return;
  }

  if (err.message === 'Solo se permiten archivos MP3') {
    next(new ApiError(400, err.message));
    return;
  }

  next(err);
}

export function parseInterpretationPayload(req) {
  const artists = req.body.artists ? JSON.parse(req.body.artists) : [];

  return {
    id_work: Number(req.body.id_work),
    id_type_interpretation: req.body.id_type_interpretation
      ? Number(req.body.id_type_interpretation)
      : null,
    load_file_date: req.body.load_file_date,
    mode: req.body.mode,
    artists,
    audio_mp3_url: req.file ? `/uploads/audio/${req.file.filename}` : undefined,
  };
}
