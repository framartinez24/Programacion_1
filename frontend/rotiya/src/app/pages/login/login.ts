import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesario para (ngSubmit)

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule], // <-- Asegúrate de que FormsModule esté aquí
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  
  mostrarError = false;

  constructor(private router: Router) {}

  onLogin(): void {
    console.log('Botón presionado. La función onLogin() se ha ejecutado!');
    this.router.navigate(['/menu']);
  }
}

