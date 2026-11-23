package com.tcc.caa.imagem;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.tcc.caa.PostgresTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ImagemIntegracaoTest extends PostgresTestBase {

    private static final byte[] PNG = {
            (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3, 4};

    @Autowired
    private MockMvc mvc;

    private MockMultipartFile arquivo(byte[] bytes) {
        return new MockMultipartFile("arquivo", "foto.png", MediaType.IMAGE_PNG_VALUE, bytes);
    }

    @Test
    void enviaEBaixaPngValido() throws Exception {
        String json = mvc.perform(multipart("/api/imagens").file(arquivo(PNG))
                        .with(user("admin")).with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.url").exists())
                .andReturn().getResponse().getContentAsString();
        String url = com.jayway.jsonpath.JsonPath.read(json, "$.url");

        mvc.perform(get(url).with(user("admin")))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(content().bytes(PNG));
    }

    @Test
    void rejeitaArquivoQueNaoEPng() throws Exception {
        byte[] texto = "<script>alert(1)</script>".getBytes();
        mvc.perform(multipart("/api/imagens").file(arquivo(texto))
                        .with(user("admin")).with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejeitaArquivoVazio() throws Exception {
        mvc.perform(multipart("/api/imagens").file(arquivo(new byte[0]))
                        .with(user("admin")).with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejeitaArquivoCurtoDemaisParaTerAssinatura() throws Exception {
        mvc.perform(multipart("/api/imagens").file(arquivo(new byte[] {(byte) 0x89, 'P'}))
                        .with(user("admin")).with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void imagemInexistenteRetorna404() throws Exception {
        mvc.perform(get("/api/imagens/999999").with(user("admin")))
                .andExpect(status().isNotFound());
    }
}
