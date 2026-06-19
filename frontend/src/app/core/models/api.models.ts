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

export interface Work {
  id_work: number;
  name: string;
  description: string;
  write_date: string;
  composers?: { id_composer: number; nickname: string }[];
  genres?: { id_genre: number; name: string }[];
}

export interface Interpretation {
  id_interpretation: number;
  id_work: number;
  id_director?: number | null;
  id_type_interpretation?: number | null;
  load_file_date: string;
  work?: { id_work: number; name: string };
  director?: { id_director: number; nickname: string };
  type_interpretation?: { name: string; min_artist: number; max_artist: number };
  interpretation_artists?: Array<{
    id_artist: number;
    artist?: { nickname: string };
    instrument?: { name: string };
  }>;
}
