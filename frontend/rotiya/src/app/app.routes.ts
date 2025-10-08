import { Routes } from '@angular/router';

export const routes: Routes = [
  // --- Rutas de Autenticación ---
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',    loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro) },
  { path: 'restore',  loadComponent: () => import('./pages/restore/restore').then(m => m.Restore) },

  // --- Rutas Principales de la Aplicación de Cliente ---
  { path: 'menu',     loadComponent: () => import('./pages/menu/menu').then(m => m.Menu) },
  { path: 'carrito',  loadComponent: () => import('./pages/carrito/carrito').then(m => m.Carrito) },
  { path: 'perfil',   loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil) },
  
  // --- Ruta Unificada para Empleado/Admin ---
  { path: 'panel', loadComponent: () => import('./pages/panel/panel').then(m => m.PanelComponent) },

  { path: '**', redirectTo: 'menu' } 
];