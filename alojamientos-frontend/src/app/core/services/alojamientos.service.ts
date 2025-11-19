import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alojamiento } from '../models/alojamiento.model';

// Estructura genérica para páginas como las que devuelve Spring Data
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual
  size: number;   // tamaño de página
}

@Injectable({
  providedIn: 'root',
})
export class AlojamientosService {

  private apiUrl = `${environment.apiBase}/alojamientos`;

  constructor(private http: HttpClient) {}

  /**
   * Lista alojamientos activos por ciudad (endpoint GET /api/alojamientos)
   * - ciudad: filtro opcional por ciudad
   * - page, size: paginación
   */
  listar(
    ciudad: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<Page<Alojamiento>> {

    const params: any = {
      page: page.toString(),
      size: size.toString(),
    };

    if (ciudad) {
      params.ciudad = ciudad;
    }

    return this.http.get<Page<Alojamiento>>(this.apiUrl, { params });
  }

  /**
   * Obtiene el detalle de un alojamiento por su ID
   * GET /api/alojamientos/{id}
   */
  obtenerPorId(id: number): Observable<Alojamiento> {
    return this.http.get<Alojamiento>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca alojamientos disponibles por rango de fechas y filtros básicos.
   * Usa el endpoint GET /api/alojamientos/disponibles
   *
   * - ciudad: opcional
   * - desde, hasta: fechas en formato 'YYYY-MM-DD' (obligatorias para este endpoint)
   * - precioMax: opcional (se envía como precioMax)
   */
  buscarDisponibles(
    ciudad: string,
    desde: string,
    hasta: string,
    precioMax: number | null,
    page: number = 0,
    size: number = 10
  ): Observable<Page<Alojamiento>> {

    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('page', page.toString())
      .set('size', size.toString());

    if (ciudad) {
      params = params.set('ciudad', ciudad);
    }

    // de momento no usamos precioMin ni capacidad
    if (precioMax !== null && !isNaN(precioMax)) {
      params = params.set('precioMax', precioMax.toString());
    }

    return this.http.get<Page<Alojamiento>>(`${this.apiUrl}/disponibles`, { params });
  }
}
