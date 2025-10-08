import { Injectable, signal } from '@angular/core';

// Definimos los tipos de página, incluyendo 'resenas'
export type MenuPage = 'principales' | 'entradas' | 'postres' | 'bebidas' | 'resenas';

@Injectable({
  providedIn: 'root'
})
export class MenuStateService {
  // La señal que guarda la página activa. Inicia en 'principales'.
  public currentPage = signal<MenuPage>('principales');

  // El método para cambiar la página.
  public changePage(page: MenuPage): void {
    this.currentPage.set(page);
  }
}