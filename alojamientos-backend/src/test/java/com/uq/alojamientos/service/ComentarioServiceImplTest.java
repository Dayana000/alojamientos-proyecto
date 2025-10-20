package com.uq.alojamientos.service;

import com.uq.alojamientos.domain.Alojamiento;
import com.uq.alojamientos.domain.Comentario;
import com.uq.alojamientos.domain.Reserva;
import com.uq.alojamientos.domain.Usuario;
import com.uq.alojamientos.domain.enums.EstadoReserva;
import com.uq.alojamientos.dto.ComentarioDTO;
import com.uq.alojamientos.repository.AlojamientoRepository;
import com.uq.alojamientos.repository.ComentarioRepository;
import com.uq.alojamientos.repository.ReservaRepository;
import com.uq.alojamientos.repository.UsuarioRepository;
import com.uq.alojamientos.service.impl.ComentarioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ComentarioServiceImplTest {

    private ComentarioRepository comentarioRepo;
    private ReservaRepository reservaRepo;
    private AlojamientoRepository alojamientoRepo;
    private UsuarioRepository usuarioRepo;
    private ModelMapper mapper;
    private ComentarioServiceImpl service;

    @BeforeEach
    void setUp() {
        comentarioRepo = mock(ComentarioRepository.class);
        reservaRepo = mock(ReservaRepository.class);
        alojamientoRepo = mock(AlojamientoRepository.class);
        usuarioRepo = mock(UsuarioRepository.class);
        mapper = new ModelMapper();
        service = new ComentarioServiceImpl(comentarioRepo, reservaRepo, alojamientoRepo, usuarioRepo, mapper);
    }

    @Test
    void crear_DeberiaGuardarYDevolverDTO() {
        System.out.println("➡ Ejecutando: crear_DeberiaGuardarYDevolverDTO");

        // Arrange
        ComentarioDTO dto = new ComentarioDTO();
        dto.setReservaId(1L);
        dto.setAlojamientoId(2L);
        dto.setUsuarioId(3L);
        dto.setCalificacion(5);
        //dto.setContenido("Excelente estancia");

        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setEstado(EstadoReserva.COMPLETADA);

        Alojamiento alojamiento = new Alojamiento();
        alojamiento.setId(2L);

        Usuario usuario = new Usuario();
        usuario.setId(3L);

        Comentario comentario = new Comentario();
        comentario.setId(10L);
        //comentario.setContenido("Excelente estancia");

        when(reservaRepo.findById(1L)).thenReturn(Optional.of(reserva));
        when(alojamientoRepo.findById(2L)).thenReturn(Optional.of(alojamiento));
        when(usuarioRepo.findById(3L)).thenReturn(Optional.of(usuario));
        when(comentarioRepo.existsByReservaId(1L)).thenReturn(false);
        when(comentarioRepo.save(any(Comentario.class))).thenReturn(comentario);

        // Act
        ComentarioDTO resultado = service.crear(dto);

        // Assert
        assertNotNull(resultado);
        verify(comentarioRepo).save(any(Comentario.class));
    }

    @Test
    void crear_DeberiaLanzarExcepcion_SiReservaNoExiste() {
        System.out.println("➡ Ejecutando: crear_DeberiaLanzarExcepcion_SiReservaNoExiste");

        ComentarioDTO dto = new ComentarioDTO();
        dto.setReservaId(999L);

        when(reservaRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.crear(dto));
        verify(comentarioRepo, never()).save(any());
    }

    @Test
    void crear_DeberiaLanzarExcepcion_SiReservaNoCompletada() {
        System.out.println("➡ Ejecutando: crear_DeberiaLanzarExcepcion_SiReservaNoCompletada");

        ComentarioDTO dto = new ComentarioDTO();
        dto.setReservaId(1L);
        dto.setAlojamientoId(2L);
        dto.setUsuarioId(3L);
        dto.setCalificacion(4);

        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setEstado(EstadoReserva.CANCELADA);

        when(reservaRepo.findById(1L)).thenReturn(Optional.of(reserva));
        when(alojamientoRepo.findById(2L)).thenReturn(Optional.of(new Alojamiento()));
        when(usuarioRepo.findById(3L)).thenReturn(Optional.of(new Usuario()));

        assertThrows(IllegalStateException.class, () -> service.crear(dto));
    }

    @Test
    void crear_DeberiaLanzarExcepcion_SiYaExisteComentarioParaReserva() {
        System.out.println("➡ Ejecutando: crear_DeberiaLanzarExcepcion_SiYaExisteComentarioParaReserva");

        ComentarioDTO dto = new ComentarioDTO();
        dto.setReservaId(1L);
        dto.setAlojamientoId(2L);
        dto.setUsuarioId(3L);
        dto.setCalificacion(5);

        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setEstado(EstadoReserva.COMPLETADA);

        when(reservaRepo.findById(1L)).thenReturn(Optional.of(reserva));
        when(alojamientoRepo.findById(2L)).thenReturn(Optional.of(new Alojamiento()));
        when(usuarioRepo.findById(3L)).thenReturn(Optional.of(new Usuario()));
        when(comentarioRepo.existsByReservaId(1L)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> service.crear(dto));
    }

    @Test
    void crear_DeberiaLanzarExcepcion_SiCalificacionInvalida() {
        System.out.println("➡ Ejecutando: crear_DeberiaLanzarExcepcion_SiCalificacionInvalida");

        ComentarioDTO dto = new ComentarioDTO();
        dto.setReservaId(1L);
        dto.setAlojamientoId(2L);
        dto.setUsuarioId(3L);
        dto.setCalificacion(6); // fuera del rango

        Reserva reserva = new Reserva();
        reserva.setId(1L);
        reserva.setEstado(EstadoReserva.COMPLETADA);

        when(reservaRepo.findById(1L)).thenReturn(Optional.of(reserva));
        when(alojamientoRepo.findById(2L)).thenReturn(Optional.of(new Alojamiento()));
        when(usuarioRepo.findById(3L)).thenReturn(Optional.of(new Usuario()));
        when(comentarioRepo.existsByReservaId(1L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
    }

    @Test
    void listarPorAlojamiento_DeberiaRetornarPaginaDeDTOs() {
        System.out.println("➡ Ejecutando: listarPorAlojamiento_DeberiaRetornarPaginaDeDTOs");

        Comentario comentario = new Comentario();
        //comentario.setContenido("Todo bien");

        when(comentarioRepo.findByAlojamientoIdOrderByCreatedAtDesc(eq(5L), any()))
                .thenReturn(new PageImpl<>(List.of(comentario)));

        Page<ComentarioDTO> resultado = service.listarPorAlojamiento(5L, PageRequest.of(0, 10));

        assertEquals(1, resultado.getTotalElements());
        //assertEquals("Todo bien", resultado.getContent().get(0).getContenido());
    }

    @Test
    void promedioCalificacion_DeberiaRedondearCorrectamente() {
        System.out.println("➡ Ejecutando: promedioCalificacion_DeberiaRedondearCorrectamente");

        when(comentarioRepo.promedioPorAlojamiento(1L)).thenReturn(4.26);
        Double promedio = service.promedioCalificacion(1L);

        assertEquals(4.3, promedio);
    }

    @Test
    void promedioCalificacion_DeberiaRetornarCeroSiNoHayDatos() {
        System.out.println("➡ Ejecutando: promedioCalificacion_DeberiaRetornarCeroSiNoHayDatos");

        when(comentarioRepo.promedioPorAlojamiento(1L)).thenReturn(null);
        Double promedio = service.promedioCalificacion(1L);

        assertEquals(0.0, promedio);
    }

    @Test
    void responder_DeberiaActualizarRespuestaYGuardar() {
        System.out.println("➡ Ejecutando: responder_DeberiaActualizarRespuestaYGuardar");

        Comentario comentario = new Comentario();
        comentario.setId(1L);

        when(comentarioRepo.findById(1L)).thenReturn(Optional.of(comentario));

        service.responder(1L, "Gracias por tu opinión");

        assertEquals("Gracias por tu opinión", comentario.getRespuestaAnfitrion());
        verify(comentarioRepo).save(comentario);
    }

    @Test
    void responder_DeberiaLanzarExcepcion_SiComentarioNoExiste() {
        System.out.println("➡ Ejecutando: responder_DeberiaLanzarExcepcion_SiComentarioNoExiste");

        when(comentarioRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.responder(999L, "Respuesta"));
        verify(comentarioRepo, never()).save(any());
    }
}
