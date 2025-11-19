import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlojamientosService } from '../../core/services/alojamientos.service';
import { ReservasService } from '../../core/services/reservas.service';
import { ComentariosService, CrearComentarioRequest } from '../../core/services/comentarios.service';

import { Alojamiento } from '../../core/models/alojamiento.model';
import { ReservaRequest } from '../../core/models/reserva-request.model';
import { Comentario } from '../../core/models/comentario.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-alojamiento-detalle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './alojamiento-detalle.html',
  styleUrls: ['./alojamiento-detalle.scss'],
})
export class AlojamientoDetalleComponent implements OnInit {

  alojamiento?: Alojamiento;
  loading = false;
  error = '';

  // Reserva
  reservaForm!: FormGroup;

  // Comentarios
  comentarios: Comentario[] = [];
  comentariosTotal = 0;
  promedioCalificacion = 0;

  comentarioForm!: FormGroup;
  puedeComentar = false;
  enviandoComentario = false;
  private reservaCompletadaId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private alojamientosService: AlojamientosService,
    private reservasService: ReservasService,
    private comentariosService: ComentariosService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {

    // Form reserva
    this.reservaForm = this.fb.group({
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      huespedes: [1, [Validators.required, Validators.min(1)]],
    });

    // Form comentario
    this.comentarioForm = this.fb.group({
      calificacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      texto: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.error = 'ID de alojamiento inválido.';
      return;
    }

    this.cargarAlojamiento(id);
    this.cargarComentarios(id);
    this.verificarSiPuedeComentar(id);
  }

  // ================== ALOJAMIENTO ==================

  cargarAlojamiento(id: number): void {
    this.loading = true;

    this.alojamientosService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.alojamiento = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el alojamiento.';
        this.loading = false;
      },
    });
  }

  // ================== RESERVA ==================

  reservar(): void {
    if (!this.reservaForm.valid || !this.alojamiento) {
      alert('Completa todos los datos de la reserva');
      return;
    }

    const raw = localStorage.getItem('user');
    const usuario = raw ? JSON.parse(raw) : null;

    if (!usuario?.id) {
      alert('Debes iniciar sesión para reservar.');
      this.router.navigate(['/auth']);
      return;
    }

    const payload: ReservaRequest = {
      usuarioId: usuario.id,
      alojamientoId: this.alojamiento.id!,
      checkIn: this.reservaForm.value.checkIn,
      checkOut: this.reservaForm.value.checkOut,
      huespedes: this.reservaForm.value.huespedes,
    };

    this.reservasService.crearReserva(payload).subscribe({
      next: () => {
        alert('Reserva creada exitosamente ✔️');
      },
      error: (err) => {
        console.error(err);
        alert('Error al crear reserva: ' + (err.error?.detail || err.message));
      }
    });
  }

  // ================== COMENTARIOS ==================

  private cargarComentarios(alojamientoId: number): void {
    this.comentariosService.obtenerPorAlojamiento(alojamientoId).subscribe({
      next: (page) => {
        this.comentarios = page.content || [];
        this.comentariosTotal = page.totalElements ?? this.comentarios.length;

        if (this.comentarios.length > 0) {
          const sum = this.comentarios.reduce(
            (acc, c) => acc + (c.calificacion || 0),
            0
          );
          this.promedioCalificacion = +(sum / this.comentarios.length).toFixed(1);
        } else {
          this.promedioCalificacion = 0;
        }
      },
      error: (err) => {
        console.error('Error cargando comentarios', err);
      },
    });
  }

  private verificarSiPuedeComentar(alojamientoId: number): void {
    const usuario = this.authService.getUsuario();
    if (!usuario?.id) {
      this.puedeComentar = false;
      this.reservaCompletadaId = null;
      return;
    }

    this.reservasService.obtenerReservasPorUsuario(usuario.id).subscribe({
      next: (page: any) => {
        const hoy = new Date();
        const reservas = page.content || page;

        let reservaElegida: any | null = null;

        reservas?.forEach((r: any) => {
          const aloId = r.alojamientoId || r.alojamiento?.id;
          const estado = (r.estado || '').toUpperCase();
          const checkOut = new Date(r.checkOut || r.check_out);

          const esMisma = aloId === alojamientoId;
          const estaCompletada = estado === 'COMPLETADA';
          const yaPaso = checkOut.getTime() < hoy.getTime();

          if (esMisma && estaCompletada && yaPaso) {
            // Si hay varias, nos quedamos con la más reciente
            if (!reservaElegida || new Date(reservaElegida.checkOut) < checkOut) {
              reservaElegida = r;
            }
          }
        });

        this.reservaCompletadaId = reservaElegida?.id ?? null;
        this.puedeComentar = !!this.reservaCompletadaId;
      },
      error: (err) => {
        console.error('Error verificando si puede comentar', err);
        this.puedeComentar = false;
        this.reservaCompletadaId = null;
      },
    });
  }

  onEnviarComentario(): void {
    if (this.comentarioForm.invalid || !this.alojamiento) {
      this.comentarioForm.markAllAsTouched();
      return;
    }

    const usuario = this.authService.getUsuario();
    if (!usuario?.id) {
      alert('Debes iniciar sesión para comentar.');
      this.router.navigate(['/auth']);
      return;
    }

    if (!this.reservaCompletadaId) {
      alert('No se encontró una reserva completada para este alojamiento.');
      return;
    }

    const body: CrearComentarioRequest = {
      reservaId: this.reservaCompletadaId,
      alojamientoId: this.alojamiento.id!,
      usuarioId: usuario.id,
      calificacion: this.comentarioForm.value.calificacion,
      texto: this.comentarioForm.value.texto,
    };

    this.enviandoComentario = true;

    this.comentariosService.crearComentario(body).subscribe({
      next: () => {
        this.comentarioForm.reset({ calificacion: 5, texto: '' });
        this.enviandoComentario = false;
        this.cargarComentarios(this.alojamiento!.id);
        this.verificarSiPuedeComentar(this.alojamiento!.id);
      },
      error: (err) => {
        console.error('Error creando comentario', err);
        alert(err.error?.detail || 'No fue posible guardar tu comentario');
        this.enviandoComentario = false;
      },
    });
  }
}
