package com.tcc.caa.seguranca;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.tcc.caa.PostgresTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AutenticacaoIntegracaoTest extends PostgresTestBase {

    @Autowired
    private MockMvc mvc;

    @Test
    void healthEhPublico() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void rotasProtegidasRetornam401SemLogin() throws Exception {
        mvc.perform(get("/api/pranchas")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/pictogramas").param("busca", "casa")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/imagens/1")).andExpect(status().isUnauthorized());
    }

    @Test
    void sessaoSemLoginInformaNaoAutenticado() throws Exception {
        mvc.perform(get("/api/auth/sessao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.autenticado").value(false));
    }

    @Test
    void loginComCredenciaisCorretasCriaSessao() throws Exception {
        MvcResult login = mvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .param("username", "admin")
                        .param("password", "senha-de-teste-123"))
                .andExpect(status().isNoContent())
                .andReturn();

        MockHttpSession sessao = (MockHttpSession) login.getRequest().getSession(false);

        mvc.perform(get("/api/auth/sessao").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.autenticado").value(true))
                .andExpect(jsonPath("$.usuario").value("admin"));
        mvc.perform(get("/api/pranchas").session(sessao)).andExpect(status().isOk());
    }

    @Test
    void loginComSenhaErradaRetorna401() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .param("username", "admin")
                        .param("password", "senha-errada"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginSemTokenCsrfEhRecusado() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .param("username", "admin")
                        .param("password", "senha-de-teste-123"))
                .andExpect(status().isForbidden());
    }

    @Test
    void logoutEncerraASessao() throws Exception {
        MvcResult login = mvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .param("username", "admin")
                        .param("password", "senha-de-teste-123"))
                .andReturn();
        MockHttpSession sessao = (MockHttpSession) login.getRequest().getSession(false);

        mvc.perform(post("/api/auth/logout").with(csrf()).session(sessao))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/pranchas").session(sessao)).andExpect(status().isUnauthorized());
    }
}
