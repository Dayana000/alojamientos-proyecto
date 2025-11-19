import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = `${environment.apiBase}/auth`;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((resp) => {

        const token =
          resp['token'] ??
          resp['accessToken'] ??
          resp['jwt'] ??
          resp['jwtToken'] ??
          resp['authorization'] ??
          resp['authToken'] ??
          resp['data']?.['token'] ??
          '';

        if (token) localStorage.setItem(this.TOKEN_KEY, token);

        const user =
          resp['usuario'] ??
          resp['usuarioDto'] ??
          resp['user'] ??
          resp['data']?.['usuario'] ??
          null;

        if (user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && token.trim() !== '';
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    //  IMPORTANTE: redirigir al login después de cerrar sesión
    this.router.navigate(['/auth']);
  }

  getUsuario() {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  }
}
