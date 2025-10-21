import { Component, inject, AfterViewInit, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../shared/auth';
import { AdminDataService, Producto, Cliente, Empleado, Usuario } from './admin-data';

declare var bootstrap: any;
type AdminPage = 'stock' | 'usuarios' | 'pedidos' | 'empleados';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements AfterViewInit, OnInit {
  private dataService = inject(AdminDataService);
  private authService = inject(AuthService);
  private isBrowser: boolean;

  productos = this.dataService.productos;
  allUsers = this.dataService.allUsers;
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

  ngOnInit() {
    this.dataService.fetchAllUsers();
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      if (document.getElementById('modalProducto')) this.productoModal = new bootstrap.Modal('#modalProducto');
      if (document.getElementById('modalCliente')) this.clienteModal = new bootstrap.Modal('#modalCliente');
      if (document.getElementById('modalEmpleado')) this.empleadoModal = new bootstrap.Modal('#modalEmpleado');
    }
  }

  logout(): void {
    this.authService.logout();
  }

  // --- FUNCIÓN CORREGIDA ---
  onRoleChange(user: Usuario, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newRole = selectElement.value;
    if (confirm(`¿Estás seguro de que quieres cambiar el rol de ${user.nombre} a ${newRole}?`)) {
      // 1. Guardamos la llamada en una variable
      const updateCall = this.dataService.updateUserRole(user.id, newRole);
      // 2. Solo nos suscribimos si la llamada no es undefined
      if (updateCall) {
        updateCall.subscribe({
          next: () => {
            console.log(`Rol de ${user.nombre} actualizado a ${newRole}`);
          },
          // 3. Añadimos el tipo 'any' al error para solucionar el problema
          error: (err: any) => {
            console.error('Error al actualizar el rol:', err);
            selectElement.value = user.rol;
            alert('Error al actualizar el rol. Asegúrate de tener permisos de administrador.');
          }
        });
      }
    } else {
      selectElement.value = user.rol;
    }
  }
  
  // --- El resto de tus funciones no cambian ---
  saveProducto(form: NgForm) { if (form.invalid) return; const productoData = { ...this.editingProducto } as Producto; if (this.editingProductoIndex !== null) { this.dataService.updateProducto(this.editingProductoIndex, productoData); } else { this.dataService.addProducto(productoData); } this.productoModal.hide(); form.reset(); }
  saveCliente(form: NgForm) { if (form.invalid) return; const clienteData = { ...this.editingCliente } as Cliente; if (this.editingClienteIndex !== null) { this.dataService.updateCliente(this.editingClienteIndex, clienteData); } else { this.dataService.addCliente(clienteData); } this.clienteModal.hide(); form.reset(); }
  saveEmpleado(form: NgForm) { if (form.invalid) return; const empleadoData = { ...this.editingEmpleado } as Empleado; if (this.editingEmpleadoIndex !== null) { this.dataService.updateEmpleado(this.editingEmpleadoIndex, empleadoData); } else { this.dataService.addEmpleado(empleadoData); } this.empleadoModal.hide(); form.reset(); }
  openProductoModal(index?: number) { if (index !== undefined) { this.editingProducto = { ...this.productos()[index] }; this.editingProductoIndex = index; } else { this.editingProducto = { categoria: 'Entrada', descripcion: '', img: '' }; this.editingProductoIndex = null; } this.productoModal.show(); }
  openClienteModal(index?: number) { if (index !== undefined) { this.editingCliente = { ...this.clientes()[index] }; this.editingClienteIndex = index; } else { this.editingCliente = {}; this.editingClienteIndex = null; } this.clienteModal.show(); }
  openEmpleadoModal(index?: number) { if (index !== undefined) { this.editingEmpleado = { ...this.empleados()[index] }; this.editingEmpleadoIndex = index; } else { this.editingEmpleado = {}; this.editingEmpleadoIndex = null; } this.empleadoModal.show(); }
  changePage(page: AdminPage): void { this.currentPage = page; }
  onDeleteProducto(index: number): void { if (confirm('¿Eliminar producto?')) this.dataService.deleteProducto(index); }
  onIncrementarCantidad = (index: number) => this.dataService.incrementarCantidad(index);
  onDecrementarCantidad = (index: number) => this.dataService.decrementarCantidad(index);
  onDeleteCliente(index: number): void { if (confirm('¿Eliminar cliente?')) this.dataService.deleteCliente(index); }
  onDeleteEmpleado(index: number): void { if (confirm('¿Eliminar empleado?')) this.dataService.deleteEmpleado(index); }
  onEstadoPedidoChange(event: Event, index: number): void { const selectElement = event.target as HTMLSelectElement; this.dataService.updateEstadoPedido(index, selectElement.value); }
}