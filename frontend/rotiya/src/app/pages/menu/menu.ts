import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminDataService, Producto, Resena } from '../panel-admin/admin-data';
import { MenuStateService, MenuPage } from '../../shared/menu-state';
import { CartService } from '../../shared/cart';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {
  private dataService = inject(AdminDataService);
  private menuState   = inject(MenuStateService);
  private cartService = inject(CartService);

  // loader
  isLoadingProductos = true;

  // página actual (signal del servicio de estado)
  currentPage = this.menuState.currentPage;

  // signals que vienen del admin-data
  resenas           = this.dataService.resenas;
  todosLosProductos = this.dataService.productos;

  // modelo del formulario de reseñas
  newResena = { productoNombre: '', nombre: '', comentario: '', calificacion: 5 };

  // derivados por categoría
  productosPrincipales = computed(() =>
    this.todosLosProductos().filter(p => p.categoria === 'Plato principal')
  );
  entradas = computed(() =>
    this.todosLosProductos().filter(p => p.categoria === 'Entrada')
  );
  postres = computed(() =>
    this.todosLosProductos().filter(p => p.categoria === 'Postres')
  );
  bebidas = computed(() =>
    this.todosLosProductos().filter(p => p.categoria === 'Bebidas')
  );

  constructor() {
    // 1. pedirle al backend TODOS los productos (pág. 1, hasta 200 items, sin filtro)
    //    este método lo agregamos en admin-data.ts
    this.dataService.fetchProductosFromBackend(1, 200, '');

    // 2. apagar el loader después de un instante; si tu servicio
    //    ya hace señales al terminar, podés mover esto allí.
    setTimeout(() => {
      this.isLoadingProductos = false;
    }, 500);
  }

  changePage(page: MenuPage): void {
    this.menuState.changePage(page);
  }

  addToCart(producto: Producto): void {
    this.cartService.addProduct(producto);
    console.log(`${producto.nombre} añadido al carrito.`);
  }

  submitResena(form: NgForm): void {
    if (form.invalid || !this.newResena.productoNombre) return;

    const resenaParaGuardar: Resena = {
      productoNombre: this.newResena.productoNombre,
      nombre: this.newResena.nombre,
      comentario: this.newResena.comentario,
      calificacion: Number(this.newResena.calificacion),
      fecha: new Date().toISOString().split('T')[0],
    };

    this.dataService.addResena(resenaParaGuardar);
    form.resetForm({ productoNombre: '', calificacion: 5 });
  }
}
