import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Artist,
  AdminInstrumentsCatalog,
  CatalogData,
  CatalogInstrument,
  Composer,
  AdminUser,
  DashboardData,
  Director,
  Interpretation,
  TypeInstrument,
  Work,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getWorks() {
    return this.http.get<{ success: boolean; data: Work[] }>(`${this.base}/works`);
  }

  getDashboard() {
    return this.http.get<{ success: boolean; data: DashboardData }>(`${this.base}/dashboard`);
  }

  getAdminUsers() {
    return this.http.get<{ success: boolean; data: AdminUser[] }>(`${this.base}/admin/users`);
  }

  setUserAdminStatus(userId: number, isAdmin: boolean) {
    return this.http.patch<{ success: boolean; data: AdminUser }>(
      `${this.base}/admin/users/${userId}`,
      { isAdmin }
    );
  }

  getAdminInstrumentsCatalog() {
    return this.http.get<{ success: boolean; data: AdminInstrumentsCatalog }>(
      `${this.base}/admin/instruments-catalog`
    );
  }

  createTypeInstrument(payload: { name: string; description?: string }) {
    return this.http.post<{ success: boolean; data: TypeInstrument }>(
      `${this.base}/admin/type-instruments`,
      payload
    );
  }

  updateTypeInstrument(id: number, payload: { name?: string; description?: string }) {
    return this.http.put<{ success: boolean; data: TypeInstrument }>(
      `${this.base}/admin/type-instruments/${id}`,
      payload
    );
  }

  deleteTypeInstrument(id: number) {
    return this.http.delete<{ success: boolean; data: { deleted: boolean } }>(
      `${this.base}/admin/type-instruments/${id}`
    );
  }

  createInstrument(payload: { name: string; description?: string; id_type_instrument: number }) {
    return this.http.post<{ success: boolean; data: CatalogInstrument }>(
      `${this.base}/admin/instruments`,
      payload
    );
  }

  updateInstrument(
    id: number,
    payload: { name?: string; description?: string; id_type_instrument?: number }
  ) {
    return this.http.put<{ success: boolean; data: CatalogInstrument }>(
      `${this.base}/admin/instruments/${id}`,
      payload
    );
  }

  deleteInstrument(id: number) {
    return this.http.delete<{ success: boolean; data: { deleted: boolean } }>(
      `${this.base}/admin/instruments/${id}`
    );
  }

  createWork(formData: FormData) {
    return this.http.post<{ success: boolean; data: Work }>(`${this.base}/works`, formData);
  }

  createInterpretation(formData: FormData) {
    return this.http.post<{ success: boolean; data: Interpretation }>(
      `${this.base}/interpretations`,
      formData
    );
  }

  updateInterpretation(id: number, formData: FormData) {
    return this.http.put<{ success: boolean; data: Interpretation }>(
      `${this.base}/interpretations/${id}`,
      formData
    );
  }

  deleteInterpretation(id: number) {
    return this.http.delete<{ success: boolean; data: { deleted: boolean } }>(
      `${this.base}/interpretations/${id}`
    );
  }

  updateWork(id: number, formData: FormData) {
    return this.http.put<{ success: boolean; data: Work }>(`${this.base}/works/${id}`, formData);
  }

  deleteWork(id: number) {
    return this.http.delete<{ success: boolean; data: { deleted: boolean } }>(
      `${this.base}/works/${id}`
    );
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
    return this.http.get<{ success: boolean; data: CatalogData }>(`${this.base}/catalogs`);
  }

  getComposers() {
    return this.http.get<{ success: boolean; data: Composer[] }>(`${this.base}/composers`);
  }

  getDirectors() {
    return this.http.get<{ success: boolean; data: Director[] }>(`${this.base}/directors`);
  }

  getDirector(id: number) {
    return this.http.get<{ success: boolean; data: Director }>(`${this.base}/directors/${id}`);
  }

  getArtists() {
    return this.http.get<{ success: boolean; data: Artist[] }>(`${this.base}/artists`);
  }

  createArtist(payload: { nickname: string; description?: string }) {
    return this.http.post<{ success: boolean; data: Artist }>(`${this.base}/artists`, payload);
  }

  getArtist(id: number) {
    return this.http.get<{ success: boolean; data: Artist }>(`${this.base}/artists/${id}`);
  }
}
