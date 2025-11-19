import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AlojamientosService } from '../../core/services/alojamientos.service';
import { Alojamiento } from '../../core/models/alojamiento.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule  // necesario para routerLink
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {

  alojamientos: Alojamiento[] = [];
  loading = false;

  page = 0;
  size = 10;
  total = 0;

  filtrosForm!: FormGroup;
  usandoBusquedaAvanzada = false;

  errorBusqueda = '';

  constructor(
    private fb: FormBuilder,
    private alojamientosService: AlojamientosService
  ) {}

  ngOnInit(): void {
    this.filtrosForm = this.fb.group({
      ciudad: [''],
      checkIn: [''],
      checkOut: [''],
      precioMax: ['']
    });

    this.cargarAlojamientos();
  }

  private normalizarFecha(fecha: string): string {
    return fecha;
  }

  cargarAlojamientos(): void {
    this.loading = true;

    const { ciudad, checkIn, checkOut, precioMax } = this.filtrosForm.value;
    const ciudadFiltro = ciudad || '';
    const precioMaxNum = precioMax ? Number(precioMax) : null;

    if (this.usandoBusquedaAvanzada && checkIn && checkOut) {
      const desde = this.normalizarFecha(checkIn);
      const hasta = this.normalizarFecha(checkOut);

      this.alojamientosService.buscarDisponibles(
        ciudadFiltro,
        desde,
        hasta,
        precioMaxNum,
        this.page,
        this.size
      ).subscribe({
        next: (resp: any) => {
          this.alojamientos = resp.content;
          this.total = resp.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error buscando alojamientos disponibles:', err);
          this.loading = false;
        }
      });

    } else {
      this.alojamientosService.listar(ciudadFiltro, this.page, this.size)
        .subscribe({
          next: (resp: any) => {
            this.alojamientos = resp.content;
            this.total = resp.totalElements;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error cargando alojamientos:', err);
            this.loading = false;
          }
        });
    }
  }

  buscar(): void {
    this.errorBusqueda = '';

    const { checkIn, checkOut } = this.filtrosForm.value;

    if (checkIn && checkOut && checkOut <= checkIn) {
      this.errorBusqueda = 'La fecha de salida debe ser posterior a la de entrada.';
      return;
    }

    this.usandoBusquedaAvanzada = !!(checkIn && checkOut);

    this.page = 0;
    this.cargarAlojamientos();
  }

  siguiente(): void {
    if ((this.page + 1) * this.size < this.total) {
      this.page++;
      this.cargarAlojamientos();
    }
  }

  anterior(): void {
    if (this.page > 0) {
      this.page--;
      this.cargarAlojamientos();
    }
  }
}
