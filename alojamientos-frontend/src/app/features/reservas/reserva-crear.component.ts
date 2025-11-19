import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AlojamientosService } from '../../core/services/alojamientos.service';
import { ReservasService } from '../../core/services/reservas.service';
import { Alojamiento } from '../../core/models/alojamiento.model';
import { ReservaRequest } from '../../core/models/reserva-request.model';

@Component({
  selector: 'app-reserva-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reserva-crear.html',
  styleUrls: ['./reserva-crear.scss'],
})
export class ReservaCrearComponent implements OnInit {

  alojamiento?: Alojamiento;
  loadingAlojamiento = false;
  loadingReserva = false;

  reservaForm!: FormGroup;

  mensajeError = '';
  mensajeOk = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private alojamientosService: AlojamientosService,
    private reservasService: ReservasService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : null;

    if (id === null || isNaN(id)) {
      this.mensajeError = 'ID de alojamiento inválido.';
      return;
    }

    this.cargarAlojamiento(id);

    this.reservaForm = this.fb.group({
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      huespedes: [1, [Validators.required, Validators.min(1)]],
    });
  }

  private cargarAlojamiento(id: number) {
    this.loadingAlojamiento = true;

    this.alojamientosService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.alojamiento = data;
        this.loadingAlojamiento = false;
      },
      error: () => {
        this.mensajeError = 'No se pudo cargar el alojamiento.';
        this.loadingAlojamiento = false;
      },
    });
  }

  private normalizarFecha(fecha: string): string {
    return fecha;
  }

  crearReserva(): void {
    this.mensajeError = '';
    this.mensajeOk = '';

    if (!this.alojamiento) {
      this.mensajeError = 'Alojamiento no disponible.';
      return;
    }

    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      this.mensajeError = 'Completa todos los campos.';
      return;
    }

    // Obtener usuario desde localStorage
    const rawUser = localStorage.getItem('user');
    const usuario = rawUser ? JSON.parse(rawUser) : null;

    // Detectar ID correcto según backend
    const usuarioId = usuario?.id ?? usuario?.userId ?? usuario?.usuarioId;

    if (!usuarioId) {
      this.router.navigate(['/auth']);
      return;
    }

    const { checkIn, checkOut, huespedes } = this.reservaForm.value;

    if (checkOut <= checkIn) {
      this.mensajeError = 'La fecha de salida debe ser posterior.';
      return;
    }

    const payload: ReservaRequest = {
      usuarioId: usuarioId,
      alojamientoId: this.alojamiento.id!,
      checkIn: this.normalizarFecha(checkIn),
      checkOut: this.normalizarFecha(checkOut),
      huespedes: Number(huespedes),
    };

    this.loadingReserva = true;

    this.reservasService.crearReserva(payload).subscribe({
      next: () => {
        this.loadingReserva = false;
        this.mensajeOk = '¡Reserva creada exitosamente!';
      },
      error: (err) => {
        this.loadingReserva = false;
        this.mensajeError =
          err.error?.detail ||
          err.error?.message ||
          'Ocurrió un error al crear la reserva.';
      },
    });
  }
}
