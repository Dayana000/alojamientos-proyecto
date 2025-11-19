export interface ReservaRequest {
  usuarioId: number;
  alojamientoId: number;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  huespedes: number;
}
