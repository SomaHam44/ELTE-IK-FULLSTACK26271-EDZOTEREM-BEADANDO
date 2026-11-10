import { Routes } from '@angular/router';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-page/login-page').then(m => m.LoginPage),
  },
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    loadComponent: () =>
      import('./features/layout/app-shell/app-shell').then(m => m.AppShell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard-page/dashboard-page')
            .then(m => m.DashboardPage),
      },
      {
        path: 'groups/new',
        loadComponent: () =>
          import('./features/admin/groups/group-form-page/group-form-page')
            .then(m => m.GroupFormPage),
      },
      {
        path: 'groups',
        loadComponent: () =>
          import('./features/admin/groups/groups-page/groups-page')
            .then(m => m.GroupsPage),
      },
      {
        path: 'groups/:id',
        loadComponent: () =>
          import('./features/admin/groups/group-detail-page/group-detail-page')
            .then(m => m.GroupDetailPage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'coach',
    canActivate: [roleGuard('coach')],
    loadComponent: () =>
      import('./features/layout/app-shell/app-shell').then(m => m.AppShell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/coach/dashboard/coach-dashboard-page/coach-dashboard-page')
            .then(m => m.CoachDashboardPage),
      },
      {
        path: 'sessions/:id',
        loadComponent: () =>
          import('./features/coach/sessions/session-detail-page/session-detail-page')
            .then(m => m.SessionDetailPage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'athlete',
    canActivate: [roleGuard('athlete')],
    loadComponent: () =>
      import('./features/layout/app-shell/app-shell').then(m => m.AppShell),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/athlete/schedule/athlete-schedule-page/athlete-schedule-page')
            .then(m => m.AthleteSchedulePage),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/athlete/schedule/athlete-schedule-page/athlete-schedule-page')
            .then(m => m.AthleteSchedulePage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
