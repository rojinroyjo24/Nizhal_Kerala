import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Nizhal – Find Your Shadow. Explore Kerala.'
  },
  {
    path: 'explore',
    loadComponent: () => import('./pages/explore/explore.component').then(m => m.ExploreComponent),
    title: 'Explore Hidden Places – Nizhal'
  },
  {
    path: 'place/:id',
    loadComponent: () => import('./pages/place-detail/place-detail.component').then(m => m.PlaceDetailComponent),
    title: 'Place Details – Nizhal'
  },
  {
    path: 'add-place',
    loadComponent: () => import('./pages/add-place/add-place.component').then(m => m.AddPlaceComponent),
    title: 'Share a Hidden Gem – Nizhal',
    canActivate: [authGuard]
  },
  {
    path: 'edit-place/:id',
    loadComponent: () => import('./pages/edit-place/edit-place.component').then(m => m.EditPlaceComponent),
    title: 'Edit Place – Nizhal',
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    title: 'My Profile – Nizhal',
    canActivate: [authGuard]
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    title: 'Admin Dashboard – Nizhal',
    canActivate: [adminGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login – Nizhal'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    title: 'Join the Community – Nizhal'
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
    title: 'Notifications – Nizhal'
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 – Page Not Found'
  }
];
