import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ProfileOption, ProfileService, ProfileStatus } from '../../core/services/profile.service';
import { ProfileType } from '../../core/models/api.models';

declare const google: { accounts?: unknown } | undefined;

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

  @ViewChild('googleEmailBtn')
  set googleEmailBtnRef(ref: ElementRef<HTMLElement> | undefined) {
    if (ref && this.changingEmail()) {
      void this.renderGoogleEmailButton(ref.nativeElement);
    }
  }

  readonly status = signal<ProfileStatus | null>(null);
  readonly loading = signal(true);
  readonly activating = signal<ProfileType | null>(null);
  readonly deactivating = signal<ProfileType | null>(null);
  readonly savingProfile = signal<ProfileType | null>(null);
  readonly editingType = signal<ProfileType | null>(null);
  readonly editNicknameDraft = signal('');
  readonly editDescriptionDraft = signal('');
  readonly editingName = signal(false);
  readonly changingEmail = signal(false);
  readonly accountName = signal('');
  readonly savingName = signal(false);
  readonly verifyingEmail = signal(false);
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
        this.accountName.set(data.user.name);
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

  startEditProfile(item: ProfileOption): void {
    this.editingType.set(item.type);
    this.editNicknameDraft.set(item.nickname ?? '');
    this.editDescriptionDraft.set(item.profileDescription ?? '');
    this.error.set(null);
  }

  cancelEditProfile(): void {
    this.editingType.set(null);
    this.editNicknameDraft.set('');
    this.editDescriptionDraft.set('');
  }

  startEditName(): void {
    this.accountName.set(this.auth.currentUser()?.name ?? '');
    this.editingName.set(true);
    this.changingEmail.set(false);
    this.error.set(null);
  }

  cancelEditName(): void {
    this.accountName.set(this.auth.currentUser()?.name ?? '');
    this.editingName.set(false);
  }

  startChangeEmail(): void {
    this.changingEmail.set(true);
    this.editingName.set(false);
    this.error.set(null);
  }

  cancelChangeEmail(): void {
    this.changingEmail.set(false);
    this.verifyingEmail.set(false);
  }

  async saveName(): Promise<void> {
    const name = this.accountName().trim();
    if (!name) {
      this.error.set('El nombre es obligatorio.');
      return;
    }

    this.savingName.set(true);
    this.error.set(null);

    try {
      const data = await this.profileService.updateAccount({ name });
      this.applyStatus(data);
      this.editingName.set(false);
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo guardar el nombre.';
      this.error.set(message);
    } finally {
      this.savingName.set(false);
    }
  }

  private async renderGoogleEmailButton(buttonHost: HTMLElement): Promise<void> {
    if (!this.changingEmail()) {
      buttonHost.innerHTML = '';
      return;
    }

    const googleReady = await this.waitForGoogleScript();
    if (!googleReady) {
      this.error.set('No se pudo cargar Google. Recarga la página e inténtalo de nuevo.');
      return;
    }

    this.auth.initGoogleEmailChange(
      buttonHost,
      async (idToken) => {
        this.verifyingEmail.set(true);
        this.error.set(null);
        try {
          const data = await this.profileService.updateAccountEmail(idToken);
          this.applyStatus(data);
          this.changingEmail.set(false);
        } finally {
          this.verifyingEmail.set(false);
        }
      },
      {
        onError: (message) => this.error.set(message),
      }
    );
  }

  private waitForGoogleScript(maxAttempts = 50): Promise<boolean> {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        if (typeof google !== 'undefined') {
          resolve(true);
          return;
        }
        attempts += 1;
        if (attempts >= maxAttempts) {
          resolve(false);
          return;
        }
        setTimeout(check, 100);
      };
      check();
    });
  }

  private applyStatus(data: ProfileStatus): void {
    this.status.set(data);
    if (data.user) {
      this.auth.refreshUser(data.user);
      this.accountName.set(data.user.name);
    }
  }

  async saveProfile(type: ProfileType): Promise<void> {
    const nickname = this.editNicknameDraft().trim();
    if (!nickname) {
      this.error.set('El nombre artístico es obligatorio.');
      return;
    }

    this.savingProfile.set(type);
    this.error.set(null);

    try {
      const data = await this.profileService.updateProfile(type, {
        nickname,
        description: this.editDescriptionDraft(),
      });
      this.applyStatus(data);
      this.cancelEditProfile();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo guardar el perfil.';
      this.error.set(message);
    } finally {
      this.savingProfile.set(null);
    }
  }

  async activate(type: ProfileType): Promise<void> {
    this.activating.set(type);
    this.error.set(null);
    try {
      const data = await this.profileService.activate(type);
      this.applyStatus(data);
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
      this.applyStatus(data);
      if (this.editingType() === type) {
        this.cancelEditProfile();
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
