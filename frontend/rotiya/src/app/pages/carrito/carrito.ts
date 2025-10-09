import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../shared/cart';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss'
})
export class Carrito {
  private cartService = inject(CartService);
  private router = inject(Router);

  // Exponemos las señales del servicio a la vista
  cartItems = this.cartService.cartItems;
  totalPrice = this.cartService.totalPrice;

  // ¡LA CLAVE ESTÁ AQUÍ!
  // Creamos una nueva señal para controlar qué se muestra.
  // Por defecto, se muestra el carrito (false).
  showConfirmation = signal(false);

  // --- MÉTODOS ---

  removeFromCart(productName: string): void {
    this.cartService.removeProduct(productName);
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  // Lógica de "pago" actualizada
  checkout(): void {
    // 1. Vaciamos el carrito
    this.cartService.clearCart();
    // 2. En lugar de navegar, cambiamos el estado para mostrar la confirmación
    this.showConfirmation.set(true);
  }

  // Nueva función para el botón "Volver al Menú"
  backToMenu(): void {
    this.router.navigate(['/menu']);
    // Opcional: Reseteamos la vista por si el usuario vuelve al carrito con el botón "atrás" del navegador
    this.showConfirmation.set(false);
  }
}