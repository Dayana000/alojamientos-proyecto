// src/app/core/models/comentario.model.ts
export interface Comentario {
  id: number;
  alojamientoId: number;
  reservaId: number;
  usuarioId: number;
  usuarioNombre: string;
  calificacion: number;
  texto: string;
  respuestaAnfitrion?: string | null;
  createdAt: string;
}
