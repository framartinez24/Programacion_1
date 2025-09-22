import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-bar.html',
  styleUrl: './bottom-bar.scss'
})
export class BottomBar {}
