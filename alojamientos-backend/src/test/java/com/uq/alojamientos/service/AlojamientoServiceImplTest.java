package com.uq.alojamientos.service;

import com.uq.alojamientos.domain.Alojamiento;
import com.uq.alojamientos.domain.Usuario;
import com.uq.alojamientos.domain.enums.EstadoAlojamiento;
import com.uq.alojamientos.dto.AlojamientoDTO;
import com.uq.alojamientos.repository.AlojamientoRepository;
import com.uq.alojamientos.repository.UsuarioRepository;
import com.uq.alojamientos.service.impl.AlojamientoServiceImpl;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AlojamientoServiceImplTest {

    private AlojamientoRepository repo;
    private UsuarioRepository usuarioRepo;
    private ModelMapper mapper;
    private AlojamientoServiceImpl service;

    @BeforeEach
    void setUp() {
        repo = mock(AlojamientoRepository.class);
        usuarioRepo = mock(UsuarioRepository.class);
        mapper = new ModelMapper();
        service = new AlojamientoServiceImpl(repo, usuarioRepo, mapper);
    }

    @Test
    void crear_DeberiaGuardarYADevolverDTO() {
        // Arrange
        AlojamientoDTO dto = new AlojamientoDTO();
        dto.setAnfitrionId(1L);
        dto.setCiudad("Bogotá");

        Usuario anfitrion = new Usuario();
        anfitrion.setId(1L);

        Alojamiento alojamiento = new Alojamiento();
        alojamiento.setId(10L);
        alojamiento.setCiudad("Bogotá");
        alojamiento.setAnfitrion(anfitrion);
        alojamiento.setEstado(EstadoAlojamiento.ACTIVO);

        when(usuarioRepo.findById(1L)).thenReturn(Optional.of(anfitrion));
        when(repo.save(any(Alojamiento.class))).thenReturn(alojamiento);

        // Act
        AlojamientoDTO resultado = service.crear(dto);

        // Assert
        assertNotNull(resultado);
        assertEquals("Bogotá", resultado.getCiudad());
        verify(repo, times(1)).save(any(Alojamiento.class));
    }

    @Test
    void crear_DeberiaLanzarExcepcion_SiAnfitrionNoExiste() {
        AlojamientoDTO dto = new AlojamientoDTO();
        dto.setAnfitrionId(99L);

        when(usuarioRepo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.crear(dto));
        verify(repo, never()).save(any());
    }

    @Test
    void eliminarLogico_DeberiaActualizarEstadoAlojamiento() {
        Alojamiento alojamiento = new Alojamiento();
        alojamiento.setId(1L);
        alojamiento.setEstado(EstadoAlojamiento.ACTIVO);

        when(repo.findById(1L)).thenReturn(Optional.of(alojamiento));

        service.eliminarLogico(1L);

        assertEquals(EstadoAlojamiento.ELIMINADO, alojamiento.getEstado());
        verify(repo).save(alojamiento);
    }

    @Test
    void buscarActivosPorCiudad_DeberiaRetornarPaginaDeDTOs() {
        Alojamiento alojamiento = new Alojamiento();
        alojamiento.setCiudad("Medellín");
        alojamiento.setEstado(EstadoAlojamiento.ACTIVO);

        when(repo.findByEstadoAndCiudadContainingIgnoreCase(eq(EstadoAlojamiento.ACTIVO), eq("Medellín"), any()))
                .thenReturn(new PageImpl<>(List.of(alojamiento)));

        Page<AlojamientoDTO> resultado = service.buscarActivosPorCiudad("Medellín", PageRequest.of(0, 10));

        assertEquals(1, resultado.getTotalElements());
        assertEquals("Medellín", resultado.getContent().get(0).getCiudad());
    }

    @Test
    void buscarDisponibles_DeberiaLlamarAlRepositorio() {
        when(repo.buscarDisponibles(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        Page<AlojamientoDTO> resultado = service.buscarDisponibles(
                "Cali", BigDecimal.ZERO, BigDecimal.TEN, 2,
                LocalDate.now(), LocalDate.now().plusDays(1),
                PageRequest.of(0, 10)
        );

        assertNotNull(resultado);
        verify(repo, times(1)).buscarDisponibles(any(), any(), any(), any(), any(), any(), any(), any());
    }
}
