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

    private final RestClient restClient = RestClient.create();

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

    private String palavra(ArasaacPictograma p, String padrao) {
        if (p.keywords() == null || p.keywords().isEmpty()) {
            return padrao;
        }
        return p.keywords().get(0).keyword();
    }
}