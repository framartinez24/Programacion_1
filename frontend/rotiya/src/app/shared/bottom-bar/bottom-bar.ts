import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuStateService, MenuPage } from '../menu-state';
import { CartService } from '../cart'; // <-- 1. Importamos el servicio del carrito

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.scss'
})
export class BottomBar {
  private router = inject(Router);
  private menuState = inject(MenuStateService);
  private cartService = inject(CartService); // <-- 2. Inyectamos el servicio

  // 3. Creamos la propiedad que apunta a la señal del total de items
  cartItemCount = this.cartService.totalItems;

  goToResenas(): void {
    this.router.navigate(['/menu']).then(() => {
      this.menuState.changePage('resenas');
    });
  }
}