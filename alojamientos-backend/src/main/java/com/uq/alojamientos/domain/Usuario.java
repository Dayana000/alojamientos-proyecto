// domain/Usuario.java
package com.uq.alojamientos.domain;

import com.uq.alojamientos.domain.enums.RolUsuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity @Table(name = "usuarios",
        indexes = { @Index(name="uk_usuario_email", columnList = "email", unique = true) })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Usuario {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Column(length = 30)
    private String telefono;

    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolUsuario rol;

    private String fotoUrl;

    @Column(nullable = false)
    private Boolean activo = Boolean.TRUE;
}