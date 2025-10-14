import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { Router, RouterModule } from '@angular/router'; // Necesario para navegar

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Añadimos los módulos necesarios
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil {
  private router = inject(Router);

  // --- DATOS DEL USUARIO (Ahora viven aquí) ---
  // En un futuro, estos datos vendrían de un servicio de autenticación.
  user = {
    name: 'Franco Martínez',
    email: 'franco@mail.com',
    phone: '+54 261 000 0000',
    location: 'Mendoza, AR',
    avatar: 'https://www.lavanguardia.com/peliculas-series/images/profile/1963/12/w300/1k9MVNS9M3Y4KejBHusNdbGJwRw.jpg'
  };

  addresses = [
    { type: 'Casa', details: 'Av. Principal 123, Mendoza' },
    { type: 'Trabajo', details: 'Parque TIC, Godoy Cruz' }
  ];

  paymentMethods = [
    { type: 'Visa', lastFour: '1234', expires: '08/27', isDefault: true },
    { type: 'Mastercard', lastFour: '5678', expires: '03/26', isDefault: false }
  ];

  orderHistory = [
    { id: '#1024', date: '03/08/2025', details: 'Empanadas x12, Nachos con salsa', total: 22.98 },
    { id: '#1017', date: '28/07/2025', details: 'Pollo a la parrilla', total: 15.00 },
    { id: '#1009', date: '15/07/2025', details: 'Empanadas de carne', total: 12.99 }
  ];

  // --- FUNCIONES DEL COMPONENTE ---

  savePersonalData(): void {
    // Por ahora, solo mostramos una alerta para simular que se guardó.
    // En el futuro, esto llamaría a un servicio para actualizar los datos en el backend.
    console.log('Guardando datos:', this.user);
    alert('¡Datos guardados con éxito!');
  }

  logout(): void {
    // Simulamos el cierre de sesión y redirigimos al login.
    console.log('Cerrando sesión...');
    this.router.navigate(['/login']);
  }
}