// src/app/services/admin-data.service.ts
import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';

// =========================
// Interfaces
// =========================
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  categoriaId?: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  cantidad: number;
  img: string;
}

export interface Resena {
  productoNombre: string;
  nombre: string;
  comentario: string;
  calificacion: number;
  fecha: string;
}

export interface PaginadoRespuesta<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// =========================
// Configuración
// =========================
const API_BASE = 'http://127.0.0.1:3535'; // ajustá si usás otro puerto o prefijo

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly isBrowser: boolean;

  // Signals reactivos
  usuarios = signal<Usuario[]>([]);
  productos = signal<Producto[]>([]);
  resenas   = signal<Resena[]>([]);

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // =========================
  // 🔹 Autenticación básica (si usás token)
  // =========================
  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // =========================
  // 🔹 USUARIOS (backend paginado)
  // =========================
  getUsuarios(
    page: number,
    limit: number,
    nombre?: string,
    categoriaId?: number | string
  ): Observable<PaginadoRespuesta<Usuario>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (nombre && nombre.trim()) params = params.set('nombre', nombre.trim());
    if (categoriaId !== undefined && categoriaId !== null && String(categoriaId).trim() !== '')
      params = params.set('categoriaId', String(categoriaId).trim());

    return this.http.get<PaginadoRespuesta<Usuario>>(`${API_BASE}/usuarios`, {
      params,
      headers: this.getAuthHeaders(),
    });
  }

  // =========================
  // 🔹 PRODUCTOS (backend DB/app.db)
  // =========================
  fetchProductosFromBackend(
    page: number = 1,
    per_page: number = 200,
    categoria: string = ''
  ) {
    const params: any = { page, per_page };
    if (categoria) params.categoria = categoria;

    return this.http
      .get<any>(`${API_BASE}/productos`, {
        headers: this.getAuthHeaders(),
        params,
      })
      .pipe(
        tap({
          next: (resp) => {
            const items = Array.isArray(resp)
              ? resp
              : resp.items ?? [];
            this.productos.set(items);
            console.log('✅ Productos cargados desde backend:', items.length);
          },
          error: (err) => {
            console.error('❌ Error al traer productos del backend:', err);
            this.productos.set([]);
          },
        })
      )
      .subscribe();
  }

  // =========================
  // 🔹 RESEÑAS (solo frontend)
  // =========================
  addResena(resena: Resena): void {
    const actuales = this.resenas();
    this.resenas.set([...actuales, resena]);
    if (this.isBrowser) {
      localStorage.setItem('resenas', JSON.stringify(this.resenas()));
    }
  }

  // =========================
  // 🔹 CATEGORÍAS (opcional)
  // =========================
  getCategorias(): Observable<Array<{ id: number; nombre: string }>> {
    return this.http.get<Array<{ id: number; nombre: string }>>(
      `${API_BASE}/categorias`
    );
  }
}
