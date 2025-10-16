import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

// Esta es la función del guardián
export const authGuard: CanActivateFn = (route, state) => {

  // Inyectamos las herramientas que necesitamos: el servicio de Auth y el Router
  const authService = inject(AuthService);
  const router = inject(Router);

  // Le preguntamos al servicio si el usuario tiene una sesión activa
  if (authService.isLoggedIn()) {
    // Si la respuesta es SÍ, le permitimos el paso
    return true;
  } else {
    // Si la respuesta es NO, lo redirigimos a la página de login
    console.log('Acceso denegado. Redirigiendo a /login...');
    router.navigate(['/login']);
    // Y bloqueamos el acceso a la ruta que intentaba visitar
    return false;
  }
};