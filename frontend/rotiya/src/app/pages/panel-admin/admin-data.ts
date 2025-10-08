import { Injectable, signal, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Interfaces para tipado fuerte
export interface Producto { nombre: string; categoria: string; precio: number; cantidad: number; descripcion: string; img: string; }
export interface Cliente { nombre: string; email: string; telefono: string; }
export interface Empleado { nombre: string; rol: string; }
export interface Pedido { fecha: string; cliente: string; detalle: string; total: number; estado: string; }

const LS_KEY = 'rotiya_admin_state_v1';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private isBrowser: boolean;

  // LA "BASE DE DATOS" CON TUS URLS
  private readonly defaultState = {
    productos: [
      // Entradas
      { nombre:'Empanadas de carne', categoria:'Entrada', precio:12.99, cantidad:20, descripcion: 'Carne vacuna envuelta en masa criolla, cocinada al horno de barro.', img: 'https://www.bekiacocina.com/images/cocina/0000/265-h.jpg' },
      { nombre:'Bruschettas', categoria:'Entrada', precio:8.50, cantidad:30, descripcion: 'Rebanadas de pan tostado con tomate, ajo, albahaca y aceite de oliva.', img: 'https://www.clarin.com/img/2022/12/22/UwCUEP0SQ_1256x620__1.jpg' },
      { nombre:'Ensalada Caprese', categoria:'Entrada', precio:10.00, cantidad:25, descripcion: 'Rodajas de tomate fresco, mozzarella y albahaca, con aceite de oliva.', img: 'https://www.huleymantel.com/uploads/s1/36/17/28/ensalada-caprese-tomates-maduros-queso-mozzarella-hojas-albahaca-fresca-166116-3714_4_1000x563.jpeg' },
      
      // Platos Principales (¡CON TUS IMÁGENES!)
      { nombre:'Pollo a la parrilla', categoria:'Plato principal', precio:15.00, cantidad:10, descripcion: 'Jugoso pollo marinado y cocido lentamente a la parrilla.', img: 'https://www.paulinacocina.net/wp-content/uploads/2021/11/pollo-asado.jpg.webp' },
      { nombre: 'Milanesa a la Napolitana', categoria:'Plato principal', precio: 18.50, cantidad: 15, descripcion: 'Clásica milanesa de ternera cubierta con salsa de tomate, jamón y queso mozzarella.', img: 'https://www.lanacion.com.ar/resizer/v2/milanesa-a-la-napolitana-con-guarnicion-de-papas-VLWFAANIWBGPFO4CSUHS7RYVVQ.jpg?auth=335fda04cf2733e39d11ca0ba979c1d0a8a55e6cdec15e4d5b00cfd59fbf9ed8&width=880&height=586&quality=70&smart=true'},
      { nombre: 'Pastel de Papas', categoria:'Plato principal', precio: 16.00, cantidad: 12, descripcion: 'Un clásico argentino con carne molida sazonada cubierta de puré de papas gratinado.', img: 'https://www.lanacion.com.ar/resizer/v2/pastel-de-papas-vegetariano-con-soja-PC6FZPDGUFGNNJI34UJX6SUBIA.jpg?auth=5828873b44a921fbd2caa59b1388b209a7ce7d4754dbf76b59064e844b40df36&width=880&height=586&quality=70&smart=true'},

      // Postres
      { nombre:'Cheesecake de frutos rojos', categoria:'Postres', precio:6.99, cantidad:18, descripcion: 'Base de galletas, crema suave y coulis de frutos del bosque.', img: 'https://www.paulinacocina.net/wp-content/uploads/2025/01/receta-de-cheesecake-1742898428.jpg.webp' },
      { nombre:'Brownie con helado', categoria:'Postres', precio:5.50, cantidad:22, descripcion: 'Brownie tibio de chocolate con bocha de helado de vainilla.', img: 'https://s3-api-arcor.apps-webs.com/chocoaguila/archivos/recetas/receta-10100.webp' },
      { nombre:'Flan casero', categoria:'Postres', precio:4.20, cantidad:30, descripcion: 'Clásico flan de vainilla con caramelo y crema.', img: 'https://vinomanos.com/wp-content/uploads/2020/04/Flan-casero-argentino.jpg.webp' },
      
      // Bebidas
      { nombre:'Limonada casera', categoria:'Bebidas', precio:3.50, cantidad:40, descripcion: 'Refrescante limonada con jugo natural de limón y menta fresca.', img: 'https://www.splenda.com/wp-content/themes/bistrotheme/assets/recipe-images/homemade-mint-lemonade-2000w.jpg' },
      { nombre:'Cerveza artesanal', categoria:'Bebidas', precio:4.80, cantidad:50, descripcion: 'Cerveza rubia elaborada localmente con malta seleccionada.', img: 'https://www.infobae.com/resizer/v2/https%3A%2F%2Fs3.amazonaws.com%2Farc-wordpress-client-uploads%2Finfobae-wp%2Fwp-content%2Fuploads%2F2017%2F07%2F06123915%2Fcerveza-1920-2.jpg?auth=fa59af8ab8767172c348d67c2d7e376fbce5c6cf943df35c0070347b7ccb989d&smart=true&width=992&height=558&quality=85' },
      { nombre:'Café espresso', categoria:'Bebidas', precio:2.20, cantidad:60, descripcion: 'Café intenso preparado con granos seleccionados recién molidos.', img: 'https://www.novachef.es/media/images/espresso-macchiato.jpg' }
    ],
    clientes: [ { nombre:'Laura', email:'laura@mail.com', telefono:'+54 261 000 0001' }, { nombre:'Roberto', email:'roberto@mail.com', telefono:'+54 261 000 0002' }, { nombre:'Lautaro', email:'lautaro@mail.com', telefono:'+54 261 000 0003' } ],
    empleados: [ { nombre:'Laura', rol:'Cocina' }, { nombre:'Roberto', rol:'Delivery' }, { nombre:'Lautaro', rol:'Atención' } ],
    pedidos: [ { fecha:'2025-08-09 15:00', cliente:'Laura', detalle:'Pollo a la parrilla, Empanadas de carne', total:27.99, estado:'Entregado' }, { fecha:'2025-08-09 12:00', cliente:'Roberto', detalle:'Nachos con salsa', total:9.99, estado:'Pendiente' } ]
  };
  
  productos = signal<Producto[]>([]);
  clientes = signal<Cliente[]>([]);
  empleados = signal<Empleado[]>([]);
  pedidos = signal<Pedido[]>([]);
  estadosPedido = ['Pendiente','En preparación','En reparto','Entregado','Cancelado'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { this.isBrowser = isPlatformBrowser(this.platformId); if (this.isBrowser) { this.loadState(); effect(() => this.saveState()); } else { this.productos.set(this.defaultState.productos); this.clientes.set(this.defaultState.clientes); this.empleados.set(this.defaultState.empleados); this.pedidos.set(this.defaultState.pedidos); } }
  private loadState(): void { const raw = localStorage.getItem(LS_KEY); const state = raw ? JSON.parse(raw) : structuredClone(this.defaultState); this.productos.set(state.productos || []); this.clientes.set(state.clientes || []); this.empleados.set(state.empleados || []); this.pedidos.set(state.pedidos || []); }
  private saveState(): void { if (!this.isBrowser) return; const currentState = { productos: this.productos(), clientes: this.clientes(), empleados: this.empleados(), pedidos: this.pedidos() }; localStorage.setItem(LS_KEY, JSON.stringify(currentState)); }
  addProducto = (prod: Producto) => this.productos.update(p => [...p, prod]); updateProducto = (index: number, prod: Producto) => this.productos.update(p => { p[index] = prod; return [...p]; }); deleteProducto = (index: number) => this.productos.update(p => p.filter((_, i) => i !== index)); incrementarCantidad = (index: number) => this.productos.update(p => { p[index].cantidad++; return [...p]; }); decrementarCantidad = (index: number) => this.productos.update(p => { p[index].cantidad = Math.max(0, p[index].cantidad - 1); return [...p]; }); addCliente = (cli: Cliente) => this.clientes.update(c => [...c, cli]); updateCliente = (index: number, cli: Cliente) => this.clientes.update(c => { c[index] = cli; return [...c]; }); deleteCliente = (index: number) => this.clientes.update(c => c.filter((_, i) => i !== index)); addEmpleado = (emp: Empleado) => this.empleados.update(e => [...e, emp]); updateEmpleado = (index: number, emp: Empleado) => this.empleados.update(e => { e[index] = emp; return [...e]; }); deleteEmpleado = (index: number) => this.empleados.update(e => e.filter((_, i) => i !== index)); updateEstadoPedido = (index: number, nuevoEstado: string) => this.pedidos.update(p => { p[index].estado = nuevoEstado; return [...p]; });
}