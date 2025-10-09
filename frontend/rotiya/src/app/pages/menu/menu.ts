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
  private menuState = inject(MenuStateService);
  private cartService = inject(CartService); // <-- 2. Inyectamos el CartService

  currentPage = this.menuState.currentPage;
  
  resenas = this.dataService.resenas;
  todosLosProductos = this.dataService.productos;
  newResena = { productoNombre: '', nombre: '', comentario: '', calificacion: 5 };
  
  productosPrincipales = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Plato principal'));
  entradas = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Entrada'));
  postres = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Postres'));
  bebidas = computed(() => this.todosLosProductos().filter(p => p.categoria === 'Bebidas'));

  changePage(page: MenuPage): void {
    this.menuState.changePage(page);
  }

  // 3. NUEVA FUNCIÓN para añadir productos al carrito
  addToCart(producto: Producto): void {
    this.cartService.addProduct(producto);
    console.log(`${producto.nombre} añadido al carrito.`); // Mensaje para verificar en la consola
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