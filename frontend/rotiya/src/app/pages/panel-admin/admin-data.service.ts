// src/app/services/admin-data.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

// Interfaces (respetamos tu tipado previo y agregamos lo mínimo)
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  categoriaId?: number; // <- si tu backend lo manda; no rompe si no viene
}

export interface PaginadoRespuesta<T> {
  items: T[];
  total: number;   // total de ítems en el backend (no solo la página actual)
  page: number;    // página actual (1-based)
  limit: number;   // tamaño de página
}

// Si ya tenés un environment, usalo; sino, define una base (ajústala a tu API real)
const API_BASE = '/api'; // p.ej. 'https://tu-backend.com/api'

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Obtiene usuarios con paginación y filtros backend.
   * @param page Página 1-based
   * @param limit Tamaño de página
   * @param nombre Filtro por nombre (param backend: 'nombre')
   * @param categoriaId Filtro por categoría (param backend: 'categoriaId')
   *
   * Por qué: el backend espera 'page', 'limit', 'nombre', 'categoriaId' (según tu consigna).
   * Cómo: construimos HttpParams sólo con valores definidos para no enviar basura.
   */
  getUsuarios(
    page: number,
    limit: number,
    nombre?: string,
    categoriaId?: number | string
  ): Observable<PaginadoRespuesta<Usuario>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (nombre && nombre.trim().length > 0) {
      params = params.set('nombre', nombre.trim());
    }
    if (categoriaId !== undefined && categoriaId !== null && String(categoriaId).trim() !== '') {
      params = params.set('categoriaId', String(categoriaId).trim());
    }

    // Endpoint: ajusta a tu ruta real (p.ej. `${API_BASE}/admin/usuarios`)
    return this.http.get<PaginadoRespuesta<Usuario>>(`${API_BASE}/usuarios`, { params });
  }

  /**
   * (Opcional) Si necesitás poblar el <select> de categorías desde backend.
   * Mínima extensión, no obligatoria si ya tenés una lista local.
   */
  getCategorias(): Observable<Array<{ id: number; nombre: string }>> {
    return this.http.get<Array<{ id: number; nombre: string }>>(`${API_BASE}/categorias`);
  }
}
