import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CartItem {
  name: string;
  unitPrice: number;
  quantity: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss'
})
export class Carrito {
  cartItems: CartItem[] = [
    {
      name: 'Pollo a la parrilla',
      unitPrice: 20.00,
      quantity: 1
    },
    {
      name: 'Empanadas de carne',
      unitPrice: 12.00,
      quantity: 2
    }
  ];

  // Calcular el subtotal de un item
  getLineTotal(item: CartItem): number {
    return item.unitPrice * item.quantity;
  }

  // Calcular el subtotal del carrito
  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.getLineTotal(item), 0);
  }

  // Calcular el total (por ahora igual al subtotal)
  getTotal(): number {
    return this.getSubtotal();
  }

  // Calcular cantidad total de items
  getTotalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Incrementar cantidad
  incrementQuantity(item: CartItem): void {
    item.quantity++;
  }

  // Decrementar cantidad
  decrementQuantity(item: CartItem): void {
    if (item.quantity > 0) {
      item.quantity--;
    }
  }

  // Formatear precio
  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}