// src/app/core/services/comentarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Comentario } from '../models/comentario.model';
import { Page } from './alojamientos.service';

export interface CrearComentarioRequest {
  reservaId: number;
  alojamientoId: number;
  usuarioId: number;
  calificacion: number;
  texto: string;
}

@Injectable({
  providedIn: 'root',
})
export class ComentariosService {

  private apiUrl = `${environment.apiBase}/comentarios`;

  constructor(private http: HttpClient) {}

  obtenerPorAlojamiento(
    alojamientoId: number,
    page: number = 0,
    size: number = 10
  ): Observable<Page<Comentario>> {

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<Comentario>>(
      `${this.apiUrl}/alojamiento/${alojamientoId}`,
      { params }
    );
  }

  crearComentario(body: CrearComentarioRequest): Observable<Comentario> {
    return this.http.post<Comentario>(this.apiUrl, body);
  }

  responderComentario(comentarioId: number, respuesta: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${comentarioId}/respuesta`,
      { respuesta }
    );
  }
}
