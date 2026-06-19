import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Artist } from '../../core/models/api.models';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.scss',
})
export class ArtistsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly artists = signal<Artist[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly search = signal('');
  readonly showForm = signal(false);
  readonly formNickname = signal('');
  readonly formDescription = signal('');

  readonly canManageArtists = computed(() => this.auth.isDirector() || this.auth.isAdmin());

  readonly filteredArtists = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.artists();

    return this.artists().filter(
      (artist) =>
        artist.nickname.toLowerCase().includes(term) ||
        (artist.description ?? '').toLowerCase().includes(term)
    );
  });

  async ngOnInit(): Promise<void> {
    await this.loadArtists();
  }

  async loadArtists(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(this.api.getArtists());
      this.artists.set(result.data ?? []);
    } catch {
      this.error.set('No se pudo cargar el listado de artistas.');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  openForm(): void {
    this.formNickname.set('');
    this.formDescription.set('');
    this.formError.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.formError.set(null);
  }

  async submitArtist(): Promise<void> {
    const nickname = this.formNickname().trim();
    if (!nickname) {
      this.formError.set('El nombre artístico es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.formError.set(null);

    try {
      await firstValueFrom(
        this.api.createArtist({
          nickname,
          description: this.formDescription().trim(),
        })
      );
      this.closeForm();
      await this.loadArtists();
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo crear el artista.';
      this.formError.set(message);
    } finally {
      this.saving.set(false);
    }
  }
}
