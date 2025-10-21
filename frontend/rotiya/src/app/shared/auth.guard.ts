import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

// Definimos una interfaz para nuestro token
// (Recuerda que le añadimos el 'rol' en el backend)
interface AuthToken {
  exp: number;
  rol: string;
  sub: string; // 'sub' es el 'identity' (el ID de usuario)
}

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
    // Si no es un navegador, no continuamos.
    return false;
  }

  // 1. Buscamos el token.
  const token = localStorage.getItem('access_token');

  // 2. Si NO hay token...
  if (!token) {
    console.log('AuthGuard: Acceso denegado. No hay token. Redirigiendo a /login...');
    router.navigate(['/login']);
    return false;
  }

  try {
    // 3. Decodificamos el token.
    const decodedToken: AuthToken = jwtDecode(token);
    const isExpired = decodedToken.exp * 1000 < Date.now();

    // 4. Si el token ha expirado...
    if (isExpired) {
      console.log('AuthGuard: Acceso denegado. El token ha expirado. Redirigiendo a /login...');
      localStorage.removeItem('access_token');
      router.navigate(['/login']);
      return false;
    }

    // --- ¡NUEVA LÓGICA DE ROLES! ---

    // 5. Obtenemos los roles requeridos de la ruta (de app.routes.ts)
    const requiredRoles = route.data['roles'] as Array<string>;

    // 6. Si la ruta NO requiere roles específicos (ej: /menu, /carrito)...
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('AuthGuard: Acceso permitido. Token válido (no se requieren roles).');
      return true; // ...simplemente lo dejamos pasar.
    }

    // 7. Si la ruta SÍ requiere roles (ej: /panel)...
    const userRole = decodedToken.rol; // Obtenemos el rol del token

    if (requiredRoles.includes(userRole)) {
      // 8. Si el rol del usuario ESTÁ en la lista de roles requeridos...
      console.log(`AuthGuard: Acceso permitido. Rol '${userRole}' autorizado.`);
      return true; // ...lo dejamos pasar.
    } else {
      // 9. Si el rol del usuario NO ESTÁ en la lista...
      console.log(`AuthGuard: Acceso denegado. Rol '${userRole}' no autorizado. Redirigiendo a /menu...`);
      // Lo redirigimos a una página segura (ej: /menu), NO a /login,
      // porque el usuario SÍ está logueado, solo que no tiene permisos.
      router.navigate(['/menu']);
      return false; // ...bloqueamos el acceso.
    }

  } catch (error) {
    // Si el token está corrupto...
    console.error('AuthGuard: Error al decodificar el token.', error);
    localStorage.removeItem('access_token');
    router.navigate(['/login']);
    return false;
  }
};