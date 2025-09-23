import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu-categories',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-categories.html'
})
export class MenuCategoriesComponent {}
