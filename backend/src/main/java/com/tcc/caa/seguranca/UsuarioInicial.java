package com.tcc.caa.seguranca;

import java.security.SecureRandom;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UsuarioInicial implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(UsuarioInicial.class);
    private static final String ALFABETO =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    private final UsuarioRepository repository;
    private final PasswordEncoder encoder;
    private final String login;
    private final String senha;

    public UsuarioInicial(UsuarioRepository repository,
                          PasswordEncoder encoder,
                          @Value("${app.admin.login:admin}") String login,
                          @Value("${app.admin.senha:}") String senha) {
        this.repository = repository;
        this.encoder = encoder;
        this.login = login;
        this.senha = senha;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }

        String senhaFinal = senha;
        if (senhaFinal == null || senhaFinal.isBlank()) {
            senhaFinal = gerarSenha();
            log.warn("Nenhuma senha inicial configurada. Senha gerada para '{}': {}", login, senhaFinal);
        } else if (senhaFinal.length() < 8) {
            throw new IllegalStateException("A senha inicial precisa ter pelo menos 8 caracteres.");
        }

        repository.save(new Usuario(login.trim().toLowerCase(Locale.ROOT), encoder.encode(senhaFinal)));
        log.info("Usuário inicial '{}' criado.", login);
    }

    private String gerarSenha() {
        SecureRandom aleatorio = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 14; i++) {
            sb.append(ALFABETO.charAt(aleatorio.nextInt(ALFABETO.length())));
        }
        return sb.toString();
    }
}