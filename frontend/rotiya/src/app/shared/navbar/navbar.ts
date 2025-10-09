import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CartService } from '../cart'; // <-- 1. Importamos el servicio del carrito

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private cartService = inject(CartService); // <-- 2. Inyectamos el servicio

  // 3. Creamos una propiedad que es una referencia directa a la señal del servicio
  cartItemCount = this.cartService.totalItems;
}