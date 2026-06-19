import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Director } from '../../core/models/api.models';

@Component({
  selector: 'app-directors',
  standalone: true,
  templateUrl: './directors.component.html',
  styleUrl: './directors.component.scss',
})
export class DirectorsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly directors = signal<Director[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');

  readonly filteredDirectors = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.directors();

    return this.directors().filter(
      (director) =>
        director.nickname.toLowerCase().includes(term) ||
        (director.description ?? '').toLowerCase().includes(term)
    );
  });

  async ngOnInit(): Promise<void> {
    try {
      const result = await firstValueFrom(this.api.getDirectors());
      this.directors.set(result.data ?? []);
    } catch {
      this.error.set('No se pudo cargar el listado de directores.');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(value: string): void {
    this.search.set(value);
  }
}
