package com.tcc.caa.seguranca;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UsuarioInicialTest {

    @Mock
    private UsuarioRepository repository;
    @Mock
    private PasswordEncoder encoder;

    @Test
    void naoFazNadaQuandoJaExisteUsuario() {
        when(repository.count()).thenReturn(1L);

        new UsuarioInicial(repository, encoder, "admin", "senha12345").run(null);

        verify(repository, never()).save(any());
    }

    @Test
    void criaUsuarioComLoginNormalizadoESenhaCriptografada() {
        when(repository.count()).thenReturn(0L);
        when(encoder.encode("senha12345")).thenReturn("{bcrypt}hash");

        new UsuarioInicial(repository, encoder, "  ADMIN ", "senha12345").run(null);

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getLogin()).isEqualTo("admin");
        assertThat(captor.getValue().getSenhaHash()).isEqualTo("{bcrypt}hash");
    }

    @Test
    void rejeitaSenhaCurta() {
        when(repository.count()).thenReturn(0L);

        assertThatThrownBy(() -> new UsuarioInicial(repository, encoder, "admin", "curta").run(null))
                .isInstanceOf(IllegalStateException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void geraSenhaAleatoriaQuandoNaoConfigurada() {
        when(repository.count()).thenReturn(0L);
        when(encoder.encode(any())).thenReturn("{bcrypt}hash");

        new UsuarioInicial(repository, encoder, "admin", "").run(null);

        ArgumentCaptor<String> senha = ArgumentCaptor.forClass(String.class);
        verify(encoder).encode(senha.capture());
        assertThat(senha.getValue()).hasSize(14).matches("[A-Za-z0-9]+");
    }
}
