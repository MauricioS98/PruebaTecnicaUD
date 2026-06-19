import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileOption, ProfileService, ProfileStatus } from '../../core/services/profile.service';
import { ProfileType } from '../../core/models/api.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
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
  readonly savingDescription = signal<ProfileType | null>(null);
  readonly editingType = signal<ProfileType | null>(null);
  readonly editDraft = signal('');
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

  startEditDescription(item: ProfileOption): void {
    this.editingType.set(item.type);
    this.editDraft.set(item.profileDescription ?? '');
    this.error.set(null);
  }

  cancelEditDescription(): void {
    this.editingType.set(null);
    this.editDraft.set('');
  }

  async saveDescription(type: ProfileType): Promise<void> {
    this.savingDescription.set(type);
    this.error.set(null);

    try {
      const data = await this.profileService.updateDescription(type, this.editDraft());
      this.status.set(data);
      if (data.user) {
        this.auth.refreshUser(data.user);
      }
      this.editingType.set(null);
      this.editDraft.set('');
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo guardar la descripción.';
      this.error.set(message);
    } finally {
      this.savingDescription.set(null);
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
      if (this.editingType() === type) {
        this.cancelEditDescription();
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
