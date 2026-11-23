package com.tcc.caa.prancha;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.tcc.caa.PostgresTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@SpringBootTest
@AutoConfigureMockMvc
class PranchaIntegracaoTest extends PostgresTestBase {

    private static final String CELULA =
            "{\"linha\":0,\"coluna\":0,\"arasaacId\":2475,\"texto\":\"casa\","
                    + "\"alinhHorizontal\":\"centro\",\"alinhVertical\":\"base\","
                    + "\"corBorda\":\"#112233\",\"corFundo\":\"#ffffff\"}";

    @Autowired
    private MockMvc mvc;

    private static String prancha(String titulo, int colunas, int linhas, String celulas) {
        return "{\"titulo\":\"" + titulo + "\",\"colunas\":" + colunas
                + ",\"linhas\":" + linhas + ",\"celulas\":[" + celulas + "]}";
    }

    private MockHttpServletRequestBuilder autenticado(MockHttpServletRequestBuilder req, String corpo) {
        return req.with(user("admin")).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(corpo);
    }

    private long criar(String corpo) throws Exception {
        String json = mvc.perform(autenticado(post("/api/pranchas"), corpo))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) com.jayway.jsonpath.JsonPath.read(json, "$.id")).longValue();
    }

    @Test
    void criaEBuscaPranchaComCelulas() throws Exception {
        long id = criar(prancha("Rotina", 4, 3, CELULA));

        mvc.perform(get("/api/pranchas/" + id).with(user("admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Rotina"))
                .andExpect(jsonPath("$.celulas.length()").value(1))
                .andExpect(jsonPath("$.celulas[0].texto").value("casa"))
                .andExpect(jsonPath("$.celulas[0].corBorda").value("#112233"));
    }

    @Test
    void listaPranchasCriadas() throws Exception {
        criar(prancha("Lista A", 2, 2, ""));
        mvc.perform(get("/api/pranchas").with(user("admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.titulo=='Lista A')]").exists());
    }

    @Test
    void atualizaSubstituindoCelulasSemViolarRestricaoUnica() throws Exception {
        long id = criar(prancha("Original", 4, 3, CELULA));

        String novaCelula = CELULA.replace("casa", "escola");
        mvc.perform(autenticado(put("/api/pranchas/" + id), prancha("Editada", 4, 3, novaCelula)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Editada"))
                .andExpect(jsonPath("$.celulas.length()").value(1))
                .andExpect(jsonPath("$.celulas[0].texto").value("escola"));

        mvc.perform(get("/api/pranchas/" + id).with(user("admin")))
                .andExpect(jsonPath("$.celulas[0].texto").value("escola"));
    }

    @Test
    void descartaCelulasForaDaGradeERepetidas() throws Exception {
        String fora = CELULA.replace("\"linha\":0", "\"linha\":5");
        long id = criar(prancha("Grade", 2, 2, CELULA + "," + CELULA + "," + fora));

        mvc.perform(get("/api/pranchas/" + id).with(user("admin")))
                .andExpect(jsonPath("$.celulas.length()").value(1));
    }

    @Test
    void excluiPrancha() throws Exception {
        long id = criar(prancha("Apagar", 2, 2, CELULA));

        mvc.perform(delete("/api/pranchas/" + id).with(user("admin")).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/pranchas/" + id).with(user("admin")))
                .andExpect(status().isNotFound());
    }

    @Test
    void buscarInexistenteRetorna404() throws Exception {
        mvc.perform(get("/api/pranchas/999999").with(user("admin")))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejeitaTituloEmBranco() throws Exception {
        mvc.perform(autenticado(post("/api/pranchas"), prancha("  ", 4, 3, "")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejeitaGradeForaDosLimites() throws Exception {
        mvc.perform(autenticado(post("/api/pranchas"), prancha("Grande", 9, 3, "")))
                .andExpect(status().isBadRequest());
        mvc.perform(autenticado(post("/api/pranchas"), prancha("Alta", 4, 7, "")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejeitaCorEAlinhamentoInvalidos() throws Exception {
        String corRuim = CELULA.replace("#112233", "vermelho");
        String alinhRuim = CELULA.replace("centro", "diagonal");
        mvc.perform(autenticado(post("/api/pranchas"), prancha("Cor", 4, 3, corRuim)))
                .andExpect(status().isBadRequest());
        mvc.perform(autenticado(post("/api/pranchas"), prancha("Alinh", 4, 3, alinhRuim)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void escritaSemCsrfEhRecusada() throws Exception {
        mvc.perform(post("/api/pranchas").with(user("admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(prancha("Sem CSRF", 4, 3, "")))
                .andExpect(status().isForbidden());
    }
}
