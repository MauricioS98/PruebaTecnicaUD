import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { CatalogInstrument, TypeInstrument } from '../../core/models/api.models';

type FormMode = 'type' | 'instrument';

@Component({
  selector: 'app-admin-instruments',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-instruments.component.html',
  styleUrl: './admin-instruments.component.scss',
})
export class AdminInstrumentsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly typeInstruments = signal<TypeInstrument[]>([]);
  readonly instruments = signal<CatalogInstrument[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingTypeId = signal<number | null>(null);
  readonly deletingInstrumentId = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);

  readonly showForm = signal(false);
  readonly formMode = signal<FormMode>('type');
  readonly editingType = signal<TypeInstrument | null>(null);
  readonly editingInstrument = signal<CatalogInstrument | null>(null);

  readonly formName = signal('');
  readonly formDescription = signal('');
  readonly formTypeId = signal<number | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadCatalog();
  }

  async loadCatalog(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.api.getAdminInstrumentsCatalog());
      this.typeInstruments.set(result.data?.typeInstruments ?? []);
      this.instruments.set(result.data?.instruments ?? []);
    } catch {
      this.error.set('No se pudo cargar el catálogo de instrumentos.');
    } finally {
      this.loading.set(false);
    }
  }

  openTypeForm(type: TypeInstrument | null = null): void {
    this.formMode.set('type');
    this.editingType.set(type);
    this.editingInstrument.set(null);
    this.formName.set(type?.name ?? '');
    this.formDescription.set(type?.description ?? '');
    this.formTypeId.set(null);
    this.formError.set(null);
    this.showForm.set(true);
  }

  openInstrumentForm(instrument: CatalogInstrument | null = null): void {
    this.formMode.set('instrument');
    this.editingInstrument.set(instrument);
    this.editingType.set(null);
    this.formName.set(instrument?.name ?? '');
    this.formDescription.set(instrument?.description ?? '');
    this.formTypeId.set(
      instrument?.id_type_instrument ?? this.typeInstruments()[0]?.id_type_instrument ?? null
    );
    this.formError.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.formError.set(null);
  }

  async submitForm(): Promise<void> {
    const name = this.formName().trim();
    if (!name) {
      this.formError.set('El nombre es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    const description = this.formDescription().trim();
    const mode = this.formMode();

    try {
      if (mode === 'type') {
        const editing = this.editingType();
        if (editing) {
          await firstValueFrom(this.api.updateTypeInstrument(editing.id_type_instrument, { name, description }));
        } else {
          await firstValueFrom(this.api.createTypeInstrument({ name, description }));
        }
      } else {
        const typeId = this.formTypeId();
        if (!typeId) {
          this.formError.set('Debes seleccionar un tipo.');
          this.saving.set(false);
          return;
        }
        const editing = this.editingInstrument();
        if (editing) {
          await firstValueFrom(
            this.api.updateInstrument(editing.id_instrument, {
              name,
              description,
              id_type_instrument: typeId,
            })
          );
        } else {
          await firstValueFrom(
            this.api.createInstrument({ name, description, id_type_instrument: typeId })
          );
        }
      }

      this.closeForm();
      await this.loadCatalog();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo guardar el registro.';
      this.formError.set(message);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteType(type: TypeInstrument): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Eliminar tipo',
      message: `¿Eliminar el tipo "${type.name}"?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmed) return;

    this.deletingTypeId.set(type.id_type_instrument);
    this.error.set(null);

    try {
      await firstValueFrom(this.api.deleteTypeInstrument(type.id_type_instrument));
      await this.loadCatalog();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo eliminar el tipo.';
      this.error.set(message);
    } finally {
      this.deletingTypeId.set(null);
    }
  }

  async deleteInstrument(instrument: CatalogInstrument): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Eliminar instrumento',
      message: `¿Eliminar el instrumento "${instrument.name}"?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmed) return;

    this.deletingInstrumentId.set(instrument.id_instrument);
    this.error.set(null);

    try {
      await firstValueFrom(this.api.deleteInstrument(instrument.id_instrument));
      await this.loadCatalog();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo eliminar el instrumento.';
      this.error.set(message);
    } finally {
      this.deletingInstrumentId.set(null);
    }
  }

  typeName(typeId: number): string {
    return this.typeInstruments().find((t) => t.id_type_instrument === typeId)?.name ?? '—';
  }
}
