package com.tcc.caa.pictograma;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.Duration;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

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

    @GetMapping("/{id}/imagem")
    public ResponseEntity<byte[]> imagem(@PathVariable long id) {
        byte[] bytes = service.imagem(id);
        if (bytes == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(bytes);
    }

}