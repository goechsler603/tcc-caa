CREATE TABLE imagem (
                        id        BIGSERIAL PRIMARY KEY,
                        dados     BYTEA NOT NULL,
                        criada_em TIMESTAMP NOT NULL DEFAULT now()
);