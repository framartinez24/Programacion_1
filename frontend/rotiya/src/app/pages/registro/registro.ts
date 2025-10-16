import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  registerError: string | null = null;
  registerSuccess: string | null = null;

  constructor() {
    // Definimos la estructura y las validaciones del formulario,
    // usando los nombres de campo que espera tu backend.
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: [''], // Dirección no es obligatoria
      contraseña: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.registerError = null;
    this.registerSuccess = null;

    // Llamamos a la nueva función register() de nuestro servicio
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Si la respuesta tiene un error (por el catchError), lo mostramos
        if (response && response.error) {
          this.registerError = response.error?.mensaje || 'Error desconocido al registrar.';
        } else {
          // Si todo va bien, mostramos un mensaje de éxito y redirigimos
          this.registerSuccess = '¡Registro exitoso! Redirigiendo al login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000); // Esperamos 2 segundos para que el usuario lea el mensaje
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.registerError = err.error?.mensaje || 'Error de conexión. Intente nuevamente.';
      }
    });
  }
}