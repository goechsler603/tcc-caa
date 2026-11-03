package com.tcc.caa.pictograma;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pictogramas")
public class PictogramaController {

    private final PictogramaService service;

    public PictogramaController(PictogramaService service) {
        this.service = service;
    }

    @GetMapping
    public List<PictogramaDTO> buscar(@RequestParam String busca) {
        return service.buscar(busca);
    }
}