export type ProfileType = 'composer' | 'director' | 'artist';

export interface UserProfile {
  type: ProfileType;
  id: number;
  label: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  profiles: UserProfile[];
  isOyente: boolean;
  isViewer?: boolean;
  profileLabel: string;
  picture?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Composer {
  id_composer: number;
  nickname: string;
  description?: string;
  id_user?: number | null;
}

export interface Director {
  id_director: number;
  nickname: string;
  description?: string;
  id_user?: number | null;
}

export interface Artist {
  id_artist: number;
  nickname: string;
  description?: string;
  id_user?: number | null;
}

export interface Genre {
  id_genre: number;
  name: string;
  description?: string;
}

export interface CreateWorkPayload {
  name: string;
  description?: string;
  write_date: string;
  composerIds: number[];
  genreIds?: number[];
  scorePdf?: File | null;
}

export interface CatalogData {
  genres: Genre[];
  types: TypeInterpretation[];
  instruments: CatalogInstrument[];
  typeInstruments: { id_type_instrument: number; name: string }[];
}

export interface TypeInterpretation {
  id_type_interpretation: number;
  name: string;
  min_artist: number;
  max_artist: number;
}

export interface CatalogInstrument {
  id_instrument: number;
  name: string;
  id_type_instrument: number;
}

export interface Work {
  id_work: number;
  name: string;
  description: string;
  write_date: string;
  score_pdf_url?: string | null;
  interpretation_count?: number;
  composers?: Composer[];
  genres?: { id_genre: number; name: string }[];
}

export interface InterpretationArtistRow {
  id_artist: number;
  id_instrument?: number | null;
  artist?: { id_artist: number; nickname: string };
  instrument?: { id_instrument: number; name: string } | null;
}

export interface Interpretation {
  id_interpretation: number;
  id_work: number;
  id_director?: number | null;
  id_type_interpretation?: number | null;
  load_file_date: string;
  audio_mp3_url?: string | null;
  work?: { id_work: number; name: string };
  director?: { id_director: number; nickname: string } | null;
  type_interpretation?: {
    id_type_interpretation?: number;
    name: string;
    min_artist: number;
    max_artist: number;
  } | null;
  interpretation_artists?: InterpretationArtistRow[];
}
