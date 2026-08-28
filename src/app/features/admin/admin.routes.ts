import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'site', loadComponent: () => import('./site/site.component').then(m => m.SiteComponent) },
      { path: 'saturday', loadComponent: () => import('./saturday/saturday.component').then(m => m.SaturdayComponent) },
      { path: 'questions', loadComponent: () => import('./questions/questions.component').then(m => m.QuestionsComponent) },
      { path: 'programmes', loadComponent: () => import('./programmes/programmes-admin.component').then(m => m.ProgrammesAdminComponent) },
      { path: 'people', loadComponent: () => import('./people/people.component').then(m => m.PeopleComponent) },
      { path: 'content', loadComponent: () => import('./content/content.component').then(m => m.ContentComponent) },
      { path: 'visit', loadComponent: () => import('./visit/visit-admin.component').then(m => m.VisitAdminComponent) },
      { path: 'giving', loadComponent: () => import('./giving/giving-admin.component').then(m => m.GivingAdminComponent) },
      { path: 'assets', loadComponent: () => import('./assets/assets.component').then(m => m.AssetsComponent) },
      { path: 'enquiries', loadComponent: () => import('./enquiries/enquiries.component').then(m => m.EnquiriesComponent) },
      { path: 'interest', loadComponent: () => import('./interest/interest.component').then(m => m.InterestComponent) },
      { path: '**', redirectTo: '' },
    ],
  },
];
