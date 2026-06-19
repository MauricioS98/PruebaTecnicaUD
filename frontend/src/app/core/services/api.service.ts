import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Interpretation, Work } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getWorks() {
    return this.http.get<{ success: boolean; data: Work[] }>(`${this.base}/works`);
  }

  getInterpretations(params?: { artistId?: number; directorId?: number; workId?: number }) {
    const query = new URLSearchParams();
    if (params?.artistId) query.set('artistId', String(params.artistId));
    if (params?.directorId) query.set('directorId', String(params.directorId));
    if (params?.workId) query.set('workId', String(params.workId));
    const qs = query.toString();
    return this.http.get<{ success: boolean; data: Interpretation[] }>(
      `${this.base}/interpretations${qs ? `?${qs}` : ''}`
    );
  }

  getCatalogs() {
    return this.http.get<{ success: boolean; data: Record<string, unknown[]> }>(`${this.base}/catalogs`);
  }

  getComposers() {
    return this.http.get<{ success: boolean; data: unknown[] }>(`${this.base}/composers`);
  }

  getDirectors() {
    return this.http.get<{ success: boolean; data: unknown[] }>(`${this.base}/directors`);
  }

  getArtists() {
    return this.http.get<{ success: boolean; data: unknown[] }>(`${this.base}/artists`);
  }
}
