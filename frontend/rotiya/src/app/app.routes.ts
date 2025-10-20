import { Routes } from '@angular/router';
import { authGuard } from './shared/auth.guard'; // Importamos nuestro nuevo guardián

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
    canActivate: [authGuard]
  },
  { 
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito').then(m => m.Carrito),
    canActivate: [authGuard]
  },
  { 
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil),
    canActivate: [authGuard]
  },
  { 
    path: 'panel', 
    loadComponent: () => import('./pages/panel/panel').then(m => m.PanelComponent),
    canActivate: [authGuard]
  },

  // --- Ruta por defecto ---
  { path: '**', redirectTo: 'login' } 
];