package com.tcc.caa.imagem;

import java.io.IOException;
import java.time.Duration;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/imagens")
public class ImagemController {

    private static final long TAMANHO_MAXIMO = 3L * 1024 * 1024;
    private static final byte[] ASSINATURA_PNG =
            {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};

    private final ImagemRepository repository;

    public ImagemController(ImagemRepository repository) {
        this.repository = repository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ImagemDTO enviar(@RequestParam("arquivo") MultipartFile arquivo) throws IOException {
        if (arquivo.isEmpty() || arquivo.getSize() > TAMANHO_MAXIMO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem vazia ou grande demais");
        }
        byte[] bytes = arquivo.getBytes();
        if (!ehPng(bytes)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas imagens PNG são aceitas");
        }
        Imagem salva = repository.save(new Imagem(bytes));
        return new ImagemDTO(salva.getId(), "/api/imagens/" + salva.getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> obter(@PathVariable long id) {
        return repository.findById(id)
                .map(imagem -> ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .header("X-Content-Type-Options", "nosniff")
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePrivate())
                        .body(imagem.getDados()))
                .orElse(ResponseEntity.notFound().build());
    }

    private boolean ehPng(byte[] bytes) {
        if (bytes.length < ASSINATURA_PNG.length) {
            return false;
        }
        for (int i = 0; i < ASSINATURA_PNG.length; i++) {
            if (bytes[i] != ASSINATURA_PNG[i]) {
                return false;
            }
        }
        return true;
    }
}