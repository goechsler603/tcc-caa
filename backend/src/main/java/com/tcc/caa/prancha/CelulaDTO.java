package com.tcc.caa.prancha;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record CelulaDTO(
        @Min(0) int linha,
        @Min(0) int coluna,
        Long arasaacId,
        @Size(max = 100) String texto,
        @Size(max = 500) String imagemUrl) {}