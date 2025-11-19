export interface Reserva {
  id: number;
  usuarioId: number;
  alojamientoId: number;
  checkIn: string;
  checkOut: string;
  huespedes: number;
  estado: string;
  total: number;
}
