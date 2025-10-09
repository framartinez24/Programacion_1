import { Injectable, signal, computed, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Producto } from '../pages/panel-admin/admin-data';

// Definimos una interfaz para los productos dentro del carrito.
// Es como un 'Producto', pero con una propiedad 'cantidad' específica para el carrito.
export interface CartItem extends Producto {
  cantidad: number;
}

const CART_LS_KEY = 'rotiya_cart_v1';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private isBrowser: boolean;

  // --- SEÑALES PRINCIPALES ---
  // Esta señal contiene la lista de productos en el carrito. Es el "estado" principal.
  cartItems = signal<CartItem[]>([]);

  // --- SEÑALES COMPUTADAS (Calculadas automáticamente) ---
  // Esta señal calcula el número total de artículos en el carrito.
  // Se actualiza automáticamente cada vez que 'cartItems' cambia.
  totalItems = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.cantidad, 0);
  });

  // Esta señal calcula el precio total del carrito.
  // También se actualiza automáticamente.
  totalPrice = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.precio * item.cantidad), 0);
  });


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Si estamos en el navegador, cargamos el carrito guardado.
    if (this.isBrowser) {
      this.loadCartFromLocalStorage();

      // Creamos un "efecto" que guardará el carrito en localStorage
      // cada vez que la lista de productos cambie.
      effect(() => {
        this.saveCartToLocalStorage();
      });
    }
  }

  // --- MÉTODOS PÚBLICOS (Las acciones que podemos hacer) ---

  /**
   * Añade un producto al carrito.
   * Si el producto ya existe, incrementa su cantidad.
   * Si no existe, lo añade a la lista.
   */
  addProduct(productToAdd: Producto): void {
    this.cartItems.update(currentItems => {
      const existingItem = currentItems.find(item => item.nombre === productToAdd.nombre);

      if (existingItem) {
        // El producto ya está, incrementamos la cantidad
        existingItem.cantidad++;
        return [...currentItems];
      } else {
        // El producto es nuevo, lo añadimos con cantidad 1
        const newItem: CartItem = { ...productToAdd, cantidad: 1 };
        return [...currentItems, newItem];
      }
    });
  }

  /**
   * Elimina un producto del carrito, sin importar la cantidad.
   */
  removeProduct(productName: string): void {
    this.cartItems.update(currentItems => 
      currentItems.filter(item => item.nombre !== productName)
    );
  }

  /**
   * Vacía completamente el carrito de compras.
   */
  clearCart(): void {
    this.cartItems.set([]);
  }


  // --- MÉTODOS PRIVADOS (Lógica interna) ---

  private saveCartToLocalStorage(): void {
    localStorage.setItem(CART_LS_KEY, JSON.stringify(this.cartItems()));
  }

  private loadCartFromLocalStorage(): void {
    const savedCart = localStorage.getItem(CART_LS_KEY);
    if (savedCart) {
      this.cartItems.set(JSON.parse(savedCart));
    }
  }
}
