package com.tcc.caa.pictograma;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
public class PictogramaService {

    private static final String API = "https://api.arasaac.org/v1/pictograms/{idioma}/search/{texto}";
    private static final String IMAGEM = "https://static.arasaac.org/pictograms/%d/%d_300.png";
    private static final String IDIOMA = "br";
    private static final int LIMITE = 40;
    private static final String IMAGEM_GRANDE = "https://static.arasaac.org/pictograms/{id}/{id}_500.png";
    private static final String IMAGEM_MEDIA = "https://static.arasaac.org/pictograms/{id}/{id}_300.png";

    private final RestClient restClient;

    public PictogramaService() {
        this(RestClient.create());
    }

    // Permite injetar um RestClient nos testes (sem chamar a API real do ARASAAC)
    PictogramaService(RestClient restClient) {
        this.restClient = restClient;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ArasaacPictograma(@JsonProperty("_id") long id, List<Keyword> keywords) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Keyword(String keyword) {}

    public List<PictogramaDTO> buscar(String texto) {
        if (texto == null || texto.isBlank()) {
            return List.of();
        }
        try {
            ArasaacPictograma[] resposta = restClient.get()
                    .uri(API, IDIOMA, texto.trim())
                    .retrieve()
                    .body(ArasaacPictograma[].class);

            if (resposta == null) {
                return List.of();
            }
            return Arrays.stream(resposta)
                    .limit(LIMITE)
                    .map(p -> new PictogramaDTO(
                            p.id(),
                            palavra(p, texto),
                            IMAGEM.formatted(p.id(), p.id())))
                    .toList();
        } catch (HttpClientErrorException.NotFound e) {
            return List.of();
        }
    }
    public byte[] imagem(long id) {
        if (id <= 0) {
            return null;
        }
        for (String modelo : List.of(IMAGEM_GRANDE, IMAGEM_MEDIA)) {
            try {
                byte[] bytes = restClient.get()
                        .uri(modelo, java.util.Map.of("id", id))
                        .retrieve()
                        .body(byte[].class);
                if (bytes != null && bytes.length > 0) {
                    return bytes;
                }
            } catch (HttpClientErrorException e) {
                // tenta o próximo tamanho
            }
        }
        return null;
    }

    private String palavra(ArasaacPictograma p, String padrao) {
        if (p.keywords() == null || p.keywords().isEmpty()) {
            return padrao;
        }
        return p.keywords().get(0).keyword();
    }
}