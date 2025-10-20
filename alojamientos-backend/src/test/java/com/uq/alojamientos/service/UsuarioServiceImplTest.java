package com.uq.alojamientos.service;

import com.uq.alojamientos.domain.Usuario;
import com.uq.alojamientos.domain.enums.RolUsuario;
import com.uq.alojamientos.dto.UsuarioDTO;
import com.uq.alojamientos.repository.UsuarioRepository;
import com.uq.alojamientos.service.impl.UsuarioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioServiceImplTest {

    private UsuarioRepository repo;
    private ModelMapper mapper;
    private BCryptPasswordEncoder encoder;
    private UsuarioServiceImpl service;

    @BeforeEach
    void setUp() {
        repo = mock(UsuarioRepository.class);
        mapper = new ModelMapper();
        encoder = mock(BCryptPasswordEncoder.class);
        service = new UsuarioServiceImpl(repo, mapper, encoder);
    }

    // ======================================================
    // registrar()
    // ======================================================

    @Test
    void registrar_DeberiaRegistrarUsuarioCorrectamente() {
        System.out.println("➡ Ejecutando: registrar_DeberiaRegistrarUsuarioCorrectamente");

        // Arrange
        UsuarioDTO dto = new UsuarioDTO();
        dto.setNombre("Juan Pérez");
        dto.setEmail("juan@correo.com");
        dto.setPassword("1234");
        dto.setRol("USER");

        when(repo.existsByEmail("juan@correo.com")).thenReturn(false);
        when(encoder.encode("1234")).thenReturn("hashed1234");

        Usuario usuarioGuardado = Usuario.builder()
                .id(1L)
                .nombre("Juan Pérez")
                .email("juan@correo.com")
                .passwordHash("hashed1234")
                .rol(RolUsuario.USER)
                .activo(true)
                .build();

        when(repo.save(any(Usuario.class))).thenReturn(usuarioGuardado);

        // Act
        UsuarioDTO resultado = service.registrar(dto);

        // Assert
        assertNotNull(resultado);
        assertEquals("Juan Pérez", resultado.getNombre());
        assertEquals("juan@correo.com", resultado.getEmail());
        assertNull(resultado.getPassword(), "El password no debe ser devuelto");
        verify(repo).save(any(Usuario.class));
    }

    @Test
    void registrar_DeberiaLanzarExcepcion_SiEmailYaExiste() {
        System.out.println("➡ Ejecutando: registrar_DeberiaLanzarExcepcion_SiEmailYaExiste");

        UsuarioDTO dto = new UsuarioDTO();
        dto.setEmail("ya@existe.com");

        when(repo.existsByEmail("ya@existe.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> service.registrar(dto));
        verify(repo, never()).save(any());
    }

    @Test
    void registrar_DeberiaLanzarExcepcion_SiRolInvalido() {
        System.out.println("➡ Ejecutando: registrar_DeberiaLanzarExcepcion_SiRolInvalido");

        UsuarioDTO dto = new UsuarioDTO();
        dto.setEmail("nuevo@correo.com");
        dto.setPassword("abc");
        dto.setRol("SUPERHEROE");

        when(repo.existsByEmail("nuevo@correo.com")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> service.registrar(dto));
    }

    // ======================================================
    // listar()
    // ======================================================

    @Test
    void listar_DeberiaRetornarListaDeUsuariosDTO() {
        System.out.println("➡ Ejecutando: listar_DeberiaRetornarListaDeUsuariosDTO");

        Usuario u1 = Usuario.builder()
                .id(1L)
                .nombre("Alice")
                .email("alice@mail.com")
                .rol(RolUsuario.USER)
                .passwordHash("hash1")
                .activo(true)
                .build();

        Usuario u2 = Usuario.builder()
                .id(2L)
                .nombre("Bob")
                .email("bob@mail.com")
                .rol(RolUsuario.ANFITRION)
                .passwordHash("hash2")
                .activo(true)
                .build();

        when(repo.findAll()).thenReturn(List.of(u1, u2));

        List<UsuarioDTO> resultado = service.listar();

        assertEquals(2, resultado.size());
        assertNull(resultado.get(0).getPassword());
        assertEquals("Alice", resultado.get(0).getNombre());
        assertEquals("Bob", resultado.get(1).getNombre());
    }

    // ======================================================
    // obtenerPorId()
    // ======================================================

    @Test
    void obtenerPorId_DeberiaRetornarUsuarioDTO() {
        System.out.println("➡ Ejecutando: obtenerPorId_DeberiaRetornarUsuarioDTO");

        Usuario usuario = Usuario.builder()
                .id(10L)
                .nombre("Carlos")
                .email("carlos@mail.com")
                .rol(RolUsuario.ADMIN)
                .passwordHash("abc123")
                .activo(true)
                .build();

        when(repo.findById(10L)).thenReturn(Optional.of(usuario));

        UsuarioDTO resultado = service.obtenerPorId(10L);

        assertNotNull(resultado);
        assertEquals("Carlos", resultado.getNombre());
        assertEquals("carlos@mail.com", resultado.getEmail());
        assertNull(resultado.getPassword(), "El password debe ser nulo en el DTO");
    }

    @Test
    void obtenerPorId_DeberiaLanzarExcepcion_SiNoExisteUsuario() {
        System.out.println("➡ Ejecutando: obtenerPorId_DeberiaLanzarExcepcion_SiNoExisteUsuario");

        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.obtenerPorId(99L));
    }
}
