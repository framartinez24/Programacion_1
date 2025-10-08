import { Component, inject, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router'; // <-- Importar el Router
import { AdminDataService, Producto, Cliente, Empleado } from './admin-data';

declare var bootstrap: any;
type AdminPage = 'stock' | 'clientes' | 'pedidos' | 'empleados';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements AfterViewInit {
  private dataService = inject(AdminDataService);
  private router = inject(Router); // <-- Inyectar el Router
  private isBrowser: boolean;

  productos = this.dataService.productos;
  clientes = this.dataService.clientes;
  pedidos = this.dataService.pedidos;
  empleados = this.dataService.empleados;
  estadosPedido = this.dataService.estadosPedido;

  currentPage: AdminPage = 'stock';

  editingProducto: Partial<Producto> = {};
  editingProductoIndex: number | null = null;
  editingCliente: Partial<Cliente> = {};
  editingClienteIndex: number | null = null;
  editingEmpleado: Partial<Empleado> = {};
  editingEmpleadoIndex: number | null = null;

  private productoModal: any;
  private clienteModal: any;
  private empleadoModal: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      if (document.getElementById('modalProducto')) this.productoModal = new bootstrap.Modal('#modalProducto');
      if (document.getElementById('modalCliente')) this.clienteModal = new bootstrap.Modal('#modalCliente');
      if (document.getElementById('modalEmpleado')) this.empleadoModal = new bootstrap.Modal('#modalEmpleado');
    }
  }

  // --- Nueva función ---
  logout(): void {
    this.router.navigate(['/login']);
  }

  // --- Funciones de guardado CORREGIDAS ---
  saveProducto(form: NgForm) {
    if (form.invalid) return;
    const productoData = { ...this.editingProducto } as Producto;
    if (this.editingProductoIndex !== null) {
      this.dataService.updateProducto(this.editingProductoIndex, productoData);
    } else {
      this.dataService.addProducto(productoData);
    }
    this.productoModal.hide();
    form.reset();
  }
  
  saveCliente(form: NgForm) {
    if (form.invalid) return;
    const clienteData = { ...this.editingCliente } as Cliente;
    if (this.editingClienteIndex !== null) {
      this.dataService.updateCliente(this.editingClienteIndex, clienteData);
    } else {
      this.dataService.addCliente(clienteData);
    }
    this.clienteModal.hide();
    form.reset();
  }
  
  saveEmpleado(form: NgForm) {
    if (form.invalid) return;
    const empleadoData = { ...this.editingEmpleado } as Empleado;
    if (this.editingEmpleadoIndex !== null) {
      this.dataService.updateEmpleado(this.editingEmpleadoIndex, empleadoData);
    } else {
      this.dataService.addEmpleado(empleadoData);
    }
    this.empleadoModal.hide();
    form.reset();
  }

  // --- Funciones de abrir modales ---
  openProductoModal(index?: number) {
    if (index !== undefined) {
      this.editingProducto = { ...this.productos()[index] };
      this.editingProductoIndex = index;
    } else {
      this.editingProducto = { categoria: 'Entrada' };
      this.editingProductoIndex = null;
    }
    this.productoModal.show();
  }
  openClienteModal(index?: number) {
    if (index !== undefined) {
      this.editingCliente = { ...this.clientes()[index] };
      this.editingClienteIndex = index;
    } else {
      this.editingCliente = {};
      this.editingClienteIndex = null;
    }
    this.clienteModal.show();
  }
  openEmpleadoModal(index?: number) {
    if (index !== undefined) {
      this.editingEmpleado = { ...this.empleados()[index] };
      this.editingEmpleadoIndex = index;
    } else {
      this.editingEmpleado = {};
      this.editingEmpleadoIndex = null;
    }
    this.empleadoModal.show();
  }

  // --- Resto de funciones ---
  changePage(page: AdminPage): void { this.currentPage = page; }
  onDeleteProducto(index: number): void { if (confirm('¿Eliminar producto?')) this.dataService.deleteProducto(index); }
  onIncrementarCantidad = (index: number) => this.dataService.incrementarCantidad(index);
  onDecrementarCantidad = (index: number) => this.dataService.decrementarCantidad(index);
  onDeleteCliente(index: number): void { if (confirm('¿Eliminar cliente?')) this.dataService.deleteCliente(index); }
  onDeleteEmpleado(index: number): void { if (confirm('¿Eliminar empleado?')) this.dataService.deleteEmpleado(index); }
  onEstadoPedidoChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    this.dataService.updateEstadoPedido(index, selectElement.value);
  }
}