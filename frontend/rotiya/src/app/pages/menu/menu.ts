import { Component } from '@angular/core';
import { MenuCategories } from '../../shared/menu-categories/menu-categories';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MenuCategories],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {}
