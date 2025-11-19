import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { RouterLink } from '@angular/router'; // 👈 AÑADIMOS RouterLink
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/register-request.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // 👈 LO IMPORTAMOS AQUÍ
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';

  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required]],
        fechaNacimiento: ['', [Validators.required]],

        // 👇 El enum del backend acepta USER y ANFITRION
        rol: ['USER', Validators.required],

        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmarPassword: ['', Validators.required],
      },
      {
        validators: (form) =>
          form.get('password')?.value === form.get('confirmarPassword')?.value
            ? null
            : { passwordsMismatch: true },
      }
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Completa todos los campos correctamente.';
      return;
    }

    this.loading = true;

    // HTML date input devuelve yyyy-MM-dd → perfecto para LocalDate
    const payload: RegisterRequest = {
      nombre: this.f['nombre'].value,
      email: this.f['email'].value,
      telefono: this.f['telefono'].value,
      fechaNacimiento: this.f['fechaNacimiento'].value, // ✔ FORMATO CORRECTO
      rol: this.f['rol'].value,
      password: this.f['password'].value,
      fotoUrl: null,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.successMessage = 'Te registraste exitosamente.';
        this.loading = false;

        // reiniciar dejando el rol por defecto
        this.registerForm.reset({ rol: 'USER' });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage =
          err.error?.error || 'Ocurrió un error al registrar el usuario.';
        this.loading = false;
      },
    });
  }
}
