package com.tcc.caa.prancha;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pranchas")
public class PranchaController {

    private final PranchaService service;

    public PranchaController(PranchaService service) {
        this.service = service;
    }

    @GetMapping
    public List<PranchaResumoDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public PranchaDTO buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PranchaDTO criar(@Valid @RequestBody PranchaDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public PranchaDTO atualizar(@PathVariable Long id, @Valid @RequestBody PranchaDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}