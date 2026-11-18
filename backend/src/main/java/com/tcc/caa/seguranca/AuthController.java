package com.tcc.caa.seguranca;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record SessaoDTO(boolean autenticado, String usuario) {}

    @GetMapping("/sessao")
    public SessaoDTO sessao(@AuthenticationPrincipal UserDetails usuario) {
        return usuario == null
                ? new SessaoDTO(false, null)
                : new SessaoDTO(true, usuario.getUsername());
    }
}
