package com.tcc.caa.seguranca;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class UsuarioDetailsServiceTest {

    @Mock
    private UsuarioRepository repository;

    @Test
    void carregaUsuarioIgnorandoCaixaEEspacos() {
        when(repository.findByLogin("admin")).thenReturn(Optional.of(new Usuario("admin", "{bcrypt}x")));

        UserDetails detalhes = new UsuarioDetailsService(repository).loadUserByUsername("  Admin ");

        assertThat(detalhes.getUsername()).isEqualTo("admin");
        assertThat(detalhes.getPassword()).isEqualTo("{bcrypt}x");
        assertThat(detalhes.getAuthorities()).extracting("authority").containsExactly("ROLE_TERAPEUTA");
    }

    @Test
    void usuarioInexistenteLancaExcecao() {
        when(repository.findByLogin("ninguem")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> new UsuarioDetailsService(repository).loadUserByUsername("ninguem"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
