import { Component, input, computed } from '@angular/core';

export type LogoSurface = 'dark' | 'light';
export type LogoSize = 'sm' | 'md' | 'lg';
export type LogoAlign = 'center' | 'start';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  template: `
    <img
      class="brand-logo"
      [class.brand-logo--sm]="size() === 'sm'"
      [class.brand-logo--md]="size() === 'md'"
      [class.brand-logo--lg]="size() === 'lg'"
      [src]="src()"
      alt="OrchestApp"
      decoding="async"
    />
  `,
  styles: `
    :host {
      display: inline-block;
      line-height: 0;
    }

    :host(.brand-logo-host--center) {
      display: block;
      width: fit-content;
      margin-inline: auto;
    }

    .brand-logo {
      display: block;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
    }

    .brand-logo--sm {
      width: 40px;
      height: 40px;
    }

    .brand-logo--md {
      width: 72px;
      height: 72px;
    }

    .brand-logo--lg {
      width: 120px;
      height: 120px;
    }
  `,
  host: {
    '[class.brand-logo-host--center]': 'align() === "center"',
  },
})
export class BrandLogoComponent {
  /** Fondo donde se coloca el logo: oscuro → logo blanco, claro → logo negro */
  readonly surface = input<LogoSurface>('dark');
  readonly size = input<LogoSize>('md');
  /** center: login y hero · start: sidebar y filas horizontales */
  readonly align = input<LogoAlign>('start');

  readonly src = computed(() =>
    this.surface() === 'dark'
      ? 'assets/logo-orchestapp-blanco.png'
      : 'assets/logo-orchestapp-negro.png'
  );
}
