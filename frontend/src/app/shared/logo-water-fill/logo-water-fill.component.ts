import { Component, input } from '@angular/core';

export type LogoWaterFillSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-logo-water-fill',
  standalone: true,
  template: `
    <div
      class="logo-water-fill"
      [class.logo-water-fill--sm]="size() === 'sm'"
      [class.logo-water-fill--md]="size() === 'md'"
      [class.logo-water-fill--lg]="size() === 'lg'"
      role="img"
      aria-label="OrchestApp cargando"
    >
      <img
        class="logo-water-fill__base"
        src="assets/logo-orchestapp-negro.png"
        alt=""
        aria-hidden="true"
        decoding="async"
      />
      <div class="logo-water-fill__fill-layer">
        <img
          class="logo-water-fill__fill"
          src="assets/logo-orchestapp-negro.png"
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <div class="logo-water-fill__surface" aria-hidden="true"></div>
      </div>
    </div>
  `,
  styleUrl: './logo-water-fill.component.scss',
})
export class LogoWaterFillComponent {
  readonly size = input<LogoWaterFillSize>('lg');
}
