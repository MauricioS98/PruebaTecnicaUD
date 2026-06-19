import {
  Component,
  ElementRef,
  AfterViewInit,
  inject,
  signal,
  effect,
} from '@angular/core';
import { AuthMode, AuthService } from '../../../core/auth/auth.service';
import { BrandLogoComponent } from '../../../shared/brand-logo/brand-logo.component';
import { PROFILE_OPTIONS, ProfileType } from '../../../core/models/api.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [BrandLogoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  private readonly auth = inject(AuthService);
  private readonly host = inject(ElementRef);

  readonly mode = signal<AuthMode>('login');
  readonly selectedProfiles = signal<ProfileType[]>([]);
  readonly error = signal<string | null>(null);
  readonly profileOptions = PROFILE_OPTIONS;

  private googleReady = false;

  constructor() {
    effect(() => {
      this.mode();
      if (this.googleReady) {
        this.renderGoogleButton();
      }
    });
  }

  ngAfterViewInit(): void {
    this.googleReady = true;
    this.renderGoogleButton();
  }

  setMode(next: AuthMode): void {
    this.error.set(null);
    this.mode.set(next);
  }

  isProfileSelected(profileType: ProfileType): boolean {
    return this.selectedProfiles().includes(profileType);
  }

  toggleProfile(profileType: ProfileType): void {
    const current = this.selectedProfiles();
    this.selectedProfiles.set(
      current.includes(profileType)
        ? current.filter((p) => p !== profileType)
        : [...current, profileType]
    );
  }

  private renderGoogleButton(): void {
    const buttonHost = this.host.nativeElement.querySelector('#google-btn');
    if (buttonHost) {
      this.auth.initGoogleSignIn(buttonHost, this.mode(), {
        getProfileTypes: () => this.selectedProfiles(),
        onError: (message) => this.error.set(message),
      });
    }
  }
}
