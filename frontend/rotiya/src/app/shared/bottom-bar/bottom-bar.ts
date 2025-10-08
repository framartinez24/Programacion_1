import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Importamos Router y RouterModule
import { MenuStateService, MenuPage } from '../menu-state';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  // LA CORRECCIÓN CLAVE ESTÁ AQUÍ: Añadimos RouterModule a los imports
  imports: [RouterModule], 
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.scss'
})
export class BottomBar {
  private router = inject(Router);
  private menuState = inject(MenuStateService);

  // La función para "Reseñas" no cambia
  goToResenas(): void {
    this.router.navigate(['/menu']).then(() => {
      this.menuState.changePage('resenas');
    });
  }
}