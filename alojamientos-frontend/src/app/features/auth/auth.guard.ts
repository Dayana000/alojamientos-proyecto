import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --------- Interfaces que usaremos en login/registro ----------

export interface LoginRequest {
  email: string;
  password: string;
}

// Respuesta que devuelve tu backend:
// {
//   "accessToken": "...",
//   "tokenType": "Bearer"
// }
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string; // yyyy-MM-dd (el backend lo parsea a LocalDate)
  rol: 'USER' | 'ANFITRION';
  password: string;
}

// ------------------------ Servicio ----------------------------

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {}

  // LOGIN
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data);
  }

  // REGISTRO
  register(data: RegisterRequest) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // TOKEN EN LOCALSTORAGE --------------------------------------

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // true solo si hay token REAL (no null, no "undefined", no "null")
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && token !== 'undefined' && token !== 'null';
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
