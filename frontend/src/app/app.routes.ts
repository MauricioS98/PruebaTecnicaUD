import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { ShellComponent } from './layout/shell/shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import {
  WorksComponent,
  InterpretationsComponent,
  ArtistsComponent,
  DirectorsComponent,
} from './features/placeholders/placeholders.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'works', component: WorksComponent },
      { path: 'interpretations', component: InterpretationsComponent },
      { path: 'artists', component: ArtistsComponent },
      { path: 'directors', component: DirectorsComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
