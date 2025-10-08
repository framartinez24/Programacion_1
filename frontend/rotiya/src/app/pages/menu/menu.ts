import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDataService } from '../panel-admin/admin-data';

type MenuPage = 'principales' | 'entradas' | 'postres' | 'bebidas';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule], // Solo importamos CommonModule
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {
  private dataService = inject(AdminDataService);
  currentPage: MenuPage = 'principales';
  private todosLosProductos = this.dataService.productos;

  productosPrincipales = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Plato principal'));
  entradas = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Entrada'));
  postres = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Postres'));
  bebidas = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Bebidas'));

  changePage(page: MenuPage): void {
    this.currentPage = page;
  }
}