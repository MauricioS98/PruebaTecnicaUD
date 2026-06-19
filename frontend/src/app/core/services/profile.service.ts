import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, ProfileType } from '../models/api.models';

export interface ProfileOption {
  type: ProfileType;
  label: string;
  description: string;
  nickname?: string;
  profileDescription?: string;
  id?: number;
  canDeactivate?: boolean;
  deactivateBlockedReason?: string | null;
  usageCount?: number;
}

export interface ProfileStatus {
  user: AuthUser;
  baseRole: 'oyente';
  activeProfiles: ProfileOption[];
  availableProfiles: ProfileOption[];
  profiles: AuthUser['profiles'];
  isOyente: boolean;
  profileLabel: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/profile`;

  getStatus() {
    return firstValueFrom(
      this.http.get<{ success: boolean; data: ProfileStatus }>(this.base)
    ).then((r) => r.data);
  }

  activate(type: ProfileType) {
    return firstValueFrom(
      this.http.post<{ success: boolean; data: ProfileStatus }>(`${this.base}/${type}`, {})
    ).then((r) => r.data);
  }

  deactivate(type: ProfileType) {
    return firstValueFrom(
      this.http.delete<{ success: boolean; data: ProfileStatus }>(`${this.base}/${type}`)
    ).then((r) => r.data);
  }

  updateProfile(type: ProfileType, payload: { nickname: string; description: string }) {
    return firstValueFrom(
      this.http.patch<{ success: boolean; data: ProfileStatus }>(`${this.base}/${type}`, payload)
    ).then((r) => r.data);
  }

  updateAccount(payload: { name: string }) {
    return firstValueFrom(
      this.http.patch<{ success: boolean; data: ProfileStatus }>(`${this.base}/account`, payload)
    ).then((r) => r.data);
  }

  updateAccountEmail(idToken: string) {
    return firstValueFrom(
      this.http.patch<{ success: boolean; data: ProfileStatus }>(`${this.base}/account/email`, {
        idToken,
      })
    ).then((r) => r.data);
  }
}
