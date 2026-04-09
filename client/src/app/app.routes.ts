import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';

const authGuard = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : auth.logout();
};

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'chat', loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent), canActivate: [authGuard] },
  { path: 'policies', loadComponent: () => import('./features/dashboard/policy-list.component').then(m => m.PolicyListComponent), canActivate: [authGuard] },
  { path: 'about', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent), canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
