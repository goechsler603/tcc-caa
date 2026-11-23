package com.tcc.caa;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Base dos testes de integração: sobe um PostgreSQL real.
 *
 * <p>Por padrão usa Testcontainers (exige Docker). Em máquinas sem Docker, defina
 * TEST_DB_URL, TEST_DB_USER e TEST_DB_PASSWORD para usar um PostgreSQL já em execução
 * (use um banco descartável: as tabelas são recriadas pelo Flyway).
 */
public abstract class PostgresTestBase {

    private static final String URL_EXTERNA = System.getenv("TEST_DB_URL");
    private static final PostgreSQLContainer POSTGRES = URL_EXTERNA == null
            ? new PostgreSQLContainer("postgres:16-alpine")
            : null;

    static {
        if (POSTGRES != null) {
            POSTGRES.start();
        }
    }

    @DynamicPropertySource
    static void propriedades(DynamicPropertyRegistry registry) {
        if (POSTGRES != null) {
            registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
            registry.add("spring.datasource.username", POSTGRES::getUsername);
            registry.add("spring.datasource.password", POSTGRES::getPassword);
        } else {
            registry.add("spring.datasource.url", () -> URL_EXTERNA);
            registry.add("spring.datasource.username", () -> System.getenv("TEST_DB_USER"));
            registry.add("spring.datasource.password", () -> System.getenv("TEST_DB_PASSWORD"));
        }
        registry.add("app.admin.login", () -> "admin");
        registry.add("app.admin.senha", () -> "senha-de-teste-123");
    }
}
