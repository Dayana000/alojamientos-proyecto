package com.uq.alojamientos.security;

import com.uq.alojamientos.domain.Usuario;
import com.uq.alojamientos.domain.enums.RolUsuario;
import com.uq.alojamientos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Carga Usuario por email. Bean @Primary para evitar ambigüedad si hay varias impls.
 */
@Primary
@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + usernameOrEmail));

        String roleName = usuario.getRol() != null ? usuario.getRol().name() : RolUsuario.USER.name();
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName));

        return org.springframework.security.core.userdetails.User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPasswordHash()) // usa passwordHash de tu entidad
                .authorities(authorities)
                .accountLocked(false)
                .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
                .build();
    }
}