import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './shared/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingOverlayComponent],
  template: `
    <router-outlet />
    <app-loading-overlay />
  `,
  styles: ':host { display: block; min-height: 100vh; }',
})
export class AppComponent {}
