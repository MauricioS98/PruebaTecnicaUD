import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileService, ProfileStatus } from '../../core/services/profile.service';
import { ProfileType } from '../../core/models/api.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  readonly auth = inject(AuthService);

  readonly status = signal<ProfileStatus | null>(null);
  readonly loading = signal(true);
  readonly activating = signal<ProfileType | null>(null);
  readonly deactivating = signal<ProfileType | null>(null);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadStatus();
  }

  async loadStatus(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.profileService.getStatus();
      this.status.set(data);
      if (data.user) {
        this.auth.refreshUser(data.user);
      }
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo cargar el perfil';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  async activate(type: ProfileType): Promise<void> {
    this.activating.set(type);
    this.error.set(null);
    try {
      const data = await this.profileService.activate(type);
      this.status.set(data);
      if (data.user) {
        this.auth.refreshUser(data.user);
      }
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo activar el perfil';
      this.error.set(message);
    } finally {
      this.activating.set(null);
    }
  }

  async deactivate(type: ProfileType): Promise<void> {
    this.deactivating.set(type);
    this.error.set(null);
    try {
      const data = await this.profileService.deactivate(type);
      this.status.set(data);
      if (data.user) {
        this.auth.refreshUser(data.user);
      }
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo desactivar el perfil';
      this.error.set(message);
    } finally {
      this.deactivating.set(null);
    }
  }
}
