import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Definimos los tipos de página que este componente puede manejar
export type MenuPage = 'principales' | 'entradas' | 'postres' | 'bebidas' | 'resenas';

@Component({
  selector: 'app-menu-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-categories.html',
  styleUrl: './menu-categories.scss'
})
export class MenuCategoriesComponent {
  // Recibe la página actual desde el componente padre (Menu)
  @Input() currentPage: MenuPage = 'principales';
  // Avisa al componente padre cuando se selecciona una nueva categoría
  @Output() categoryChange = new EventEmitter<MenuPage>();

  // Cuando se hace clic en un botón, emite el evento con la nueva página
  changePage(page: MenuPage): void {
    this.categoryChange.emit(page);
  }
}