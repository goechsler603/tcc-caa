CREATE TABLE usuario (
                         id         BIGSERIAL PRIMARY KEY,
                         login      VARCHAR(60) NOT NULL UNIQUE,
                         senha_hash VARCHAR(100) NOT NULL,
                         criado_em  TIMESTAMP NOT NULL DEFAULT now()
);