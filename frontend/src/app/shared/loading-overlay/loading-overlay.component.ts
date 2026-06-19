import { Component, inject } from '@angular/core';
import { LoadingOverlayService } from '../../core/services/loading-overlay.service';
import { LogoWaterFillComponent } from '../logo-water-fill/logo-water-fill.component';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [LogoWaterFillComponent],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss',
})
export class LoadingOverlayComponent {
  readonly loading = inject(LoadingOverlayService);
}
