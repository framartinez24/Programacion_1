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
      { nombre:'Empanadas de carne', categoria:'Entrada', precio:12.99, cantidad:20, descripcion: 'Carne vacuna envuelta en masa criolla, cocinada al horno de barro.', img: 'https://www.bekiacocina.com/images/cocina/0000/265-h.jpg' },
      { nombre:'Bruschettas', categoria:'Entrada', precio:8.50, cantidad:30, descripcion: 'Rebanadas de pan tostado con tomate, ajo, albahaca y aceite de oliva.', img: 'https://www.clarin.com/img/2022/12/22/UwCUEP0SQ_1256x620__1.jpg' },
      { nombre:'Ensalada Caprese', categoria:'Entrada', precio:10.00, cantidad:25, descripcion: 'Rodajas de tomate fresco, mozzarella y albahaca, con aceite de oliva.', img: 'https://www.huleymantel.com/uploads/s1/36/17/28/ensalada-caprese-tomates-maduros-queso-mozzarella-hojas-albahaca-fresca-166116-3714_4_1000x563.jpeg' },
      { nombre:'Pollo a la parrilla', categoria:'Plato principal', precio:15.00, cantidad:10, descripcion: 'Jugoso pollo marinado y cocido lentamente a la parrilla.', img: 'https://www.paulinacocina.net/wp-content/uploads/2021/11/pollo-asado.jpg.webp' },
      { nombre: 'Milanesa a la Napolitana', categoria:'Plato principal', precio: 18.50, cantidad: 15, descripcion: 'Clásica milanesa de ternera cubierta con salsa de tomate, jamón y queso mozzarella.', img: 'https://www.lanacion.com.ar/resizer/v2/milanesa-a-la-napolitana-con-guarnicion-de-papas-VLWFAANIWBGPFO4CSUHS7RYVVQ.jpg?auth=335fda04cf2733e39d11ca0ba979c1d0a8a55e6cdec15e4d5b00cfd59fbf9ed8&width=880&height=586&quality=70&smart=true'},
      { nombre: 'Pastel de Papas', categoria:'Plato principal', precio: 16.00, cantidad: 12, descripcion: 'Un clásico argentino con carne molida sazonada cubierta de puré de papas gratinado.', img: 'https://www.lanacion.com.ar/resizer/v2/pastel-de-papas-vegetariano-con-soja-PC6FZPDGUFGNNJI34UJX6SUBIA.jpg?auth=5828873b44a921fbd2caa59b1388b209a7ce7d4754dbf76b59064e844b40df36&width=880&height=586&quality=70&smart=true'},
      { nombre:'Cheesecake de frutos rojos', categoria:'Postres', precio:6.99, cantidad:18, descripcion: 'Base de galletas, crema suave y coulis de frutos del bosque.', img: 'https://www.paulinacocina.net/wp-content/uploads/2025/01/receta-de-cheesecake-1742898428.jpg.webp' },
      { nombre:'Brownie con helado', categoria:'Postres', precio:5.50, cantidad:22, descripcion: 'Brownie tibio de chocolate con bocha de helado de vainilla.', img: 'https://s3-api-arcor.apps-webs.com/chocoaguila/archivos/recetas/receta-10100.webp' },
      { nombre:'Flan casero', categoria:'Postres', precio:4.20, cantidad:30, descripcion: 'Clásico flan de vainilla con caramelo y crema.', img: 'https://vinomanos.com/wp-content/uploads/2020/04/Flan-casero-argentino.jpg.webp' },
      { nombre:'Limonada casera', categoria:'Bebidas', precio:3.50, cantidad:40, descripcion: 'Refrescante limonada con jugo natural de limón y menta fresca.', img: 'https://www.splenda.com/wp-content/themes/bistrotheme/assets/recipe-images/homemade-mint-lemonade-2000w.jpg' },
      { nombre:'Cerveza artesanal', categoria:'Bebidas', precio:4.80, cantidad:50, descripcion: 'Cerveza rubia elaborada localmente con malta seleccionada.', img: 'https://www.infobae.com/resizer/v2/https%3A%2F%2Fs3.amazonaws.com%2Farc-wordpress-client-uploads%2Finfobae-wp%2Fwp-content%2Fuploads%2F2017%2F07%2F06123915%2Fcerveza-1920-2.jpg?auth=fa59af8ab8767172c348d67c2d7e376fbce5c6cf943df35c0070347b7ccb989d&smart=true&width=992&height=558&quality=85' },
      { nombre:'Café espresso', categoria:'Bebidas', precio:2.20, cantidad:60, descripcion: 'Café intenso preparado con granos seleccionados recién molidos.', img: 'https://www.novachef.es/media/images/espresso-macchiato.jpg' }
    ],
    clientes: [ { nombre:'Laura', email:'laura@mail.com', telefono:'+54 261 000 0001' }, { nombre:'Roberto', email:'roberto@mail.com', telefono:'+54 261 000 0002' }, { nombre:'Lautaro', email:'lautaro@mail.com', telefono:'+54 261 000 0003' } ],
    empleados: [ { nombre:'Laura', rol:'Cocina' }, { nombre:'Roberto', rol:'Delivery' }, { nombre:'Lautaro', rol:'Atención' } ],
    pedidos: [ { fecha:'2025-08-09 15:00', cliente:'Laura', detalle:'Pollo a la parrilla, Empanadas de carne', total:27.99, estado:'Entregado' }, { fecha:'2025-08-09 12:00', cliente:'Roberto', detalle:'Nachos con salsa', total:9.99, estado:'Pendiente' } ],
    resenas: [ { productoNombre: 'Pollo a la parrilla', nombre: 'Carlos M.', comentario: '¡El pollo a la parrilla es espectacular!', calificacion: 5, fecha: '2025-10-05' } ]
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
