import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuStateService, MenuPage } from '../menu-state';

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

  // La función que se ejecuta al hacer clic en "Reseñas"
  goToResenas(): void {
    // Primero, nos aseguramos de estar en la página del menú
    this.router.navigate(['/menu']).then(() => {
      // Y LUEGO, le decimos al servicio que muestre la página de reseñas
      this.menuState.changePage('resenas');
    });
  }
}