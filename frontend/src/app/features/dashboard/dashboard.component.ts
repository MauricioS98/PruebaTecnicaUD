import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { Interpretation, Work } from '../../core/models/api.models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly works = signal<Work[]>([]);
  readonly interpretations = signal<Interpretation[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    const [worksRes, interpRes] = await Promise.all([
      firstValueFrom(this.api.getWorks()),
      firstValueFrom(this.api.getInterpretations()),
    ]);
    this.works.set(worksRes.data ?? []);
    this.interpretations.set(interpRes.data ?? []);
    this.loading.set(false);
  }
}
