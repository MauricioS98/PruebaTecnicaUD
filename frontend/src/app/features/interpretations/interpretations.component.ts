import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Interpretation } from '../../core/models/api.models';

type InterpretationFilter = 'all' | 'recent' | 'legacy';

@Component({
  selector: 'app-interpretations',
  standalone: true,
  templateUrl: './interpretations.component.html',
  styleUrl: './interpretations.component.scss',
})
export class InterpretationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly interpretations = signal<Interpretation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly filter = signal<InterpretationFilter>('all');

  readonly filteredInterpretations = computed(() => {
    const term = this.search().trim().toLowerCase();
    const mode = this.filter();

    return this.interpretations().filter((item) => {
      const isLegacy = !item.id_type_interpretation;
      if (mode === 'recent' && isLegacy) return false;
      if (mode === 'legacy' && !isLegacy) return false;

      if (!term) return true;

      const artists =
        item.interpretation_artists
          ?.map((row) => `${row.artist?.nickname ?? ''} ${row.instrument?.name ?? ''}`)
          .join(' ') ?? '';

      return (
        item.work?.name?.toLowerCase().includes(term) ||
        item.director?.nickname?.toLowerCase().includes(term) ||
        item.type_interpretation?.name?.toLowerCase().includes(term) ||
        artists.toLowerCase().includes(term)
      );
    });
  });

  async ngOnInit(): Promise<void> {
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

  isLegacy(item: Interpretation): boolean {
    return !item.id_type_interpretation;
  }
}
