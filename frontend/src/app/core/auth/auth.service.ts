import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser } from '../models/api.models';

export type AuthMode = 'login' | 'register';

interface GoogleSignInOptions {
  onError?: (message: string) => void;
}

declare const google: {
  accounts: {
    id: {
      initialize: (config: Record<string, unknown>) => void;
      renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
    };
  };
};

const TOKEN_KEY = 'orchestapp_token';
const USER_KEY = 'orchestapp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<AuthUser | null>(this.readUser());

  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly currentUser = computed(() => this.userSignal());
  readonly token = computed(() => this.tokenSignal());
  readonly isOyente = computed(() => this.userSignal()?.isOyente ?? true);
  readonly canWrite = computed(() => (this.userSignal()?.profiles?.length ?? 0) > 0);
  readonly isComposer = computed(() =>
    this.userSignal()?.profiles?.some((p) => p.type === 'composer') ?? false
  );
  readonly isAdmin = computed(() => this.userSignal()?.isAdmin ?? false);
  readonly composerProfileId = computed(
    () => this.userSignal()?.profiles?.find((p) => p.type === 'composer')?.id ?? null
  );
  readonly isDirector = computed(() =>
    this.userSignal()?.profiles?.some((p) => p.type === 'director') ?? false
  );
  readonly directorProfileId = computed(
    () => this.userSignal()?.profiles?.find((p) => p.type === 'director')?.id ?? null
  );

  getHomePath(): string {
    return this.canWrite() || this.isAdmin() ? '/dashboard' : '/works';
  }

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  initGoogleSignIn(
    buttonHost: HTMLElement,
    mode: AuthMode,
    options: GoogleSignInOptions = {}
  ): void {
    if (typeof google === 'undefined') return;

    buttonHost.innerHTML = '';

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: async (response: { credential: string }) => {
        try {
          if (mode === 'register') {
            await this.handleGoogleRegister(response.credential);
          } else {
            await this.handleGoogleLogin(response.credential);
          }
        } catch (err: unknown) {
          const message =
            (err as { error?: { message?: string } })?.error?.message ??
            'No se pudo completar la operación con Google';
          options.onError?.(message);
        }
      },
      auto_select: false,
    });

    google.accounts.id.renderButton(buttonHost, {
      type: 'standard',
      theme: 'filled_black',
      size: 'large',
      text: mode === 'register' ? 'signup_with' : 'signin_with',
      shape: 'pill',
      width: 280,
    });
  }

  private async handleGoogleLogin(idToken: string): Promise<void> {
    const result = await firstValueFrom(
      this.http.post<{ success: boolean; data: AuthResponse }>(
        `${environment.apiUrl}/auth/google`,
        { idToken }
      )
    );
    await this.completeAuth(result.data);
  }

  private async handleGoogleRegister(idToken: string): Promise<void> {
    const result = await firstValueFrom(
      this.http.post<{ success: boolean; data: AuthResponse }>(
        `${environment.apiUrl}/auth/google/register`,
        { idToken }
      )
    );
    await this.completeAuth(result.data);
  }

  async fetchMe(): Promise<AuthUser> {
    const result = await firstValueFrom(
      this.http.get<{ success: boolean; data: AuthUser }>(`${environment.apiUrl}/auth/me`)
    );
    this.refreshUser(result.data);
    return result.data;
  }

  refreshUser(user: AuthUser): void {
    this.userSignal.set(user);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  private async completeAuth(data: AuthResponse): Promise<void> {
    this.persistSession(data);
    await this.router.navigateByUrl(this.getHomePath());
  }

  private persistSession(data: AuthResponse): void {
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    this.tokenSignal.set(data.token);
    this.userSignal.set(data.user);
  }

  private readToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  private readUser(): AuthUser | null {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
