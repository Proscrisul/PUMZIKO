import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './features/public/public-layout/public-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'admin/login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/admin/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: '',
    component: PublicLayoutComponent,
    loadChildren: () =>
      import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES),
  },
];
