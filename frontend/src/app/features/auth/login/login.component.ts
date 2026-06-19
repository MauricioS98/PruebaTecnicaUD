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
  readonly error = signal<string | null>(null);

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

  private renderGoogleButton(): void {
    const buttonHost = this.host.nativeElement.querySelector('#google-btn');
    if (buttonHost) {
      this.auth.initGoogleSignIn(buttonHost, this.mode(), {
        onError: (message) => this.error.set(message),
      });
    }
  }
}
