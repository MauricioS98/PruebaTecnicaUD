import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BrandLogoComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly auth = inject(AuthService);

  readonly navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '◈' },
    { path: '/profile', label: 'Mi perfil', icon: '◉' },
    { path: '/works', label: 'Obras', icon: '♫' },
    { path: '/interpretations', label: 'Interpretaciones', icon: '◎' },
    { path: '/artists', label: 'Artistas', icon: '✦' },
    { path: '/directors', label: 'Directores', icon: '➤' },
  ];
}
