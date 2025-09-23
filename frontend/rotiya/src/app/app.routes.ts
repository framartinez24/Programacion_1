import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },

  { path: 'menu',    loadComponent: () => import('./pages/menu/menu').then(m => m.Menu) },
  { path: 'carrito', loadComponent: () => import('./pages/carrito/carrito').then(m => m.Carrito) },
  { path: 'perfil',  loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil) },
  // Carpeta sin ñ: "resenas" (la URL pública puede tener "ñ")
  { path: 'reseñas', loadComponent: () => import('./pages/resenas/resenas').then(m => m.Resenas) },
  { path: 'entrada', loadComponent: () => import('./pages/entrada/entrada').then(m => m.Entrada) },
  { path: 'postres', loadComponent: () => import('./pages/postres/postres').then(m => m.Postres) },
  { path: 'bebidas', loadComponent: () => import('./pages/bebidas/bebidas').then(m => m.Bebidas) },
  { path: 'pago',    loadComponent: () => import('./pages/pago/pago').then(m => m.Pago) },
  { path: 'admin',   loadComponent: () => import('./pages/admin/admin').then(m => m.Admin) },
  { path: 'login',   loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'restore',   loadComponent: () => import('./pages/restore/restore').then(m => m.Restore) },
  { path: '**', redirectTo: 'menu' }
];
