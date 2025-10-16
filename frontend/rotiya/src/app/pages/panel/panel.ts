import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../shared/auth'; 
import { Admin as PanelAdminComponent } from '../panel-admin/admin';
import { PanelEmpleadoComponent } from '../panel-empleado/panel-empleado';

type PanelView = 'empleado' | 'admin' | 'admin-prompt';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, PanelAdminComponent, PanelEmpleadoComponent],
  templateUrl: './panel.html',
  styleUrl: './panel.scss'
})
export class PanelComponent {
  private authService = inject(AuthService);

  currentView: PanelView;
  adminPasswordInput: string = '';
  authError: string | null = null;
  
  constructor() {
    // LA MAGIA: Al crearse, pregunta por el rol del usuario actual
    const user = this.authService.currentUser();

    if (user && user.rol === 'admin') {
      // Si es admin, empieza directamente en la vista de administrador.
      this.currentView = 'admin';
    } else {
      // De lo contrario (si es empleado o cliente), empieza en la vista de empleado.
      this.currentView = 'empleado';
    }
  }

  // --- El resto de las funciones para escalar de empleado a admin ---
  onAdminPasswordSubmit(): void {
    if (this.adminPasswordInput === '1234') {
      this.currentView = 'admin';
      this.authError = null;
    } else {
      this.authError = 'Contraseña incorrecta.';
    }
    this.adminPasswordInput = '';
  }

  showAdminPrompt(): void {
    this.currentView = 'admin-prompt';
  }

  cancelAdminAccess(): void {
    this.currentView = 'empleado';
    this.authError = null;
  }
}