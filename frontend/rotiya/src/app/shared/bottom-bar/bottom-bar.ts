import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Importamos Router y RouterModule
import { MenuStateService, MenuPage } from '../menu-state'; // Importamos nuestro nuevo servicio

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [RouterModule], // ¡Importante! Añadimos RouterModule para que routerLink funcione
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.scss'
})
export class BottomBar {
  // Inyectamos las herramientas que necesitamos
  private router = inject(Router);
  private menuState = inject(MenuStateService);

  // Esta es la función especial para el botón "Reseñas"
  goToPage(page: MenuPage): void {
    // Primero, nos aseguramos de que el usuario esté en la página del menú.
    // El 'navigate' devuelve una promesa que se resuelve cuando la navegación termina.
    this.router.navigate(['/menu']).then(() => {
      // Una vez que estamos en la página del menú, le decimos al servicio de estado
      // que la categoría interna que queremos ver es la que nos pasaron.
      this.menuState.changePage(page);
    });
  }
}