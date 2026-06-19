import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { AdminUser, Interpretation, Work } from '../../core/models/api.models';
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
  readonly users = signal<AdminUser[]>([]);
  readonly showWorks = signal(false);
  readonly showInterpretations = signal(false);
  readonly scope = signal<'admin' | 'personal'>('personal');
  readonly loading = signal(true);
  readonly usersLoading = signal(false);
  readonly updatingUserId = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly adminError = signal<string | null>(null);

  readonly isAdminView = computed(() => this.scope() === 'admin');
  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);

  async ngOnInit(): Promise<void> {
    try {
      const result = await firstValueFrom(this.api.getDashboard());
      const data = result.data;
      this.scope.set(data.scope);
      this.works.set(data.works ?? []);
      this.interpretations.set(data.interpretations ?? []);
      this.showWorks.set(data.showWorks);
      this.showInterpretations.set(data.showInterpretations);

      if (data.scope === 'admin') {
        await this.loadUsers();
      }
    } catch {
      this.error.set('No se pudo cargar tu panel.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadUsers(): Promise<void> {
    this.usersLoading.set(true);
    this.adminError.set(null);

    try {
      const result = await firstValueFrom(this.api.getAdminUsers());
      this.users.set(result.data ?? []);
    } catch {
      this.adminError.set('No se pudo cargar la lista de usuarios.');
    } finally {
      this.usersLoading.set(false);
    }
  }

  async toggleAdmin(user: AdminUser): Promise<void> {
    if (this.updatingUserId() !== null) return;

    const nextIsAdmin = !user.isAdmin;
    this.updatingUserId.set(user.id);
    this.adminError.set(null);

    try {
      const result = await firstValueFrom(this.api.setUserAdminStatus(user.id, nextIsAdmin));
      this.users.update((items) =>
        items.map((item) => (item.id === user.id ? result.data : item))
      );

      if (user.id === this.currentUserId()) {
        await this.auth.fetchMe();
      }
    } catch (err: unknown) {
      const message =
        (err as { error?: { message?: string } })?.error?.message ??
        'No se pudo actualizar el rol de administrador.';
      this.adminError.set(message);
    } finally {
      this.updatingUserId.set(null);
    }
  }

  isSelf(user: AdminUser): boolean {
    return user.id === this.currentUserId();
  }
}
