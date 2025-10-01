import { Injectable, signal, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Interfaces para tipado fuerte
export interface Producto { nombre: string; categoria: string; precio: number; cantidad: number; }
export interface Cliente { nombre: string; email: string; telefono: string; }
export interface Empleado { nombre: string; rol: string; }
export interface Pedido { fecha: string; cliente: string; detalle: string; total: number; estado: string; }

const LS_KEY = 'rotiya_admin_state_v1';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private isBrowser: boolean;

  // CAMBIO AQUÍ: Añadimos 'readonly' para proteger el estado inicial
  private readonly defaultState = {
    productos: [
      { nombre:'Empanadas de carne', categoria:'Entrada', precio:12.99, cantidad:99 },
      { nombre:'Nachos', categoria:'Entrada', precio:9.99, cantidad:25 },
      { nombre:'Pollo a la parrilla', categoria:'Plato principal', precio:15.00, cantidad:10 }
    ],
    clientes: [
      { nombre:'Laura', email:'laura@mail.com', telefono:'+54 261 000 0001' },
      { nombre:'Roberto', email:'roberto@mail.com', telefono:'+54 261 000 0002' },
      { nombre:'Lautaro', email:'lautaro@mail.com', telefono:'+54 261 000 0003' }
    ],
    empleados: [
      { nombre:'Laura', rol:'Cocina' },
      { nombre:'Roberto', rol:'Delivery' },
      { nombre:'Lautaro', rol:'Atención' }
    ],
    pedidos: [
      { fecha:'2025-08-09 15:00', cliente:'Laura', detalle:'Pollo a la parrilla, Empanadas de carne', total:27.99, estado:'Entregado' },
      { fecha:'2025-08-09 12:00', cliente:'Roberto', detalle:'Nachos con salsa', total:9.99, estado:'Pendiente' }
    ]
  };

  productos = signal<Producto[]>([]);
  clientes = signal<Cliente[]>([]);
  empleados = signal<Empleado[]>([]);
  pedidos = signal<Pedido[]>([]);
  estadosPedido = ['Pendiente','En preparación','En reparto','Entregado','Cancelado'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadState();
      effect(() => this.saveState());
    } else {
      this.productos.set(this.defaultState.productos);
      this.clientes.set(this.defaultState.clientes);
      this.empleados.set(this.defaultState.empleados);
      this.pedidos.set(this.defaultState.pedidos);
    }
  }

  private loadState(): void {
    const raw = localStorage.getItem(LS_KEY);
    const state = raw ? JSON.parse(raw) : structuredClone(this.defaultState);
    this.productos.set(state.productos || []);
    this.clientes.set(state.clientes || []);
    this.empleados.set(state.empleados || []);
    this.pedidos.set(state.pedidos || []);
  }

  private saveState(): void {
    if (!this.isBrowser) return;
    const currentState = {
      productos: this.productos(),
      clientes: this.clientes(),
      empleados: this.empleados(),
      pedidos: this.pedidos()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(currentState));
  }

  // --- El resto de métodos no cambian ---
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
}