package com.uq.alojamientos.service;

import com.uq.alojamientos.domain.Alojamiento;
import com.uq.alojamientos.domain.Reserva;
import com.uq.alojamientos.domain.Usuario;
import com.uq.alojamientos.domain.enums.EstadoReserva;
import com.uq.alojamientos.dto.ReservaDTO;
import com.uq.alojamientos.repository.AlojamientoRepository;
import com.uq.alojamientos.repository.ReservaRepository;
import com.uq.alojamientos.repository.UsuarioRepository;
import com.uq.alojamientos.service.impl.ReservaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReservaServiceImplTest {

    private ReservaRepository reservaRepo;
    private AlojamientoRepository alojamientoRepo;
    private UsuarioRepository usuarioRepo;
    private ModelMapper mapper;
    private ReservaServiceImpl service;

    @BeforeEach
    void setUp() {
        reservaRepo = mock(ReservaRepository.class);
        alojamientoRepo = mock(AlojamientoRepository.class);
        usuarioRepo = mock(UsuarioRepository.class);
        mapper = new ModelMapper();
        service = new ReservaServiceImpl(reservaRepo, alojamientoRepo, usuarioRepo, mapper);
    }

    @Test
    void crear_DeberiaGuardarReservaCorrectamente() {
        System.out.println("Ejecutando test: crear_DeberiaGuardarReservaCorrectamente");

        // Arrange
        ReservaDTO dto = new ReservaDTO();
        dto.setAlojamientoId(1L);
        dto.setUsuarioId(2L);
        dto.setCheckIn(LocalDate.now().plusDays(5));
        dto.setCheckOut(LocalDate.now().plusDays(8));
        dto.setHuespedes(2);

        Alojamiento alojamiento = new Alojamiento();
        alojamiento.setId(1L);
        alojamiento.setCapacidadMaxima(4);
        alojamiento.setPrecioPorNoche(new BigDecimal("100"));

        Usuario usuario = new Usuario();
        usuario.setId(2L);

        when(alojamientoRepo.findById(1L)).thenReturn(Optional.of(alojamiento));
        when(usuarioRepo.findById(2L)).thenReturn(Optional.of(usuario));
        when(reservaRepo.existeSolapamiento(eq(1L), any(), any(), any())).thenReturn(false);
        when(reservaRepo.save(any(Reserva.class))).thenAnswer(invocation -> {
            Reserva r = invocation.getArgument(0);
            r.setId(10L);
            return r;
        });

        // Act
        ReservaDTO resultado = service.crear(dto);

        // Assert
        assertNotNull(resultado);
        assertEquals(EstadoReserva.PENDIENTE, resultado.getEstado());
        verify(reservaRepo, times(1)).save(any(Reserva.class));

        System.out.println("Test crear_DeberiaGuardarReservaCorrectamente completado.\n");
    }

    @Test
    void crear_DeberiaLanzarExcepcion_SiFechasInvalidas() {
        System.out.println("Ejecutando test: crear_DeberiaLanzarExcepcion_SiFechasInvalidas");

        ReservaDTO dto = new ReservaDTO();
        dto.setCheckIn(LocalDate.now().plusDays(5));
        dto.setCheckOut(LocalDate.now().plusDays(2)); // inválido

        assertThrows(IllegalArgumentException.class, () -> service.crear(dto));

        System.out.println("Test crear_DeberiaLanzarExcepcion_SiFechasInvalidas completado.\n");
    }

    @Test
    void crear_DeberiaLanzarExcepcion_SiAlojamientoNoExiste() {
        System.out.println("Ejecutando test: crear_DeberiaLanzarExcepcion_SiAlojamientoNoExiste");

        ReservaDTO dto = new ReservaDTO();
        dto.setAlojamientoId(1L);
        dto.setUsuarioId(2L);
        dto.setCheckIn(LocalDate.now().plusDays(3));
        dto.setCheckOut(LocalDate.now().plusDays(5));
        dto.setHuespedes(2);

        when(alojamientoRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.crear(dto));

        System.out.println("Test crear_DeberiaLanzarExcepcion_SiAlojamientoNoExiste completado.\n");
    }

    @Test
    void cancelar_DeberiaActualizarEstadoACancelada() {
        System.out.println("Ejecutando test: cancelar_DeberiaActualizarEstadoACancelada");

        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setCheckIn(LocalDate.now().plusDays(3));
        reserva.setEstado(EstadoReserva.CONFIRMADA);

        when(reservaRepo.findById(1L)).thenReturn(Optional.of(reserva));

        service.cancelar(1L);

        assertEquals(EstadoReserva.CANCELADA, reserva.getEstado());
        verify(reservaRepo).save(reserva);

        System.out.println("Test cancelar_DeberiaActualizarEstadoACancelada completado.\n");
    }

    @Test
    void cancelar_DeberiaLanzarExcepcion_SiReservaNoExiste() {
        System.out.println("Ejecutando test: cancelar_DeberiaLanzarExcepcion_SiReservaNoExiste");

        when(reservaRepo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.cancelar(99L));

        System.out.println("Test cancelar_DeberiaLanzarExcepcion_SiReservaNoExiste completado.\n");
    }

    @Test
    void listarPorUsuario_DeberiaRetornarPaginaDeReservas() {
        System.out.println("Ejecutando test: listarPorUsuario_DeberiaRetornarPaginaDeReservas");

        Reserva reserva = new Reserva();
        reserva.setId(1L);

        when(reservaRepo.findByUsuario(eq(2L), any()))
                .thenReturn(new PageImpl<>(List.of(reserva)));

        Page<ReservaDTO> resultado = service.listarPorUsuario(2L, PageRequest.of(0, 5));

        assertEquals(1, resultado.getTotalElements());
        verify(reservaRepo).findByUsuario(eq(2L), any());

        System.out.println("Test listarPorUsuario_DeberiaRetornarPaginaDeReservas completado.\n");
    }

    @Test
    void listarPorAlojamiento_DeberiaRetornarPaginaDeReservas() {
        System.out.println("Ejecutando test: listarPorAlojamiento_DeberiaRetornarPaginaDeReservas");

        Reserva reserva = new Reserva();
        reserva.setId(1L);

        when(reservaRepo.findByAlojamiento(eq(1L), any()))
                .thenReturn(new PageImpl<>(List.of(reserva)));

        Page<ReservaDTO> resultado = service.listarPorAlojamiento(1L, PageRequest.of(0, 5));

        assertEquals(1, resultado.getTotalElements());
        verify(reservaRepo).findByAlojamiento(eq(1L), any());

        System.out.println("Test listarPorAlojamiento_DeberiaRetornarPaginaDeReservas completado.\n");
    }
}
