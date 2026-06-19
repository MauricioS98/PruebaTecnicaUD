import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Work } from '../../core/models/api.models';

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
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');

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

  async ngOnInit(): Promise<void> {
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
}
