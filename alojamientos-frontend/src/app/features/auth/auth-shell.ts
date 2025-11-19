import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './auth-shell.html',
  styleUrls: ['./auth-shell.scss'],
})
export class AuthShellComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (resp: any) => {
        this.loading = false;

        // TOKEN válido desde backend
        const token =
          resp['token'] ??
          resp['accessToken'] ??
          resp['jwt'] ??
          resp['jwtToken'] ??
          resp['authorization'] ??
          resp['authToken'] ??
          (resp['data']?.['token']) ??
          '';

        if (token) {
          localStorage.setItem('auth_token', token);
        }

        // GUARDAR USUARIO
        const user =
          resp['usuario'] ??
          resp['usuarioDto'] ??
          resp['user'] ??
          resp['data']?.['usuario'] ??
          null;

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Ir al home correcto
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.errorMessage =
          err.error?.error ||
          err.error?.message ||
          'Credenciales inválidas. Intenta de nuevo.';
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
