import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar'; 
import { BottomBar } from './shared/bottom-bar/bottom-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, BottomBar],
  templateUrl: './app.html',
})
export class App {}
