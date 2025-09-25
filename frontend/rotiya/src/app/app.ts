import { Component, signal } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { BottomBar } from './shared/bottom-bar/bottom-bar';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, Navbar, BottomBar],
  templateUrl: './app.html',
})
export class App {
  showLayout = signal<boolean>(true);

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // LA ÚNICA LÍNEA QUE CAMBIAMOS: Añadimos la ruta de registro
      if (event.urlAfterRedirects === '/login' || event.urlAfterRedirects === '/restore' || event.urlAfterRedirects === '/registro') {
        this.showLayout.set(false);
      } else {
        this.showLayout.set(true);
      }
    });
  }
}