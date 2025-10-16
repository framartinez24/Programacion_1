import { Routes } from '@angular/router';
// 1. Importamos nuestro nuevo guardián
import { authGuard } from './shared/auth.guard';

export const routes: Routes = [
  // --- Rutas Públicas (Cualquiera puede acceder) ---
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',    loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro) },
  { path: 'restore',  loadComponent: () => import('./pages/restore/restore').then(m => m.Restore) },

  // --- Rutas Protegidas (Necesitas iniciar sesión para acceder) ---
  { 
    path: 'menu',
    loadComponent: () => import('./pages/menu/menu').then(m => m.Menu),
    canActivate: [authGuard] // <-- 2. Ponemos al guardián en la puerta
  },
  { 
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito').then(m => m.Carrito),
    canActivate: [authGuard] // <-- 2. Ponemos al guardián en la puerta
  },
  { 
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil),
    canActivate: [authGuard] // <-- 2. Ponemos al guardián en la puerta
  },
  { 
    path: 'panel', 
    loadComponent: () => import('./pages/panel/panel').then(m => m.PanelComponent),
    canActivate: [authGuard] // <-- 2. Ponemos al guardián en la puerta
  },

  // --- Ruta por defecto ---
  { path: '**', redirectTo: 'login' } 
];