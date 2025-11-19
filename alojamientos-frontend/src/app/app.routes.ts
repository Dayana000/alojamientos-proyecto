// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home';
import { AlojamientoDetalleComponent } from './features/alojamientos/alojamiento-detalle.component';
import { ReservaCrearComponent } from './features/reservas/reserva-crear.component';
import { ReservasUsuarioComponent } from './features/reservas/reservas-usuario.component';
import { AnfitrionAlojamientosComponent } from './features/anfitrion/anfitrion-alojamientos.component';

import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // LOGIN
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth-shell')
        .then(m => m.AuthShellComponent),
  },

  // REGISTRO
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register')
        .then(m => m.RegisterComponent),
  },

  // HOME (PROTEGIDO)
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },

  // MIS RESERVAS (USUARIO)
  {
    path: 'mis-reservas',
    component: ReservasUsuarioComponent,
    canActivate: [AuthGuard],
  },

  // MIS ALOJAMIENTOS (ANFITRIÓN)
  {
    path: 'anfitrion/alojamientos',
    component: AnfitrionAlojamientosComponent,
    canActivate: [AuthGuard],
  },

  // DETALLE DE ALOJAMIENTO
  {
    path: 'alojamientos/:id',
    component: AlojamientoDetalleComponent,
    canActivate: [AuthGuard],
  },

  // CREAR RESERVA
  {
    path: 'alojamientos/:id/reservar',
    component: ReservaCrearComponent,
    canActivate: [AuthGuard],
  },

  // CUALQUIER RUTA DESCONOCIDA → HOME
  {
    path: '**',
    redirectTo: '',
  },
];
