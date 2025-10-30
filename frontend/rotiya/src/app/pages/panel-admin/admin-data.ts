// frontend/rotiya/src/app/pages/panel-admin/admin-data.ts
import { Injectable, signal, effect, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared/auth';
import { Observable, Subscriber } from 'rxjs';

export interface Producto { nombre: string; categoria: string; precio: number; cantidad: number; descripcion: string; img: string; }
export interface Cliente { nombre: string; email: string; telefono: string; }
export interface Empleado { id?: number; nombre: string; rol: string; }
export interface Pedido { fecha: string; cliente: string; detalle: string; total: number; estado: string; }
export interface Resena { productoNombre: string; nombre: string; comentario: string; calificacion: number; fecha: string; }
export interface Usuario { id: number; nombre: string; correo: string; rol: string; }

const LS_KEY = 'rotiya_admin_state_v1';

@Injectable({ providedIn: 'root' })
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
  clientes  = signal<Cliente[]>([]);
  empleados = signal<Empleado[]>([]);
  pedidos   = signal<Pedido[]>([]);
  resenas   = signal<Resena[]>([]);
  allUsers  = signal<Usuario[]>([]);

  // Usuarios: paginación + filtros
  usersPage    = signal<number>(1);
  usersLimit   = signal<number>(10);
  usersHasNext = signal<boolean>(false);
  filtroNombre = signal<string>('');
  filtroRol    = signal<string>('');
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

  private jsonAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    const base: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) base['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(base);
  }

  // ========= USUARIOS (paginación + filtros) =========

  fetchAllUsers(): void {
    if (!this.isBrowser) return;

    const page   = this.usersPage();
    const limit  = this.usersLimit();
    const nombre = this.filtroNombre().trim();
    const rol    = this.filtroRol().trim();

    // Usa 'per_page' con lookahead; cambia a 'limit' si tu API lo requiere.
    const params: any = { page, per_page: limit + 1 };
    if (nombre) params.nombre = nombre;
    if (rol)    params.rol = rol;

    this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, { headers: this.getAuthHeaders(), params })
      .subscribe({
        next: (items) => {
          const hasNext = Array.isArray(items) && items.length > limit;
          this.usersHasNext.set(hasNext);
          this.allUsers.set(hasNext ? items.slice(0, limit) : items);
        },
        error: (err) => {
          console.error('Error al obtener usuarios:', err);
          this.allUsers.set([]);
          this.usersHasNext.set(false);
        }
      });
  }

  /** Update genérico: PUT /usuario/:id con patch parcial (nombre, correo, rol, etc.) */
  updateUsuario(userId: number, patch: Partial<Usuario>): Observable<Usuario> | undefined {
    if (!this.isBrowser) {
      return new Observable((subscriber: Subscriber<any>) => {
        subscriber.error('No es posible actualizar usuario en server-side rendering');
      }) as any;
    }
    return this.http.put<Usuario>(`${this.apiUrl}/usuario/${userId}`, patch, { headers: this.jsonAuthHeaders() });
  }

  /** Atajo específico para rol (compatibilidad con tu llamada existente). */
  updateUserRole(userId: number, newRole: string): Observable<any> | undefined {
    if (!this.isBrowser) {
      return new Observable((subscriber: Subscriber<any>) => {
        subscriber.error('No es posible actualizar el rol en server-side rendering');
      });
    }
    return this.http.put(`${this.apiUrl}/usuario/${userId}`, { rol: newRole }, { headers: this.jsonAuthHeaders() });
  }

  // ========= EMPLEADOS (usa /usuarios y /usuario/:id) =========

  /** Genera una contraseña temporal para alta de empleado (backend requiere 'contraseña'). */
  private genTempPassword(): string {
    const base = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    return `Emp-${base.slice(0,6)}!${Math.floor(Math.random()*10)}`;
  }

  /** GET /usuarios?rol=empleado */
  fetchEmpleados(): void {
    const params = { rol: 'empleado' };
    this.http.get<Empleado[]>(`${this.apiUrl}/usuarios`, { headers: this.getAuthHeaders(), params })
      .subscribe({
        next: (rows) => this.empleados.set(Array.isArray(rows) ? rows : []),
        error: (err) => {
          console.error('Error al obtener empleados (desde /usuarios):', err);
          this.empleados.set([]);
        }
      });
  }

  /** POST /usuarios — alta de empleado (envía 'contraseña' temporal). */
  addEmpleado = (emp: Empleado) => {
    const tempPwd = this.genTempPassword();
    const body: any = { nombre: emp.nombre, rol: emp.rol || 'empleado', 'contraseña': tempPwd };

    this.http.post<Empleado | any>(`${this.apiUrl}/usuarios`, body, { headers: this.jsonAuthHeaders(), observe: 'response' })
      .subscribe({
        next: (resp) => {
          const nuevo = resp.body as Empleado | undefined;
          if (nuevo && (nuevo.id !== undefined && nuevo.id !== null)) {
            this.empleados.update(list => [ ...(list ?? []), nuevo ]);
          } else {
            this.fetchEmpleados();
          }
          alert(`Empleado creado.\nContraseña temporal: ${tempPwd}`);
        },
        error: (err) => {
          console.error('POST /usuarios (alta empleado) falló:', err);
          const status = err?.status;
          const backendMsg = (typeof err?.error === 'string') ? err.error
                           : (err?.error?.message ?? err?.error?.detail ?? JSON.stringify(err?.error));
          alert(`No se pudo crear el empleado (backend).
Status: ${status ?? 'desconocido'}
Mensaje: ${backendMsg ?? 'sin detalle'}
Ruta: POST ${this.apiUrl}/usuarios`);
        }
      });
  };

  /** PUT /usuario/:id — actualizar empleado (recibe índice por compatibilidad con la UI). */
  updateEmpleado = (index: number, emp: Empleado) => {
    const current = this.empleados();
    const target = current?.[index];
    if (!target || !target.id) {
      console.warn('No se encontró el empleado o no tiene id para actualizar.');
      return;
    }

    const body = { nombre: emp.nombre, rol: emp.rol };
    this.http.put<Empleado | any>(`${this.apiUrl}/usuario/${target.id}`, body, { headers: this.jsonAuthHeaders(), observe: 'response' })
      .subscribe({
        next: (resp) => {
          const actualizado = (resp.body as Empleado) ?? { ...target, ...body };
          this.empleados.update(list => {
            const copy = [...(list ?? [])];
            copy[index] = { ...copy[index], ...actualizado };
            return copy;
          });
        },
        error: (err) => {
          console.error('PUT /usuario/:id (empleado) falló:', err);
          const status = err?.status;
          const backendMsg = (typeof err?.error === 'string') ? err.error
                           : (err?.error?.message ?? err?.error?.detail ?? JSON.stringify(err?.error));
          alert(`No se pudo actualizar el empleado (backend).
Status: ${status ?? 'desconocido'}
Mensaje: ${backendMsg ?? 'sin detalle'}
Ruta: PUT ${this.apiUrl}/usuario/${target.id}`);
        }
      });
  };

  /** DELETE /usuario/:id */
  deleteEmpleado = (index: number) => {
    const current = this.empleados();
    const target = current?.[index];
    if (!target || !target.id) {
      console.warn('No se encontró el empleado o no tiene id para borrar.');
      return;
    }

    this.http.delete(`${this.apiUrl}/usuario/${target.id}`, { headers: this.getAuthHeaders(), observe: 'response' })
      .subscribe({
        next: () => {
          this.empleados.update(list => list.filter((_, i) => i !== index));
        },
        error: (err) => {
          console.error('DELETE /usuario/:id (empleado) falló:', err);
          const status = err?.status;
          const backendMsg = (typeof err?.error === 'string') ? err.error
                           : (err?.error?.message ?? err?.error?.detail ?? JSON.stringify(err?.error));
          alert(`No se pudo eliminar el empleado (backend).
Status: ${status ?? 'desconocido'}
Mensaje: ${backendMsg ?? 'sin detalle'}
Ruta: DELETE ${this.apiUrl}/usuario/${target.id}`);
        }
      });
  };

  // ========= Persistencia local (stock/clientes/pedidos/resenas) =========

  private loadState(): void {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.productos)) this.productos.set(parsed.productos);
        if (Array.isArray(parsed.clientes))  this.clientes.set(parsed.clientes);
        if (Array.isArray(parsed.empleados)) this.empleados.set(parsed.empleados);
        if (Array.isArray(parsed.pedidos))   this.pedidos.set(parsed.pedidos);
        if (Array.isArray(parsed.resenas))   this.resenas.set(parsed.resenas);
      } catch (e) { console.warn('No se pudo cargar LS:', e); }
    } else {
      this.productos.set(this.defaultState.productos);
    }
  }

  private saveState(): void {
    if (!this.isBrowser) return;
    const currentState = {
      productos: this.productos(),
      clientes:  this.clientes(),
      empleados: this.empleados(),
      pedidos:   this.pedidos(),
      resenas:   this.resenas()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(currentState));
  }

  // ========= Métodos locales (stock/clientes/pedidos/resenas) =========

  addProducto = (prod: Producto) => this.productos.update(p => [...p, prod]);
  updateProducto = (index: number, prod: Producto) => this.productos.update(p => { p[index] = prod; return [...p]; });
  deleteProducto = (index: number) => this.productos.update(p => p.filter((_, i) => i !== index));

  incrementarCantidad = (index: number) => this.productos.update(p => { p[index].cantidad++; return [...p]; });
  decrementarCantidad = (index: number) => this.productos.update(p => { p[index].cantidad = Math.max(0, p[index].cantidad - 1); return [...p]; });

  addCliente = (cli: Cliente) => this.clientes.update(c => [...c, cli]);
  updateCliente = (index: number, cli: Cliente) => this.clientes.update(c => { c[index] = cli; return [...c]; });
  deleteCliente = (index: number) => this.clientes.update(c => c.filter((_, i) => i !== index));

  updateEstadoPedido = (index: number, nuevoEstado: string) => this.pedidos.update(p => { p[index].estado = nuevoEstado; return [...p]; });
  addResena = (resena: Resena) => this.resenas.update(r => [resena, ...r]);

  // ========= Helpers usuarios: paginación/filtros =========

  setNombreFiltro(valor: string) { this.filtroNombre.set(valor ?? ''); }
  setRolFiltro(valor: string)    { this.filtroRol.set(valor ?? ''); }

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
