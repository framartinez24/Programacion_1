import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Importamos los dos componentes que este "portero" puede mostrar
// Usamos "as" para darle un alias más claro al componente Admin
import { Admin as PanelAdminComponent } from '../panel-admin/admin';
import { PanelEmpleadoComponent } from '../panel-empleado/panel-empleado';

// Definimos los posibles estados de la vista interna
type PanelView = 'empleado' | 'admin' | 'admin-prompt';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, PanelAdminComponent, PanelEmpleadoComponent],
  templateUrl: './panel.html', // Usando tu convención de nombres
  styleUrl: './panel.scss'     // Usando tu convención de nombres
})
export class PanelComponent {
  // Simulamos el rol inicial. Empezamos como 'empleado' para probar el flujo completo.
  initialRole: 'admin' | 'empleado' = 'empleado';
  
  currentView: PanelView = this.initialRole;

  adminPasswordInput: string = '';
  authError: string | null = null;
  
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