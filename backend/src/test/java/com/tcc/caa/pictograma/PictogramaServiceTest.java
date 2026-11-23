package com.tcc.caa.pictograma;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withResourceNotFound;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class PictogramaServiceTest {

    private MockRestServiceServer servidor;
    private PictogramaService service;

    @BeforeEach
    void preparar() {
        RestClient.Builder builder = RestClient.builder();
        servidor = MockRestServiceServer.bindTo(builder).build();
        service = new PictogramaService(builder.build());
    }

    @Test
    void buscaComTextoVazioNaoChamaAApi() {
        assertThat(service.buscar(null)).isEmpty();
        assertThat(service.buscar("   ")).isEmpty();
        servidor.verify();
    }

    @Test
    void buscaMapeiaIdPalavraEUrlDaImagem() {
        servidor.expect(requestTo("https://api.arasaac.org/v1/pictograms/br/search/casa"))
                .andRespond(withSuccess(
                        "[{\"_id\":2475,\"keywords\":[{\"keyword\":\"casa\"}],\"outro\":1},"
                                + "{\"_id\":9,\"keywords\":[]}]",
                        MediaType.APPLICATION_JSON));

        List<PictogramaDTO> resultado = service.buscar(" casa ");

        assertThat(resultado).hasSize(2);
        assertThat(resultado.get(0).id()).isEqualTo(2475);
        assertThat(resultado.get(0).palavra()).isEqualTo("casa");
        assertThat(resultado.get(0).url()).isEqualTo("https://static.arasaac.org/pictograms/2475/2475_300.png");
        assertThat(resultado.get(1).palavra()).isEqualTo(" casa ");
        servidor.verify();
    }

    @Test
    void buscaSemResultadosRetornaListaVazia() {
        servidor.expect(requestTo("https://api.arasaac.org/v1/pictograms/br/search/xyz"))
                .andRespond(withResourceNotFound());

        assertThat(service.buscar("xyz")).isEmpty();
    }

    @Test
    void imagemComIdInvalidoRetornaNulo() {
        assertThat(service.imagem(0)).isNull();
        assertThat(service.imagem(-3)).isNull();
    }

    @Test
    void imagemUsaTamanhoGrandeQuandoDisponivel() {
        servidor.expect(requestTo("https://static.arasaac.org/pictograms/5/5_500.png"))
                .andRespond(withSuccess(new byte[] {1, 2, 3}, MediaType.IMAGE_PNG));

        assertThat(service.imagem(5)).containsExactly(1, 2, 3);
    }

    @Test
    void imagemCaiParaTamanhoMedioQuandoGrandeNaoExiste() {
        servidor.expect(requestTo("https://static.arasaac.org/pictograms/5/5_500.png"))
                .andRespond(withResourceNotFound());
        servidor.expect(requestTo("https://static.arasaac.org/pictograms/5/5_300.png"))
                .andRespond(withSuccess(new byte[] {9}, MediaType.IMAGE_PNG));

        assertThat(service.imagem(5)).containsExactly(9);
    }

    @Test
    void imagemRetornaNuloQuandoNenhumTamanhoExiste() {
        servidor.expect(requestTo("https://static.arasaac.org/pictograms/5/5_500.png"))
                .andRespond(withResourceNotFound());
        servidor.expect(requestTo("https://static.arasaac.org/pictograms/5/5_300.png"))
                .andRespond(withResourceNotFound());

        assertThat(service.imagem(5)).isNull();
    }
}
