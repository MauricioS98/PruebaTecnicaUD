import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Artist } from '../../core/models/api.models';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './artists.component.html',
  styleUrl: './artists.component.scss',
})
export class ArtistsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly artists = signal<Artist[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');

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
}
