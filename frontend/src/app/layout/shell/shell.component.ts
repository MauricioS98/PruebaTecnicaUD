import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';
import { AudioPlayerComponent } from '../../shared/audio-player/audio-player.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BrandLogoComponent,
    AudioPlayerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);
  readonly player = inject(AudioPlayerService);

  readonly navOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.closeNav());
  }

  toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }

  private readonly allNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '◈', requiresDashboard: true },
    { path: '/profile', label: 'Mi perfil', icon: '◉', requiresWrite: false },
    { path: '/works', label: 'Obras', icon: '♫', requiresWrite: false },
    { path: '/interpretations', label: 'Interpretaciones', icon: '◎', requiresWrite: false },
    { path: '/artists', label: 'Artistas', icon: '✦', requiresWrite: false },
    { path: '/directors', label: 'Directores', icon: '➤', requiresWrite: false },
  ];

  readonly navItems = computed(() =>
    this.allNavItems.filter((item) => {
      if (item.requiresDashboard) {
        return this.auth.canWrite() || this.auth.isAdmin();
      }
      return !item.requiresWrite || this.auth.canWrite();
    })
  );
}
