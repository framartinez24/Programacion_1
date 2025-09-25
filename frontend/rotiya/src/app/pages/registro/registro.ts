import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  // ¡Reutilizamos los estilos del login para mantener la consistencia!
  styleUrls: ['../login/login.scss'],
  imports: [RouterModule, FormsModule],
  templateUrl: './registro.html',
})
export class Registro {

  constructor(private router: Router) {}

  onRegister(): void {
    console.log('Formulario de registro enviado.');
    // Usamos un alert temporal para confirmar que el registro funcionó
    alert('¡Registro exitoso! Ahora puedes iniciar sesión con tu nueva cuenta.');
    // Redirigimos al usuario a la página de login
    this.router.navigate(['/login']);
  }
}