import { Component, Output, EventEmitter, inject, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminDataService, Cliente } from '../panel-admin/admin-data';

declare var bootstrap: any;
type EmpleadoPage = 'pedidos' | 'clientes' | 'stock';

@Component({
  selector: 'app-panel-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-empleado.html',
  styleUrl: './panel-empleado.scss'
})
export class PanelEmpleadoComponent implements AfterViewInit {
  private dataService = inject(AdminDataService);
  private router = inject(Router);
  private isBrowser: boolean;

  pedidos = this.dataService.pedidos;
  clientes = this.dataService.clientes;
  productos = this.dataService.productos;
  estadosPedido = this.dataService.estadosPedido;
  currentPage: EmpleadoPage = 'pedidos';

  // --- Propiedades para el modal de Cliente ---
  editingCliente: Partial<Cliente> = {};
  editingClienteIndex: number | null = null;
  private clienteModal: any;

  @Output() requestAdminAccess = new EventEmitter<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser && document.getElementById('modalClienteEmpleado')) {
      this.clienteModal = new bootstrap.Modal('#modalClienteEmpleado');
    }
  }

  // --- Lógica para el modal de Cliente ---
  openClienteModal(index: number) {
    this.editingCliente = { ...this.clientes()[index] };
    this.editingClienteIndex = index;
    this.clienteModal.show();
  }

  saveCliente(form: NgForm) {
    if (form.invalid) return;
    if (this.editingClienteIndex !== null) {
      const clienteData = { ...this.editingCliente } as Cliente;
      this.dataService.updateCliente(this.editingClienteIndex, clienteData);
    }
    this.clienteModal.hide();
    form.reset();
  }

  // --- Lógica de los botones de la tabla ---
  onDeleteCliente(index: number): void {
    if (confirm('¿Bloquear (eliminar) a este cliente?')) {
      this.dataService.deleteCliente(index);
    }
  }

  solicitarAccesoAdmin(): void {
    this.requestAdminAccess.emit();
  }
  
  changePage(page: EmpleadoPage): void {
    this.currentPage = page;
  }

  onEstadoPedidoChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    this.dataService.updateEstadoPedido(index, selectElement.value);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}