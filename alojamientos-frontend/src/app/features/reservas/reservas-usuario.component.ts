// src/app/features/reservas/reservas-usuario.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';        // 👈 IMPORTANTE
import { Router, RouterLink } from '@angular/router';

import { ReservasService } from '../../core/services/reservas.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reservas-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,     // 👈 AQUÍ TAMBIÉN
    RouterLink
  ],
  templateUrl: './reservas-usuario.html',
  styleUrls: ['./reservas-usuario.scss'],
})
export class ReservasUsuarioComponent implements OnInit {

  reservas: any[] = [];
  reservasFiltradas: any[] = [];

  loading = false;
  error = '';

  page = 0;
  size = 20;
  total = 0;

  filtroEstado: string = 'TODAS'; // TODAS | PENDIENTE | CONFIRMADA | CANCELADA | COMPLETADA

  constructor(
    private reservasService: ReservasService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();

    if (!usuario || !usuario.id) {
      this.router.navigate(['/auth']);
      return;
    }

    this.cargarReservas(usuario.id);
  }

  private cargarReservas(usuarioId: number): void {
    this.loading = true;
    this.error = '';

    this.reservasService.obtenerReservasPorUsuario(usuarioId, this.page, this.size)
      .subscribe({
        next: (resp: any) => {
          this.reservas = resp?.content || [];
          this.total = resp?.totalElements ?? this.reservas.length;
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar reservas:', err);
          this.error =
            err.error?.message ||
            err.error?.error ||
            'No se pudieron cargar tus reservas.';
          this.loading = false;
        },
      });
  }

  aplicarFiltros(): void {
    if (this.filtroEstado === 'TODAS') {
      this.reservasFiltradas = [...this.reservas];
    } else {
      this.reservasFiltradas = this.reservas.filter(
        (r) => (r.estado || '').toUpperCase() === this.filtroEstado
      );
    }

    this.reservasFiltradas.sort((a, b) => {
      const aDate = new Date(a.checkIn || a.check_in);
      const bDate = new Date(b.checkIn || b.check_in);
      return bDate.getTime() - aDate.getTime();
    });
  }

  onCambioEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }
}
