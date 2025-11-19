import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AlojamientosService, Page } from '../../core/services/alojamientos.service';
import { Alojamiento } from '../../core/models/alojamiento.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-anfitrion-alojamientos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './anfitrion-alojamientos.component.html',
  styleUrls: ['./anfitrion-alojamientos.component.scss'],
})
export class AnfitrionAlojamientosComponent implements OnInit {

  alojamientos: Alojamiento[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private alojamientosService: AlojamientosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarAlojamientos();
  }

  private cargarAlojamientos(): void {
    const usuario = this.authService.getUsuario();
    if (!usuario?.id) {
      this.error = 'Debes iniciar sesión como anfitrión.';
      return;
    }

    this.loading = true;

    // Usamos buscarDisponibles con la firma real:
    // (ciudad: string, desde: string, hasta: string,
    //  precioMax: number | null, page?: number, size?: number)
    this.alojamientosService.buscarDisponibles(
      '',      // ciudad (string obligatorio)
      '',      // desde
      '',      // hasta
      null,    // precio máximo
      0,       // página
      100      // tamaño de página
    ).subscribe({
      next: (page: Page<Alojamiento>) => {
        // Filtramos solo los alojamientos cuyo anfitrión es el usuario logueado
        this.alojamientos = (page.content || []).filter(
          a => a.anfitrionId === usuario.id
        );
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar tus alojamientos.';
        this.loading = false;
      }
    });
  }
}
