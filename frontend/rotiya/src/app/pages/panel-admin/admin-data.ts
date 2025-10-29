// frontend/rotiya/src/app/pages/panel-admin/admin-data.ts
import { Injectable, signal, effect, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared/auth';
import { Observable, Subscriber, tap } from 'rxjs'; // Importamos Subscriber y Observable

// Interfaces para tipado fuerte
export interface Producto { nombre: string; categoria: string; precio: number; cantidad: number; descripcion: string; img: string; }
export interface Cliente { nombre: string; email: string; telefono: string; }
export interface Empleado { nombre: string; rol: string; }
export interface Pedido { fecha: string; cliente: string; detalle: string; total: number; estado: string; }
export interface Resena { productoNombre: string; nombre: string; comentario: string; calificacion: number; fecha: string; }
export interface Usuario { id: number; nombre: string; correo: string; rol: string; }

const LS_KEY = 'rotiya_admin_state_v1';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private isBrowser: boolean;
  private apiUrl = 'http://127.0.0.1:3535';

  private readonly defaultState = {
    productos: [
      { nombre:'Empanadas de carne', categoria:'Entrada', precio:12.50, cantidad:15, descripcion:'Empanadas tradicionales mendocinas con carne cortada a cuchillo.', img:'https://www.bekiacocina.com/images/cocina/0000/265-h.jpg' },
      { nombre:'Bruschettas', categoria:'Entrada', precio:8.50, cantidad:10, descripcion:'Pan tostado con tomate, ajo y albahaca fresca.', img:'https://www.clarin.com/img/2022/12/22/UwCUEP0SQ_1256x620__1.jpg' },
      { nombre:'Ensalada Caprese', categoria:'Entrada', precio:10.00, cantidad:12, descripcion:'Tomate, mozzarella, albahaca y aceite de oliva.', img:'https://www.huleymantel.com/uploads/s1/36/17/28/ensalada-caprese.jpg' }
    ],
    clientes: [],
    empleados: [],
    pedidos: [],
    resenas: []
  };
  
  productos = signal<Producto[]>([]);
  clientes = signal<Cliente[]>([]);
  empleados = signal<Empleado[]>([]);
  pedidos = signal<Pedido[]>([]);
  resenas = signal<Resena[]>([]);
  allUsers = signal<Usuario[]>([]);
  // Estado de paginación y filtros para Usuarios
  usersPage = signal<number>(1);
  usersLimit = signal<number>(10);
  usersHasNext = signal<boolean>(false);
  filtroNombre = signal<string>('');
  filtroRol = signal<string>(''); // mapeo del requisito 'porCategoria' -> 'rol'
  estadosPedido = ['Pendiente','En preparación','En reparto','Entregado','Cancelado'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadState();
      effect(() => this.saveState());
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // ---------------------------
  //   USUARIOS (Backend)
  // ---------------------------

  /**
   * Carga usuarios desde backend con paginación y filtros.
   * Mantenemos el nombre para compatibilidad con el componente (mínimos cambios).
   * Mapea 'limit' -> 'per_page' porque el backend expone 'per_page'.
   * Implementa "lookahead" (per_page = limit + 1) para saber si hay siguiente página,
   * ya que el backend no envía 'total'.
   */
  fetchAllUsers(): void {
    if (!this.isBrowser) return;

    const page = this.usersPage();
    const limit = this.usersLimit();
    const nombre = this.filtroNombre().trim();
    const rol = this.filtroRol().trim();

    let params: any = { page, per_page: limit + 1 }; // lookahead

    if (nombre) params.nombre = nombre;
    if (rol) params.rol = rol;

    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { headers: this.getAuthHeaders(), params })
      .subscribe({
        next: (items) => {
          const hasNext = Array.isArray(items) && items.length > limit;
          this.usersHasNext.set(hasNext);
          const pageItems = hasNext ? items.slice(0, limit) : items;
          this.allUsers.set(pageItems);
        },
        error: (err) => {
          console.error('Error al obtener usuarios:', err);
          this.allUsers.set([]);
          this.usersHasNext.set(false);
        }
      });
  }

  // --- FUNCIÓN CORREGIDA ---
  updateUserRole(userId: number, newRole: string): Observable<any> | undefined {
    if (!this.isBrowser) {
      return new Observable((subscriber: Subscriber<any>) => {
        subscriber.error('No es posible actualizar el rol en server-side rendering');
      });
    }
    return this.http.put(`${this.apiUrl}/usuario/${userId}`, { rol: newRole }, { headers: this.getAuthHeaders() });
  }

  // ---------------------------
  //  PERSISTENCIA LOCAL (stock, etc.) — sin cambios estructurales
  // ---------------------------
  private loadState(): void {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.productos)) this.productos.set(parsed.productos);
        if (Array.isArray(parsed.clientes)) this.clientes.set(parsed.clientes);
        if (Array.isArray(parsed.empleados)) this.empleados.set(parsed.empleados);
        if (Array.isArray(parsed.pedidos)) this.pedidos.set(parsed.pedidos);
        if (Array.isArray(parsed.resenas)) this.resenas.set(parsed.resenas);
      } catch (e) { console.warn('No se pudo cargar LS:', e); }
    } else {
      // Seed mínimo
      this.productos.set(this.defaultState.productos);
    }
  }

  private saveState(): void {
    if (!this.isBrowser) return;
    const currentState = {
      productos: this.productos(),
      clientes: this.clientes(),
      empleados: this.empleados(),
      pedidos: this.pedidos(),
      resenas: this.resenas()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(currentState));
  }

  addProducto = (prod: Producto) => this.productos.update(p => [...p, prod]);
  updateProducto = (index: number, prod: Producto) => this.productos.update(p => { p[index] = prod; return [...p]; });
  deleteProducto = (index: number) => this.productos.update(p => p.filter((_, i) => i !== index));
  incrementarCantidad = (index: number) => this.productos.update(p => { p[index].cantidad++; return [...p]; });
  decrementarCantidad = (index: number) => this.productos.update(p => { p[index].cantidad = Math.max(0, p[index].cantidad - 1); return [...p]; });

  addCliente = (cli: Cliente) => this.clientes.update(c => [...c, cli]);
  updateCliente = (index: number, cli: Cliente) => this.clientes.update(c => { c[index] = cli; return [...c]; });
  deleteCliente = (index: number) => this.clientes.update(c => c.filter((_, i) => i !== index));

  addEmpleado = (emp: Empleado) => this.empleados.update(e => [...e, emp]);
  updateEmpleado = (index: number, emp: Empleado) => this.empleados.update(e => { e[index] = emp; return [...e]; });
  deleteEmpleado = (index: number) => this.empleados.update(e => e.filter((_, i) => i !== index));

  updateEstadoPedido = (index: number, nuevoEstado: string) => this.pedidos.update(p => { p[index].estado = nuevoEstado; return [...p]; });
  addResena = (resena: Resena) => this.resenas.update(r => [resena, ...r]);

  // --- Helpers de paginación y filtros (llamados desde el componente) ---
  setNombreFiltro(valor: string) { this.filtroNombre.set(valor ?? ''); }
  setRolFiltro(valor: string) { this.filtroRol.set(valor ?? ''); }

  setLimit(valor: number) {
    const v = Number(valor) || 10;
    this.usersLimit.set(v);
    this.usersPage.set(1);
    this.fetchAllUsers();
  }

  goToPage(p: number) {
    const page = Math.max(1, Math.floor(p));
    this.usersPage.set(page);
    this.fetchAllUsers();
  }

  nextPage() {
    if (this.usersHasNext()) {
      this.usersPage.set(this.usersPage() + 1);
      this.fetchAllUsers();
    }
  }

  prevPage() {
    if (this.usersPage() > 1) {
      this.usersPage.set(this.usersPage() - 1);
      this.fetchAllUsers();
    }
  }

  aplicarFiltros() {
    this.usersPage.set(1);
    this.fetchAllUsers();
  }

  limpiarFiltros() {
    this.filtroNombre.set('');
    this.filtroRol.set('');
    this.usersPage.set(1);
    this.fetchAllUsers();
  }
}
