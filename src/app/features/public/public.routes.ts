import { Routes } from '@angular/router';

// The site is exactly these pages. They are defined here, not discovered from
// the API — only the copy inside them is editable.
export const PUBLIC_ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'what-to-expect',
    loadComponent: () =>
      import('./what-to-expect/what-to-expect.component').then(m => m.WhatToExpectComponent),
  },
  {
    path: 'programmes',
    loadComponent: () =>
      import('./programmes/programmes.component').then(m => m.ProgrammesComponent),
  },
  {
    path: 'sinners-only',
    loadComponent: () =>
      import('./sinners-only/sinners-only.component').then(m => m.SinnersOnlyComponent),
  },
  {
    path: 'visit',
    loadComponent: () => import('./visit/visit.component').then(m => m.VisitComponent),
  },
  {
    path: 'give',
    loadComponent: () => import('./give/give.component').then(m => m.GiveComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('../../shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
