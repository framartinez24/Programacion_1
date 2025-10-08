import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminDataService, Resena } from '../panel-admin/admin-data';
import { MenuStateService, MenuPage } from '../../shared/menu-state';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {
  private dataService = inject(AdminDataService);
  private menuState = inject(MenuStateService);

  // La página actual ahora viene DIRECTAMENTE del servicio
  currentPage = this.menuState.currentPage;

  // El resto de las propiedades que ya funcionaban
  resenas = this.dataService.resenas;
  todosLosProductos = this.dataService.productos;
  newResena = { productoNombre: '', nombre: '', comentario: '', calificacion: 5 };

  productosPrincipales = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Plato principal'));
  entradas = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Entrada'));
  postres = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Postres'));
  bebidas = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Bebidas'));

  // Esta función ahora también habla con el servicio
  changePage(page: MenuPage): void {
    this.menuState.changePage(page);
  }

  submitResena(form: NgForm): void {
    if (form.invalid || !this.newResena.productoNombre) return;
    const resenaParaGuardar: Resena = {
      productoNombre: this.newResena.productoNombre,
      nombre: this.newResena.nombre,
      comentario: this.newResena.comentario,
      calificacion: Number(this.newResena.calificacion),
      fecha: new Date().toISOString().split('T')[0]
    };
    this.dataService.addResena(resenaParaGuardar);
    form.resetForm({ productoNombre: '', calificacion: 5 });
  }
}