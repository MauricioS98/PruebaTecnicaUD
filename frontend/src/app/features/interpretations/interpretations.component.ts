import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import {
  AudioPlayerService,
  PlaybackTrack,
} from '../../core/services/audio-player.service';
import {
  Artist,
  CatalogInstrument,
  Interpretation,
  TypeInterpretation,
  Work,
} from '../../core/models/api.models';
import { environment } from '../../../environments/environment';

type InterpretationFilter = 'all' | 'recent' | 'legacy';

interface ArtistFormRow {
  id_artist: number;
  id_instrument: number | null;
}

@Component({
  selector: 'app-interpretations',
  standalone: true,
  templateUrl: './interpretations.component.html',
  styleUrl: './interpretations.component.scss',
})
export class InterpretationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly player = inject(AudioPlayerService);

  readonly interpretations = signal<Interpretation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly filter = signal<InterpretationFilter>('all');
  readonly selectedIds = signal<number[]>([]);

  readonly showForm = signal(false);
  readonly editingInterpretation = signal<Interpretation | null>(null);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly formError = signal<string | null>(null);
  readonly works = signal<Work[]>([]);
  readonly types = signal<TypeInterpretation[]>([]);
  readonly artists = signal<Artist[]>([]);
  readonly instruments = signal<CatalogInstrument[]>([]);

  readonly formWorkId = signal<number | null>(null);
  readonly formTypeId = signal<number | null>(null);
  readonly artistRows = signal<ArtistFormRow[]>([]);
  readonly audioFile = signal<File | null>(null);
  readonly audioFileName = signal<string | null>(null);
  readonly existingAudioUrl = signal<string | null>(null);

  readonly myDirectorId = computed(() => this.auth.directorProfileId());
  readonly isEditing = computed(() => !!this.editingInterpretation());
  readonly loadFileDateLabel = computed(() => {
    const iso = this.isEditing()
      ? (this.editingInterpretation()?.load_file_date ?? this.todayDate())
      : this.todayDate();
    return this.formatDateLabel(iso);
  });

  readonly filteredInterpretations = computed(() => {
    const term = this.search().trim().toLowerCase();
    const mode = this.filter();

    return this.interpretations().filter((item) => {
      const isLegacy = !item.id_type_interpretation;
      if (mode === 'recent' && isLegacy) return false;
      if (mode === 'legacy' && !isLegacy) return false;

      if (!term) return true;

      const artistsText =
        item.interpretation_artists
          ?.map((row) => `${row.artist?.nickname ?? ''} ${row.instrument?.name ?? ''}`)
          .join(' ') ?? '';

      return (
        item.work?.name?.toLowerCase().includes(term) ||
        item.director?.nickname?.toLowerCase().includes(term) ||
        item.type_interpretation?.name?.toLowerCase().includes(term) ||
        artistsText.toLowerCase().includes(term)
      );
    });
  });

  readonly selectedType = computed(() => {
    const id = this.formTypeId();
    return this.types().find((t) => t.id_type_interpretation === id) ?? null;
  });

  readonly selectedPlayableCount = computed(() =>
    this.selectedIds().filter((id) => {
      const item = this.interpretations().find((i) => i.id_interpretation === id);
      return item && this.hasAudio(item);
    }).length
  );

  async ngOnInit(): Promise<void> {
    await this.loadInterpretations();
  }

  hasAudio(item: Interpretation): boolean {
    return !!item.audio_mp3_url;
  }

  audioUrl(item: Interpretation): string {
    return `${environment.filesUrl}${item.audio_mp3_url}`;
  }

  toTrack(item: Interpretation): PlaybackTrack | null {
    if (!this.hasAudio(item)) return null;
    return {
      id: item.id_interpretation,
      title: item.work?.name ?? 'Obra desconocida',
      subtitle: item.director?.nickname ?? 'Director',
      url: this.audioUrl(item),
    };
  }

  isLegacy(item: Interpretation): boolean {
    return !item.id_type_interpretation;
  }

  isOwnInterpretation(item: Interpretation): boolean {
    const myId = this.myDirectorId();
    if (!myId) return false;
    return item.id_director === myId || item.director?.id_director === myId;
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  isPlayingItem(item: Interpretation): boolean {
    return this.player.isCurrentTrack(item.id_interpretation) && this.player.isPlaying();
  }

  toggleSelect(id: number): void {
    const current = this.selectedIds();
    this.selectedIds.set(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  playItem(item: Interpretation): void {
    if (this.player.isCurrentTrack(item.id_interpretation)) {
      this.player.togglePlay();
      return;
    }

    const track = this.toTrack(item);
    if (!track) return;

    const selected = this.selectedIds();
    if (selected.length > 1 && selected.includes(item.id_interpretation)) {
      const tracks = this.interpretations()
        .filter((i) => selected.includes(i.id_interpretation))
        .map((i) => this.toTrack(i))
        .filter((t): t is PlaybackTrack => !!t);
      const startIndex = tracks.findIndex((t) => t.id === item.id_interpretation);
      this.player.playTracks(tracks, Math.max(startIndex, 0));
      return;
    }

    this.player.playSingle(track);
  }

  playSelected(): void {
    const tracks = this.interpretations()
      .filter((i) => this.selectedIds().includes(i.id_interpretation))
      .map((i) => this.toTrack(i))
      .filter((t): t is PlaybackTrack => !!t);

    if (tracks.length) {
      this.player.playTracks(tracks, 0);
    }
  }

  async loadInterpretations(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.api.getInterpretations());
      this.interpretations.set(result.data ?? []);
    } catch {
      this.error.set('No se pudo cargar las interpretaciones.');
    } finally {
      this.loading.set(false);
    }
  }

  setFilter(next: InterpretationFilter): void {
    this.filter.set(next);
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  async openForm(): Promise<void> {
    this.formError.set(null);
    this.editingInterpretation.set(null);
    this.formWorkId.set(null);
    this.formTypeId.set(null);
    this.artistRows.set([{ id_artist: 0, id_instrument: null }]);
    this.audioFile.set(null);
    this.audioFileName.set(null);
    this.existingAudioUrl.set(null);

    try {
      await this.loadFormCatalogs();
      this.showForm.set(true);
    } catch {
      this.error.set('No se pudieron cargar los catálogos.');
    }
  }

  async openEditForm(item: Interpretation): Promise<void> {
    if (!this.isOwnInterpretation(item)) return;

    this.formError.set(null);
    this.editingInterpretation.set(item);
    this.formWorkId.set(item.id_work);
    this.formTypeId.set(item.id_type_interpretation ?? null);
    this.audioFile.set(null);
    this.audioFileName.set(null);
    this.existingAudioUrl.set(this.hasAudio(item) ? this.audioUrl(item) : null);
    this.artistRows.set(
      item.interpretation_artists?.length
        ? item.interpretation_artists.map((row) => ({
            id_artist: row.id_artist,
            id_instrument: row.id_instrument ?? null,
          }))
        : [{ id_artist: 0, id_instrument: null }]
    );

    try {
      await this.loadFormCatalogs();
      this.showForm.set(true);
    } catch {
      this.error.set('No se pudieron cargar los catálogos.');
    }
  }

  private async loadFormCatalogs(): Promise<void> {
    const [worksRes, catalogsRes, artistsRes] = await Promise.all([
      firstValueFrom(this.api.getWorks()),
      firstValueFrom(this.api.getCatalogs()),
      firstValueFrom(this.api.getArtists()),
    ]);
    this.works.set(worksRes.data ?? []);
    this.types.set(
      (catalogsRes.data?.types ?? []).filter((t) => t.name !== 'Histórico') as TypeInterpretation[]
    );
    this.instruments.set((catalogsRes.data?.instruments ?? []) as CatalogInstrument[]);
    this.artists.set(artistsRes.data ?? []);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingInterpretation.set(null);
    this.formError.set(null);
    this.existingAudioUrl.set(null);
  }

  addArtistRow(): void {
    this.artistRows.update((rows) => [...rows, { id_artist: 0, id_instrument: null }]);
  }

  removeArtistRow(index: number): void {
    this.artistRows.update((rows) => rows.filter((_, i) => i !== index));
  }

  updateArtistRow(index: number, field: keyof ArtistFormRow, value: number | null): void {
    this.artistRows.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (file && !file.type.includes('audio') && !file.name.toLowerCase().endsWith('.mp3')) {
      this.formError.set('Solo se permiten archivos MP3.');
      input.value = '';
      return;
    }
    this.formError.set(null);
    this.audioFile.set(file);
    this.audioFileName.set(file?.name ?? null);
  }

  private buildFormData(): FormData {
    const rows = this.artistRows().filter((r) => r.id_artist > 0);
    const formData = new FormData();
    formData.append('id_work', String(this.formWorkId()));
    formData.append('id_type_interpretation', String(this.formTypeId()));
    formData.append('load_file_date', this.resolveLoadFileDate());
    formData.append(
      'artists',
      JSON.stringify(rows.map((r) => ({ id_artist: r.id_artist, id_instrument: r.id_instrument })))
    );
    const audio = this.audioFile();
    if (audio) {
      formData.append('audioMp3', audio);
    }
    return formData;
  }

  async submitInterpretation(): Promise<void> {
    const id_work = this.formWorkId();
    const id_type_interpretation = this.formTypeId();
    const type = this.selectedType();
    const rows = this.artistRows().filter((r) => r.id_artist > 0);
    const editing = this.editingInterpretation();

    if (!id_work || !id_type_interpretation) {
      this.formError.set('Obra y tipo son obligatorios.');
      return;
    }

    if (!this.audioFile() && !this.existingAudioUrl()) {
      this.formError.set('Debes adjuntar un archivo MP3.');
      return;
    }

    if (type && (rows.length < type.min_artist || rows.length > type.max_artist)) {
      this.formError.set(
        `Este tipo requiere entre ${type.min_artist} y ${type.max_artist} artistas.`
      );
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    const formData = this.buildFormData();

    try {
      if (editing) {
        await firstValueFrom(this.api.updateInterpretation(editing.id_interpretation, formData));
      } else {
        if (!this.audioFile()) {
          this.formError.set('Debes adjuntar un archivo MP3.');
          this.saving.set(false);
          return;
        }
        await firstValueFrom(this.api.createInterpretation(formData));
      }
      this.closeForm();
      await this.loadInterpretations();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        (editing ? 'No se pudo actualizar la interpretación' : 'No se pudo registrar la interpretación');
      this.formError.set(message);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteInterpretation(item: Interpretation): Promise<void> {
    if (!this.isOwnInterpretation(item)) return;

    const confirmed = confirm(
      `¿Eliminar la interpretación de "${item.work?.name ?? 'esta obra'}"?`
    );
    if (!confirmed) return;

    this.deletingId.set(item.id_interpretation);
    this.error.set(null);

    try {
      if (this.player.isCurrentTrack(item.id_interpretation)) {
        this.player.stop();
      }
      await firstValueFrom(this.api.deleteInterpretation(item.id_interpretation));
      this.selectedIds.update((ids) => ids.filter((id) => id !== item.id_interpretation));
      await this.loadInterpretations();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo eliminar la interpretación';
      this.error.set(message);
    } finally {
      this.deletingId.set(null);
    }
  }

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private resolveLoadFileDate(): string {
    if (this.isEditing()) {
      return this.editingInterpretation()?.load_file_date ?? this.todayDate();
    }
    return this.todayDate();
  }

  private formatDateLabel(iso: string): string {
    const [year, month, day] = iso.split('-');
    if (!year || !month || !day) return iso;
    return `${day}/${month}/${year}`;
  }
}
