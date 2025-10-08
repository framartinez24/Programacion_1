import { Injectable, signal } from '@angular/core';

// Definimos los tipos de "sub-páginas" que existirán dentro del menú.
// Incluimos 'resenas' para el nuevo botón.
export type MenuPage = 'principales' | 'entradas' | 'postres' | 'bebidas' | 'resenas';

@Injectable({
  providedIn: 'root'
})
export class MenuStateService {

  // Esta es la pieza central: una "señal" que contiene la página activa del menú.
  // Cualquiera puede leerla, y nosotros la cambiaremos con un método.
  // Por defecto, al iniciar, la página activa será 'principales'.
  public currentPage = signal<MenuPage>('principales');

  // Este es el único método del servicio.
  // Permite que cualquier componente (como la BottomBar o la barra de categorías)
  // le diga al servicio que cambie la página activa.
  public changePage(page: MenuPage): void {
    this.currentPage.set(page);
  }

}