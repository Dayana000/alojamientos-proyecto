// src/app/core/models/register-request.model.ts
export type RolUsuario = 'USER' | 'ANFITRION' | 'ADMIN';

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  fechaNacimiento: string;      // yyyy-MM-dd
  rol: RolUsuario;
  fotoUrl?: string | null;
}
