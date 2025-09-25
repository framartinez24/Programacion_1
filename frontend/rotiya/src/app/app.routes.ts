import { Routes } from '@angular/router';

export const routes: Routes = [
  // CAMBIO: La ruta por defecto ahora será '/login'
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'menu',    loadComponent: () => import('./pages/menu/menu').then(m => m.Menu) },
  { path: 'carrito', loadComponent: () => import('./pages/carrito/carrito').then(m => m.Carrito) },
  { path: 'perfil',  loadComponent: () => import('./pages/perfil/perfil').then(m => m.Perfil) },
  { path: 'reseñas', loadComponent: () => import('./pages/resenas/resenas').then(m => m.Resenas) },
  { path: 'entrada', loadComponent: () => import('./pages/entrada/entrada').then(m => m.Entrada) },
  { path: 'postres', loadComponent: () => import('./pages/postres/postres').then(m => m.Postres) },
  { path: 'bebidas', loadComponent: () => import('./pages/bebidas/bebidas').then(m => m.Bebidas) },
  { path: 'pago',    loadComponent: () => import('./pages/pago/pago').then(m => m.Pago) },
  { path: 'admin',   loadComponent: () => import('./pages/admin/admin').then(m => m.Admin) },
  { path: 'login',   loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'restore', loadComponent: () => import('./pages/restore/restore').then(m => m.Restore) },
  { path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro) },
  // CAMBIO: Si una ruta no existe, redirige a '/login' en lugar de a '/menu'
  { path: '**', redirectTo: 'login' }
];
