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
export class Admin implements OnInit, AfterViewInit {
  private dataService = inject(AdminDataService);
  private authService = inject(AuthService);
  private isBrowser: boolean;

  // Signals/estado que ya expone el servicio
  productos = this.dataService.productos;
  clientes  = this.dataService.clientes;
  empleados = this.dataService.empleados;
  pedidos   = this.dataService.pedidos;
  resenas   = this.dataService.resenas;
  estadosPedido = this.dataService.estadosPedido;

  // Usuarios (paginación + filtros)
  allUsers     = this.dataService.allUsers;
  usersPage    = this.dataService.usersPage;
  usersLimit   = this.dataService.usersLimit;
  usersHasNext = this.dataService.usersHasNext;
  filtroNombre = this.dataService.filtroNombre;
  filtroRol    = this.dataService.filtroRol;

  // Navegación actual del panel
  currentPage: AdminPage = 'stock';

  // Estados de edición (stock/clientes/empleados) — ya los usabas en tus modales
  editingProducto: Partial<Producto> = {};
  editingProductoIndex: number | null = null;

  editingCliente: Partial<Cliente> = {};
  editingClienteIndex: number | null = null;

  editingEmpleado: Partial<Empleado> = {};
  editingEmpleadoIndex: number | null = null;

  // Instancias de modales Bootstrap
  private productoModal: any;
  private clienteModal: any;
  private empleadoModal: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // -------------------------
  //   Ciclo de vida
  // -------------------------
  ngOnInit(): void {
    // Cargar usuarios inicial (respetamos el nombre original del método)
    this.dataService.fetchAllUsers();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    if (document.getElementById('modalProducto')) this.productoModal = new bootstrap.Modal('#modalProducto');
    if (document.getElementById('modalCliente'))  this.clienteModal  = new bootstrap.Modal('#modalCliente');
    if (document.getElementById('modalEmpleado')) this.empleadoModal = new bootstrap.Modal('#modalEmpleado');
  }

  // -------------------------
  //   Navegación del panel
  // -------------------------
  /** Firma exacta que espera el template: (click)="changePage('stock')" */
  changePage(page: AdminPage): void {
    this.currentPage = page;
    // Si entramos a Usuarios, aseguramos datos frescos
    if (page === 'usuarios') {
      this.dataService.fetchAllUsers();
    }
  }

  logout(): void {
    this.authService.logout(); // asumiendo que ya lo tenías implementado
  }

  // -------------------------
  //   STOCK (helpers mínimos)
  // -------------------------
  openProductoModal(index?: number): void {
    if (!this.isBrowser) return;
    if (index === undefined || index === null) {
      this.editingProductoIndex = null;
      this.editingProducto = { nombre: '', descripcion: '', img: '', categoria: '', precio: 0, cantidad: 0 };
    } else {
      this.editingProductoIndex = index;
      this.editingProducto = { ...this.productos()[index] };
    }
    this.productoModal?.show();
  }

  saveProducto(form: NgForm): void {
    if (form.invalid) return;
    if (this.editingProductoIndex === null) {
      this.dataService.addProducto(this.editingProducto as Producto);
    } else {
      this.dataService.updateProducto(this.editingProductoIndex, this.editingProducto as Producto);
    }
    this.productoModal?.hide();
    form.resetForm();
  }

  onIncrementarCantidad(i: number): void { this.dataService.incrementarCantidad(i); }
  onDecrementarCantidad(i: number): void { this.dataService.decrementarCantidad(i); }
  onDeleteProducto(i: number): void     { this.dataService.deleteProducto(i); }

  // -------------------------
  //   CLIENTES (modales)
  // -------------------------
  openClienteModal(index?: number): void {
    if (!this.isBrowser) return;
    if (index === undefined || index === null) {
      this.editingClienteIndex = null;
      this.editingCliente = { nombre: '', email: '', telefono: '' };
    } else {
      this.editingClienteIndex = index;
      this.editingCliente = { ...this.clientes()[index] };
    }
    this.clienteModal?.show();
  }

  /** Firma exacta usada en el template: (ngSubmit)="saveCliente(clienteForm)" */
  saveCliente(form: NgForm): void {
    if (form.invalid) return;
    if (this.editingClienteIndex === null) {
      this.dataService.addCliente(this.editingCliente as Cliente);
    } else {
      this.dataService.updateCliente(this.editingClienteIndex, this.editingCliente as Cliente);
    }
    this.clienteModal?.hide();
    form.resetForm();
  }

  // -------------------------
  //   EMPLEADOS (modales)
  // -------------------------
  /** Firma exacta usada en el template: (click)="openEmpleadoModal()" y (click)="openEmpleadoModal(i)" */
  openEmpleadoModal(index?: number): void {
    if (!this.isBrowser) return;
    if (index === undefined || index === null) {
      this.editingEmpleadoIndex = null;
      this.editingEmpleado = { nombre: '', rol: '' };
    } else {
      this.editingEmpleadoIndex = index;
      this.editingEmpleado = { ...this.empleados()[index] };
    }
    this.empleadoModal?.show();
  }

  /** Firma exacta usada en el template: (ngSubmit)="saveEmpleado(empleadoForm)" */
  saveEmpleado(form: NgForm): void {
    if (form.invalid) return;
    if (this.editingEmpleadoIndex === null) {
      this.dataService.addEmpleado(this.editingEmpleado as Empleado);
    } else {
      this.dataService.updateEmpleado(this.editingEmpleadoIndex, this.editingEmpleado as Empleado);
    }
    this.empleadoModal?.hide();
    form.resetForm();
  }

  /** Firma exacta usada en el template: (click)="onDeleteEmpleado(i)" */
  onDeleteEmpleado(index: number): void {
    this.dataService.deleteEmpleado(index);
  }

  // -------------------------
  //   PEDIDOS
  // -------------------------
  /** Firma exacta usada en el template: (change)="onEstadoPedidoChange($event, i)" */
  onEstadoPedidoChange(event: Event, index: number): void {
    const select = event.target as HTMLSelectElement;
    const nuevo = select.value;
    this.dataService.updateEstadoPedido(index, nuevo);
  }

  // -------------------------
  //   USUARIOS: rol, paginación, filtros
  // -------------------------
  /**
   * Firma exacta usada en el template:
   * (change)="onRoleChange(user, $event)"
   */
  onRoleChange(user: Usuario, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value;

    if (!confirm(`¿Seguro que deseas cambiar el rol de ${user.nombre} a "${newRole}"?`)) {
      // revierto visual si cancela
      select.value = user.rol;
      return;
    }

    const obs = this.dataService.updateUserRole(user.id, newRole);
    if (obs) {
      obs.subscribe({
        next: () => { user.rol = newRole; },
        error: (err) => {
          console.error('Error al actualizar el rol:', err);
          alert('Error al actualizar el rol. Asegúrate de tener permisos de administrador.');
          select.value = user.rol;
        }
      });
    }
  }

  // Paginación (firmas llamadas por el HTML)
  onChangeLimit(v: number): void { this.dataService.setLimit(Number(v)); }
  onPrev(): void { this.dataService.prevPage(); }
  onNext(): void { this.dataService.nextPage(); }
  onGoToPage(p: number): void { this.dataService.goToPage(p); }

  // Filtros (firmas llamadas por el HTML)
  onSetNombre(v: string): void { this.dataService.setNombreFiltro(v); }
  onSetRol(v: string): void    { this.dataService.setRolFiltro(v); }
  onAplicarFiltros(): void     { this.dataService.aplicarFiltros(); }
  onLimpiarFiltros(): void     { this.dataService.limpiarFiltros(); }
}
