import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<ConfirmDialogState | null>(null);

  private resolver: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmDialogOptions | string): Promise<boolean> {
    const opts: ConfirmDialogOptions =
      typeof options === 'string' ? { message: options } : options;

    return new Promise((resolve) => {
      this.resolver = resolve;
      this.state.set({
        title: opts.title ?? 'Confirmar',
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? 'Aceptar',
        cancelLabel: opts.cancelLabel ?? 'Cancelar',
        danger: opts.danger ?? false,
      });
    });
  }

  accept(): void {
    this.close(true);
  }

  cancel(): void {
    this.close(false);
  }

  private close(result: boolean): void {
    this.state.set(null);
    this.resolver?.(result);
    this.resolver = null;
  }
}
