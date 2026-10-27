CREATE TABLE prancha (
                         id          BIGSERIAL PRIMARY KEY,
                         titulo      VARCHAR(120) NOT NULL,
                         colunas     INT NOT NULL DEFAULT 4,
                         linhas      INT NOT NULL DEFAULT 3,
                         cor_borda   VARCHAR(9),
                         cor_fundo   VARCHAR(9),
                         criada_em   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE celula_prancha (
                                id               BIGSERIAL PRIMARY KEY,
                                prancha_id       BIGINT NOT NULL REFERENCES prancha(id) ON DELETE CASCADE,
                                linha            INT NOT NULL,
                                coluna           INT NOT NULL,
                                arasaac_id       BIGINT,
                                imagem_url       VARCHAR(500),
                                texto            VARCHAR(100),
                                alinh_horizontal VARCHAR(10),
                                alinh_vertical   VARCHAR(10),
                                cor_borda        VARCHAR(9),
                                cor_fundo        VARCHAR(9),
                                UNIQUE (prancha_id, linha, coluna)
);