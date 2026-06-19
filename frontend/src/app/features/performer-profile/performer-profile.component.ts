import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Artist, Director, Interpretation } from '../../core/models/api.models';

type PerformerType = 'artist' | 'director';

@Component({
  selector: 'app-performer-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './performer-profile.component.html',
  styleUrl: './performer-profile.component.scss',
})
export class PerformerProfileComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly type = signal<PerformerType>('artist');
  readonly performer = signal<Artist | Director | null>(null);
  readonly interpretations = signal<Interpretation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly backLink = signal('/artists');
  readonly eyebrow = signal('Intérprete');
  readonly performerLabel = signal('Artista');

  async ngOnInit(): Promise<void> {
    const kind = this.route.snapshot.data['type'] as PerformerType;
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.type.set(kind);
    this.backLink.set(kind === 'artist' ? '/artists' : '/directors');
    this.eyebrow.set(kind === 'artist' ? 'Intérprete' : 'Director');
    this.performerLabel.set(kind === 'artist' ? 'Artista' : 'Director');

    if (!id) {
      this.error.set('Perfil no válido');
      this.loading.set(false);
      return;
    }

    try {
      const [performerRes, interpRes] = await Promise.all([
        kind === 'artist'
          ? firstValueFrom(this.api.getArtist(id))
          : firstValueFrom(this.api.getDirector(id)),
        firstValueFrom(
          this.api.getInterpretations(
            kind === 'artist' ? { artistId: id } : { directorId: id }
          )
        ),
      ]);

      this.performer.set(performerRes.data);
      this.interpretations.set(interpRes.data ?? []);
    } catch {
      this.error.set('No se pudo cargar el perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  isLegacy(item: Interpretation): boolean {
    return !item.id_type_interpretation;
  }

  performerDescription(): string {
    const person = this.performer();
    return person?.description?.trim() || 'Sin descripción';
  }
}
