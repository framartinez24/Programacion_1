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

  // Signals del servicio
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

  // Productos (paginación + filtros) – NUEVO
  prodPage     = this.dataService.prodPage;
  prodLimit    = this.dataService.prodLimit;
  prodHasNext  = this.dataService.prodHasNext;
  prodFiltroNombre    = this.dataService.prodFiltroNombre;
  prodFiltroCategoria = this.dataService.prodFiltroCategoria;

  currentPage: AdminPage = 'stock';

  // Estados de edición (modales)
  editingProducto: Partial<Producto> = {};
  editingProductoIndex: number | null = null;

  editingCliente: Partial<Cliente> = {};
  editingClienteIndex: number | null = null;

  editingEmpleado: Partial<Empleado> = {};
  editingEmpleadoIndex: number | null = null;

  // Modales Bootstrap
  private productoModal: any;
  private clienteModal: any;
  private empleadoModal: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Al cargar, traemos usuarios (como tenías) y productos para stock
    this.dataService.fetchAllUsers();
    this.dataService.fetchProductos();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    if (document.getElementById('modalProducto')) this.productoModal = new bootstrap.Modal('#modalProducto');
    if (document.getElementById('modalCliente'))  this.clienteModal  = new bootstrap.Modal('#modalCliente');
    if (document.getElementById('modalEmpleado')) this.empleadoModal = new bootstrap.Modal('#modalEmpleado');
  }

  // Navegación
  changePage(page: AdminPage): void {
    this.currentPage = page;
    if (page === 'usuarios')  this.dataService.fetchAllUsers();
    if (page === 'empleados') this.dataService.fetchEmpleados();
    if (page === 'stock')     this.dataService.fetchProductos();
  }

  logout(): void { this.authService.logout(); }

  // ===== STOCK (modales + acciones) =====
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

  // ===== CLIENTES (mínimos) =====
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

  saveCliente(form: NgForm): void {
    if (form.invalid) return;
    if (this.editingClienteIndex === null) {
      this.dataService.addCliente(this.editingCliente as any);
    } else {
      this.dataService.updateCliente(this.editingClienteIndex, this.editingCliente as any);
    }
    this.clienteModal?.hide();
    form.resetForm();
  }

  // ===== EMPLEADOS =====
  openEmpleadoModal(index?: number): void {
    if (!this.isBrowser) return;
    if (index === undefined || index === null) {
      this.editingEmpleadoIndex = null;
      this.editingEmpleado = { nombre: '', rol: 'empleado' };
    } else {
      this.editingEmpleadoIndex = index;
      this.editingEmpleado = { ...this.empleados()[index] };
    }
    this.empleadoModal?.show();
  }

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

  onDeleteEmpleado(index: number): void { this.dataService.deleteEmpleado(index); }

  // ===== PEDIDOS =====
  onEstadoPedidoChange(event: Event, index: number): void {
    const select = event.target as HTMLSelectElement;
    const nuevo = select.value;
    this.dataService.updateEstadoPedido(index, nuevo);
  }

  // ===== USUARIOS: rol + edición inline =====
  onRoleChange(user: Usuario, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value;
    if (!confirm(`¿Seguro que deseas cambiar el rol de ${user.nombre} a "${newRole}"?`)) {
      select.value = user.rol;
      return;
    }
    const obs = this.dataService.updateUserRole(user.id, newRole);
    if (obs) {
      obs.subscribe({
        next: () => { user.rol = newRole; },
        error: (err) => {
          console.error('Error al actualizar el rol:', err);
          alert('Error al actualizar el rol.');
          select.value = user.rol;
        }
      });
    }
  }

  onUserUpdate(user: Usuario, field: 'nombre' | 'correo', value: string): void {
    const patch: any = {};
    patch[field] = (value ?? '').trim();
    const obs = this.dataService.updateUsuario(user.id, patch);
    if (obs) {
      obs.subscribe({
        next: (updated) => {
          user.nombre = updated.nombre;
          user.correo = updated.correo;
          user.rol    = updated.rol;
        },
        error: (err) => {
          console.error(`Error al actualizar ${field}:`, err);
          alert(`No se pudo actualizar ${field}.`);
        }
      });
    }
  }

  // ===== Paginación y filtros (Usuarios) =====
  onChangeLimit(v: number): void { this.dataService.setLimit(Number(v)); }
  onPrev(): void { this.dataService.prevPage(); }
  onNext(): void { this.dataService.nextPage(); }
  onGoToPage(p: number): void { this.dataService.goToPage(p); }
  onSetNombre(v: string): void { this.dataService.setNombreFiltro(v); }
  onSetRol(v: string): void    { this.dataService.setRolFiltro(v); }
  onAplicarFiltros(): void     { this.dataService.aplicarFiltros(); }
  onLimpiarFiltros(): void     { this.dataService.limpiarFiltros(); }

  // ===== Paginación y filtros (Productos) – NUEVO =====
  onProdChangeLimit(v: number): void { this.dataService.setProdLimit(Number(v)); }
  onProdPrev(): void { this.dataService.prevProdPage(); }
  onProdNext(): void { this.dataService.nextProdPage(); }
  onProdGoToPage(p: number): void { this.dataService.goToProdPage(p); }
  onProdSetNombre(v: string): void { this.dataService.setProdNombreFiltro(v); }
  onProdSetCategoria(v: string): void { this.dataService.setProdCategoriaFiltro(v); }
  onProdAplicarFiltros(): void { this.dataService.aplicarProdFiltros(); }
  onProdLimpiarFiltros(): void { this.dataService.limpiarProdFiltros(); }
}
