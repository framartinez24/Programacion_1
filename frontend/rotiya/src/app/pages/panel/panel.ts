import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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