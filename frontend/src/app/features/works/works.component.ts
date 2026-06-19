import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Composer, Genre, Work } from '../../core/models/api.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-works',
  standalone: true,
  templateUrl: './works.component.html',
  styleUrl: './works.component.scss',
})
export class WorksComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly works = signal<Work[]>([]);
  readonly composers = signal<Composer[]>([]);
  readonly genres = signal<Genre[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');

  readonly showForm = signal(false);
  readonly editingWork = signal<Work | null>(null);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly formError = signal<string | null>(null);

  readonly formName = signal('');
  readonly formDescription = signal('');
  readonly formDate = signal('');
  readonly selectedComposerIds = signal<number[]>([]);
  readonly selectedGenreIds = signal<number[]>([]);
  readonly selectedScoreFile = signal<File | null>(null);
  readonly selectedScoreName = signal<string | null>(null);
  readonly existingScoreUrl = signal<string | null>(null);

  readonly filteredWorks = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.works();

    return this.works().filter((work) => {
      const composers = work.composers?.map((c) => c.nickname).join(' ') ?? '';
      const genres = work.genres?.map((g) => g.name).join(' ') ?? '';
      return (
        work.name.toLowerCase().includes(term) ||
        work.description.toLowerCase().includes(term) ||
        composers.toLowerCase().includes(term) ||
        genres.toLowerCase().includes(term)
      );
    });
  });

  readonly myComposerId = computed(() => this.auth.composerProfileId());
  readonly isEditing = computed(() => !!this.editingWork());

  async ngOnInit(): Promise<void> {
    await this.loadWorks();
  }

  scoreUrl(work: Work): string | null {
    if (!work.score_pdf_url) return null;
    return `${environment.filesUrl}${work.score_pdf_url}`;
  }

  isOwnWork(work: Work): boolean {
    const myId = this.myComposerId();
    if (!myId) return false;
    return work.composers?.some((c) => c.id_composer === myId) ?? false;
  }

  canDeleteWork(work: Work): boolean {
    return this.isOwnWork(work) && (work.interpretation_count ?? 0) === 0;
  }

  async loadWorks(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.api.getWorks());
      this.works.set(result.data ?? []);
    } catch {
      this.error.set('No se pudo cargar el catálogo de obras.');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  private async loadFormCatalogs(): Promise<void> {
    const [composersRes, catalogsRes] = await Promise.all([
      firstValueFrom(this.api.getComposers()),
      firstValueFrom(this.api.getCatalogs()),
    ]);
    this.composers.set(composersRes.data ?? []);
    this.genres.set(catalogsRes.data?.genres ?? []);
  }

  async openForm(): Promise<void> {
    this.formError.set(null);
    this.editingWork.set(null);
    this.formName.set('');
    this.formDescription.set('');
    this.formDate.set(new Date().toISOString().slice(0, 10));
    this.selectedScoreFile.set(null);
    this.selectedScoreName.set(null);
    this.existingScoreUrl.set(null);

    const myId = this.myComposerId();
    this.selectedComposerIds.set(myId ? [myId] : []);
    this.selectedGenreIds.set([]);

    try {
      await this.loadFormCatalogs();
      this.showForm.set(true);
    } catch {
      this.error.set('No se pudieron cargar compositores y géneros.');
    }
  }

  async openEditForm(work: Work): Promise<void> {
    if (!this.isOwnWork(work)) return;

    this.formError.set(null);
    this.editingWork.set(work);
    this.formName.set(work.name);
    this.formDescription.set(work.description ?? '');
    this.formDate.set(work.write_date);
    this.selectedScoreFile.set(null);
    this.selectedScoreName.set(null);
    this.existingScoreUrl.set(this.scoreUrl(work));
    this.selectedComposerIds.set(work.composers?.map((c) => c.id_composer) ?? []);
    this.selectedGenreIds.set(work.genres?.map((g) => g.id_genre) ?? []);

    try {
      await this.loadFormCatalogs();
      this.showForm.set(true);
    } catch {
      this.error.set('No se pudieron cargar compositores y géneros.');
    }
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingWork.set(null);
    this.formError.set(null);
    this.selectedScoreFile.set(null);
    this.selectedScoreName.set(null);
    this.existingScoreUrl.set(null);
  }

  onScoreSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && file.type !== 'application/pdf') {
      this.formError.set('Solo se permiten archivos PDF.');
      input.value = '';
      this.selectedScoreFile.set(null);
      this.selectedScoreName.set(null);
      return;
    }

    this.formError.set(null);
    this.selectedScoreFile.set(file);
    this.selectedScoreName.set(file?.name ?? null);
  }

  isComposerSelected(id: number): boolean {
    return this.selectedComposerIds().includes(id);
  }

  isGenreSelected(id: number): boolean {
    return this.selectedGenreIds().includes(id);
  }

  toggleComposer(id: number): void {
    const myId = this.myComposerId();
    if (id === myId) return;

    const current = this.selectedComposerIds();
    this.selectedComposerIds.set(
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  toggleGenre(id: number): void {
    const current = this.selectedGenreIds();
    this.selectedGenreIds.set(
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    formData.append('name', this.formName().trim());
    formData.append('description', this.formDescription().trim());
    formData.append('write_date', this.formDate().trim());
    formData.append('composerIds', JSON.stringify(this.selectedComposerIds()));
    formData.append('genreIds', JSON.stringify(this.selectedGenreIds()));

    const scoreFile = this.selectedScoreFile();
    if (scoreFile) {
      formData.append('scorePdf', scoreFile);
    }

    return formData;
  }

  async submitWork(): Promise<void> {
    const name = this.formName().trim();
    const write_date = this.formDate().trim();

    if (!name || !write_date) {
      this.formError.set('Nombre y fecha de composición son obligatorios.');
      return;
    }

    const myId = this.myComposerId();
    if (!myId) {
      this.formError.set('Se requiere el perfil de Compositor.');
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    const formData = this.buildFormData();
    const editing = this.editingWork();

    try {
      if (editing) {
        await firstValueFrom(this.api.updateWork(editing.id_work, formData));
      } else {
        await firstValueFrom(this.api.createWork(formData));
      }
      this.closeForm();
      await this.loadWorks();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        (editing ? 'No se pudo actualizar la obra' : 'No se pudo registrar la obra');
      this.formError.set(message);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteWork(work: Work): Promise<void> {
    if (!this.canDeleteWork(work)) return;

    const confirmed = confirm(`¿Eliminar la obra "${work.name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    this.deletingId.set(work.id_work);
    this.error.set(null);

    try {
      await firstValueFrom(this.api.deleteWork(work.id_work));
      await this.loadWorks();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo eliminar la obra';
      this.error.set(message);
    } finally {
      this.deletingId.set(null);
    }
  }
}
