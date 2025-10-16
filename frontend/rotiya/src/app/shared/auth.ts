import { Injectable, inject, signal, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { tap, catchError, of } from 'rxjs';

interface DecodedToken {
  id: number;
  rol: string;
  correo: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private isBrowser: boolean;

  private apiUrl = 'http://127.0.0.1:3535/auth';
  currentUser = signal<DecodedToken | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadTokenFromLocalStorage();
    }
  }

  login(credentials: { correo: string, contraseña: any }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.access_token) {
          this.saveSession(response.access_token);
          const user = this.currentUser();
          if (user?.rol === 'admin' || user?.rol === 'empleado') {
            this.router.navigate(['/panel']);
          } else {
            this.router.navigate(['/menu']);
          }
        }
      }),
      catchError(error => {
        console.error('Error en el login:', error);
        return of(error);
      })
    );
  }

  // --- FUNCIÓN CORREGIDA ---
  register(userData: any) {
    const dataToSend = { ...userData, rol: userData.rol || 'cliente' };
    // LA CORRECCIÓN: Apuntamos a '/register_' en lugar de '/register'
    return this.http.post<any>(`${this.apiUrl}/register_`, dataToSend).pipe(
      catchError(error => {
        console.error('Error en el registro:', error);
        return of(error);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const isExpired = user.exp * 1000 < Date.now();
    if (isExpired) {
      this.logout();
      return false;
    }
    return true;
  }

  private saveSession(token: string): void {
    if(this.isBrowser){
      localStorage.setItem('access_token', token);
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        this.currentUser.set(decodedToken);
      } catch (error) {
        console.error("Error decodificando el token:", error);
        this.currentUser.set(null);
      }
    }
  }

  private loadTokenFromLocalStorage(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (isExpired) {
          this.logout();
        } else {
          this.saveSession(token);
        }
      } catch (error) {
        console.error("Error al cargar el token:", error);
        this.logout();
      }
    }
  }
}