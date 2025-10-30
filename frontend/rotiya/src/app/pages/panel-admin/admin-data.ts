// frontend/rotiya/src/app/pages/panel-admin/admin-data.ts
import { Injectable, signal, effect, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared/auth';
import { Observable, Subscriber } from 'rxjs';

// ▲ Producto ahora con id opcional para mapear con DB/app.db
export interface Producto {
  id?: number;
  nombre: string;
  categoria: string;
  precio: number;
  cantidad: number;
  descripcion: string;
  img: string;
}
export interface Cliente  { nombre: string; email: string; telefono: string; }
export interface Empleado { id?: number; nombre: string; rol: string; }
export interface Pedido   { fecha: string; cliente: string; detalle: string; total: number; estado: string; }
export interface Resena   { productoNombre: string; nombre: string; comentario: string; calificacion: number; fecha: string; }
export interface Usuario  { id: number; nombre: string; correo: string; rol: string; }

const LS_KEY = 'rotiya_admin_state_v1';

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private isBrowser: boolean;
  private apiUrl = 'http://127.0.0.1:3535';

  // ===== Estado local de respaldo (solo como seed si no hay backend) =====
  private readonly defaultState = {
    productos: [
      { nombre:'Empanadas de carne', categoria:'Entrada', precio:12.99, cantidad:20, descripcion: 'Carne vacuna envuelta en masa criolla, cocinada al horno de barro.', img: 'https://www.bekiacocina.com/images/cocina/0000/265-h.jpg' },
      { nombre:'Bruschettas', categoria:'Entrada', precio:8.50, cantidad:30, descripcion: 'Rebanadas de pan tostado con tomate, ajo, albahaca y aceite de oliva.', img: 'https://www.clarin.com/img/2022/12/22/UwCUEP0SQ_1256x620__1.jpg' },
      { nombre:'Ensalada Caprese', categoria:'Entrada', precio:10.00, cantidad:25, descripcion: 'Rodajas de tomate fresco, mozzarella y albahaca, con aceite de oliva.', img: 'https://www.huleymantel.com/uploads/s1/36/17/28/ensalada-caprese-tomates-maduros-queso-mozzarella-hojas-albahaca-fresca-166116-3714_4_1000x563.jpeg' },
      { nombre:'Pollo a la parrilla', categoria:'Plato principal', precio:15.00, cantidad:10, descripcion: 'Jugoso pollo marinado y cocido lentamente a la parrilla.', img: 'https://www.paulinacocina.net/wp-content/uploads/2021/11/pollo-asado.jpg.webp' },
      { nombre:'Cheesecake de frutos rojos', categoria:'Postres', precio:6.99, cantidad:18, descripcion: 'Base de galletas, crema suave y coulis de frutos del bosque.', img: 'https://www.paulinacocina.net/wp-content/uploads/2025/01/receta-de-cheesecake-1742898428.jpg.webp' },
      { nombre:'Café espresso', categoria:'Bebidas', precio:2.20, cantidad:60, descripcion: 'Café intenso preparado con granos seleccionados recién molidos.', img: 'https://www.novachef.es/media/images/espresso-macchiato.jpg' }
    ],
    clientes:  [],
    empleados: [],
    pedidos:   [],
    resenas:   []
  };

  // ===== Signals compartidos =====
  productos = signal<Producto[]>([]); // stock
  clientes  = signal<Cliente[]>([]);
  empleados = signal<Empleado[]>([]);
  pedidos   = signal<Pedido[]>([]);
  resenas   = signal<Resena[]>([]);
  allUsers  = signal<Usuario[]>([]);

  // ===== Usuarios: paginación + filtros =====
  usersPage    = signal<number>(1);
  usersLimit   = signal<number>(10);
  usersHasNext = signal<boolean>(false);
  filtroNombre = signal<string>('');
  filtroRol    = signal<string>('');
  estadosPedido = ['Pendiente','En preparación','En reparto','Entregado','Cancelado'];

  // ===== Productos: paginación + filtros =====
  prodPage     = signal<number>(1);
  prodLimit    = signal<number>(10);
  prodHasNext  = signal<boolean>(false);
  prodFiltroNombre    = signal<string>('');
  prodFiltroCategoria = signal<string>('');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadState();
      effect(() => this.saveState());
    }
  }

  // =========================================
  // ============== HEADERS ==================
  // =========================================
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

  // ============================================================
  // 🚀 NUEVO: traer productos SIEMPRE del backend (para /menu)
  // ============================================================
  /**
   * GET /productos
   * - page/per_page para traer muchos de una
   * - categoria opcional
   * - normaliza 'stock' -> 'cantidad'
   */
  fetchProductosFromBackend(page: number = 1, per_page: number = 200, categoria: string = ''): void {
    const params: any = { page, per_page };
    if (categoria) params.categoria = categoria;

    this.http.get<any>(`${this.apiUrl}/productos`, {
      headers: this.getAuthHeaders(),
      params
    }).subscribe({
      next: (resp) => {
        // tu backend puede mandar [{...}] o {items:[...]}
        const items = Array.isArray(resp) ? resp : resp.items ?? [];
        const normalizados: Producto[] = items.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: Number(p.precio ?? 0),
          categoria: p.categoria,
          // 👇 acá arreglamos la diferencia DB vs front
          cantidad: Number(p.cantidad ?? p.stock ?? 0),
          img: p.img ?? p.imagen ?? ''
        }));
        this.productos.set(normalizados);
        this.saveState();
      },
      error: (err) => {
        console.error('Error al obtener /productos del backend:', err);
        // si falla, dejamos lo que haya en localStorage
      }
    });
  }

  // =========================================================================
  // === USUARIOS (lista con paginación + filtros, update inline y por rol) ===
  // =========================================================================
  fetchAllUsers(): void {
    if (!this.isBrowser) return;

    const page   = this.usersPage();
    const limit  = this.usersLimit();
    const nombre = this.filtroNombre().trim();
    const rol    = this.filtroRol().trim();

    const params: any = { page, per_page: limit + 1 }; // lookahead
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

  updateUsuario(userId: number, patch: Partial<Usuario>): Observable<Usuario> | undefined {
    if (!this.isBrowser) {
      return new Observable((subscriber: Subscriber<any>) => {
        subscriber.error('No es posible actualizar usuario en server-side rendering');
      }) as any;
    }
    return this.http.put<Usuario>(`${this.apiUrl}/usuario/${userId}`, patch, { headers: this.jsonAuthHeaders() });
  }

  updateUserRole(userId: number, newRole: string): Observable<any> | undefined {
    if (!this.isBrowser) {
      return new Observable((subscriber: Subscriber<any>) => {
        subscriber.error('No es posible actualizar el rol en server-side rendering');
      });
    }
    return this.http.put(`${this.apiUrl}/usuario/${userId}`, { rol: newRole }, { headers: this.jsonAuthHeaders() });
  }

  // ================================
  // === EMPLEADOS (vía /usuarios) ==
  // ================================
  private genTempPassword(): string {
    const base = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    return `Emp-${base.slice(0,6)}!${Math.floor(Math.random()*10)}`;
  }

  fetchEmpleados(): void {
    const params = { rol: 'empleado' };
    this.http.get<Empleado[]>(`${this.apiUrl}/usuarios`, { headers: this.getAuthHeaders(), params })
      .subscribe({
        next: (rows) => this.empleados.set(Array.isArray(rows) ? rows : []),
        error: (err) => {
          console.error('Error al obtener empleados:', err);
          this.empleados.set([]);
        }
      });
  }

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

  deleteEmpleado = (index: number) => {
    const current = this.empleados();
    const target = current?.[index];
    if (!target || !target.id) {
      console.warn('No se encontró id para borrar.');
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

  // =======================================================
  // === PRODUCTOS (Stock) – conexión real con /productos ===
  // =======================================================

  /** Lista de productos con paginación + filtros (lookahead como usuarios). */
  fetchProductos(): void {
    const page   = this.prodPage();
    const limit  = this.prodLimit();
    const nombre = this.prodFiltroNombre().trim();
    const categoria = this.prodFiltroCategoria().trim();

    const params: any = { page, per_page: limit + 1 }; // lookahead
    if (nombre)   params.nombre   = nombre;
    if (categoria) {
      params.categoria = categoria;
      const categoriaMap: Record<string, number> = {
        'Entrada': 1, 'Plato principal': 2, 'Postres': 3, 'Bebidas': 4
      };
      if (categoriaMap[categoria]) params.categoriaId = categoriaMap[categoria];
    }

    this.http.get<Producto[]>(`${this.apiUrl}/productos`, { headers: this.getAuthHeaders(), params })
      .subscribe({
        next: (rows) => {
          const hasNext = Array.isArray(rows) && rows.length > limit;
          this.prodHasNext.set(hasNext);
          this.productos.set(hasNext ? rows.slice(0, limit) : rows);
        },
        error: (err) => {
          console.error('Error al obtener productos:', err);
          this.productos.set([]);
          this.prodHasNext.set(false);
        }
      });
  }

  /** Alta de producto: POST /productos */
  addProducto = (prod: Producto) => {
    const body = {
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: prod.precio,
      cantidad: prod.cantidad,
      descripcion: prod.descripcion,
      img: prod.img
    };
    this.http.post<Producto>(`${this.apiUrl}/productos`, body, { headers: this.jsonAuthHeaders() })
      .subscribe({
        next: (nuevo) => {
          if (nuevo?.id != null) {
            this.productos.update(list => [nuevo, ...list]);
          } else {
            this.fetchProductos();
          }
        },
        error: (err) => {
          console.error('POST /productos falló:', err);
          alert('No se pudo crear el producto en el backend.');
        }
      });
  };

  /** Update de producto: PUT /producto/:id */
  updateProducto = (index: number, prod: Producto) => {
    const current = this.productos();
    const target  = current?.[index];
    const id = prod?.id ?? target?.id;
    if (!id) {
      console.warn('No se encontró id de producto para actualizar.');
      return;
    }
    const body = {
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: prod.precio,
      cantidad: prod.cantidad,
      descripcion: prod.descripcion,
      img: prod.img
    };
    this.http.put<Producto>(`${this.apiUrl}/producto/${id}`, body, { headers: this.jsonAuthHeaders() })
      .subscribe({
        next: (actualizado) => {
          this.productos.update(list => {
            const copy = [...list];
            copy[index] = { ...copy[index], ...(actualizado ?? body), id };
            return copy;
          });
        },
        error: (err) => {
          console.error('PUT /producto/:id falló:', err);
          alert('No se pudo actualizar el producto en el backend.');
        }
      });
  };

  /** Borrado de producto: DELETE /producto/:id */
  deleteProducto = (index: number) => {
    const current = this.productos();
    const target  = current?.[index];
    if (!target?.id) {
      console.warn('No se encontró id de producto para borrar.');
      return;
    }
    this.http.delete(`${this.apiUrl}/producto/${target.id}`, { headers: this.getAuthHeaders(), observe: 'response' })
      .subscribe({
        next: () => {
          this.productos.update(list => list.filter((_, i) => i !== index));
        },
        error: (err) => {
          console.error('DELETE /producto/:id falló:', err);
          alert('No se pudo eliminar el producto en el backend.');
        }
      });
  };

  /** Incremento cantidad: PUT /producto/:id con cantidad nueva */
  incrementarCantidad = (index: number) => {
    const list = this.productos();
    const item = list?.[index];
    if (!item?.id) return;

    const nueva = (item.cantidad ?? 0) + 1;
    this.http.put<Producto>(`${this.apiUrl}/producto/${item.id}`, { cantidad: nueva }, { headers: this.jsonAuthHeaders() })
      .subscribe({
        next: (resp) => {
          this.productos.update(p => {
            const copy = [...p];
            copy[index] = { ...copy[index], ...(resp ?? {}), cantidad: resp?.cantidad ?? nueva };
            return copy;
          });
        },
        error: (err) => {
          console.error('PUT cantidad +1 falló:', err);
          alert('No se pudo aumentar la cantidad.');
        }
      });
  };

  /** Decremento cantidad: PUT /producto/:id con cantidad nueva (>=0) */
  decrementarCantidad = (index: number) => {
    const list = this.productos();
    const item = list?.[index];
    if (!item?.id) return;

    const nueva = Math.max(0, (item.cantidad ?? 0) - 1);
    this.http.put<Producto>(`${this.apiUrl}/producto/${item.id}`, { cantidad: nueva }, { headers: this.jsonAuthHeaders() })
      .subscribe({
        next: (resp) => {
          this.productos.update(p => {
            const copy = [...p];
            copy[index] = { ...copy[index], ...(resp ?? {}), cantidad: resp?.cantidad ?? nueva };
            return copy;
          });
        },
        error: (err) => {
          console.error('PUT cantidad -1 falló:', err);
          alert('No se pudo disminuir la cantidad.');
        }
      });
  };

  // ==================================================
  // === Persistencia local (backup visual sin DB) ====
  // ==================================================
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
      this.productos.set(this.defaultState.productos as Producto[]);
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

  // ===========================================
  // === Helpers Usuarios: paginación/filtros ===
  // ===========================================
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

  // =============================================
  // === Helpers Productos: paginación/filtros ===
  // =============================================
  setProdNombreFiltro(valor: string)     { this.prodFiltroNombre.set(valor ?? ''); }
  setProdCategoriaFiltro(valor: string)  { this.prodFiltroCategoria.set(valor ?? ''); }

  setProdLimit(valor: number) {
    const v = Number(valor) || 10;
    this.prodLimit.set(v);
    this.prodPage.set(1);
    this.fetchProductos();
  }

  goToProdPage(p: number) {
    const page = Math.max(1, Math.floor(p));
    this.prodPage.set(page);
    this.fetchProductos();
  }

  nextProdPage() {
    if (this.prodHasNext()) {
      this.prodPage.set(this.prodPage() + 1);
      this.fetchProductos();
    }
  }

  prevProdPage() {
    if (this.prodPage() > 1) {
      this.prodPage.set(this.prodPage() - 1);
      this.fetchProductos();
    }
  }

  aplicarProdFiltros() {
    this.prodPage.set(1);
    this.fetchProductos();
  }

  limpiarProdFiltros() {
    this.prodFiltroNombre.set('');
    this.prodFiltroCategoria.set('');
    this.prodPage.set(1);
    this.fetchProductos();
  }

  // ===========================================================
  // === Compatibilidad con otras pantallas (local, sin DB) ===
  // ===========================================================
  addResena = (resena: Resena) =>
    this.resenas.update(r => [resena, ...r]);

  addCliente = (cli: Cliente) =>
    this.clientes.update(c => [...c, cli]);

  updateCliente = (index: number, cli: Cliente) =>
    this.clientes.update(c => { c[index] = cli; return [...c]; });

  deleteCliente = (index: number) =>
    this.clientes.update(c => c.filter((_, i) => i !== index));

  updateEstadoPedido = (index: number, nuevoEstado: string) =>
    this.pedidos.update(p => { p[index].estado = nuevoEstado; return [...p]; });
}
