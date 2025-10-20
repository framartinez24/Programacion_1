import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export const authGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // El guardián solo debe ejecutarse en el navegador, no en el servidor.
  if (isPlatformBrowser(platformId)) {
    // 1. Buscamos el token directamente en el localStorage.
    const token = localStorage.getItem('access_token');

    // 2. Si NO hay token...
    if (!token) {
      console.log('AuthGuard: Acceso denegado. No hay token. Redirigiendo a /login...');
      router.navigate(['/login']);
      return false; // Bloqueamos el acceso.
    }

    try {
      // 3. Si SÍ hay token, lo decodificamos y revisamos su fecha de expiración.
      const decodedToken: { exp: number } = jwtDecode(token);
      const isExpired = decodedToken.exp * 1000 < Date.now();

      // 4. Si el token ha expirado...
      if (isExpired) {
        console.log('AuthGuard: Acceso denegado. El token ha expirado. Redirigiendo a /login...');
        localStorage.removeItem('access_token'); // Limpiamos el token viejo.
        router.navigate(['/login']);
        return false; // Bloqueamos el acceso.
      }

      // 5. Si el token existe y no ha expirado, permitimos el paso.
      console.log('AuthGuard: Acceso permitido. Token válido.');
      return true;

    } catch (error) {
      // Si el token está corrupto y no se puede decodificar...
      console.error('AuthGuard: Error al decodificar el token.', error);
      localStorage.removeItem('access_token');
      router.navigate(['/login']);
      return false; // Bloqueamos el acceso.
    }
  }

  // Si no estamos en el navegador (entorno de servidor), bloqueamos por defecto por seguridad.
  return false;
};