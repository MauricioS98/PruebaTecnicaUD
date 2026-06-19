import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoadingOverlayService {
  private pending = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly visible = signal(false);

  private readonly showDelayMs = environment.loadingOverlayShowDelayMs ?? 0;
  private readonly minVisibleMs = environment.loadingOverlayMinVisibleMs ?? 450;

  private shownAt = 0;

  show(): void {
    this.pending += 1;
    this.clearHideTimer();

    if (this.visible() || this.showTimer) {
      return;
    }

    if (this.showDelayMs <= 0) {
      this.shownAt = Date.now();
      this.visible.set(true);
      return;
    }

    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      if (this.pending > 0) {
        this.shownAt = Date.now();
        this.visible.set(true);
      }
    }, this.showDelayMs);
  }

  hide(): void {
    this.pending = Math.max(0, this.pending - 1);

    if (this.pending > 0) {
      return;
    }

    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
      return;
    }

    if (!this.visible()) {
      return;
    }

    const elapsed = Date.now() - this.shownAt;
    const remaining = Math.max(0, this.minVisibleMs - elapsed);

    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      if (this.pending === 0) {
        this.visible.set(false);
      }
    }, remaining);
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
