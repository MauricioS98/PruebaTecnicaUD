import { Routes } from '@angular/router';
import { authGuard, adminGuard, dashboardGuard, guestGuard } from './core/guards/auth.guard';
import { HomeRedirectComponent } from './core/home-redirect/home-redirect.component';
import { ShellComponent } from './layout/shell/shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';
import { WorksComponent } from './features/works/works.component';
import { InterpretationsComponent } from './features/interpretations/interpretations.component';
import { ArtistsComponent } from './features/artists/artists.component';
import { DirectorsComponent } from './features/directors/directors.component';
import { PerformerProfileComponent } from './features/performer-profile/performer-profile.component';
import { AdminInstrumentsComponent } from './features/admin-instruments/admin-instruments.component';

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
      { path: '', pathMatch: 'full', component: HomeRedirectComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [dashboardGuard] },
      { path: 'admin/instruments', component: AdminInstrumentsComponent, canActivate: [adminGuard] },
      { path: 'profile', component: ProfileComponent },
      { path: 'works', component: WorksComponent },
      { path: 'interpretations', component: InterpretationsComponent },
      { path: 'artists', component: ArtistsComponent },
      { path: 'artists/:id', component: PerformerProfileComponent, data: { type: 'artist' } },
      { path: 'directors', component: DirectorsComponent },
      { path: 'directors/:id', component: PerformerProfileComponent, data: { type: 'director' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
