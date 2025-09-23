import { Component } from '@angular/core';
import { MenuCategoriesComponent } from '../../shared/menu-categories/menu-categories';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MenuCategoriesComponent],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {}
