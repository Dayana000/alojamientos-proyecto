// src/app/core/services/reservas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ReservaRequest } from '../models/reserva-request.model';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {

  // apiBase debe ser algo como: http://localhost:8080/api
  private apiUrl = `${environment.apiBase}/reservas`;

  constructor(private http: HttpClient) {}

  /**
   * Crear una nueva reserva
   * POST /api/reservas
   */
  crearReserva(payload: ReservaRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, payload);
  }

  /**
   * ✅ Obtener reservas de un usuario (paginadas)
   * GET /api/reservas?usuarioId={id}&page={page}&size={size}
   */
  obtenerReservasPorUsuario(
    usuarioId: number,
    page: number = 0,
    size: number = 20
  ): Observable<any> {

    const params = new HttpParams()
      .set('usuarioId', usuarioId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }
}
