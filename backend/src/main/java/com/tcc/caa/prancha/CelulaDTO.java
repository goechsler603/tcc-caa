package com.tcc.caa.prancha;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CelulaDTO(
        @Min(0) int linha,
        @Min(0) int coluna,
        Long arasaacId,
        @Size(max = 100) String texto,
        @Size(max = 500) String imagemUrl,
        @Pattern(regexp = "esquerda|centro|direita") String alinhHorizontal,
        @Pattern(regexp = "topo|meio|base") String alinhVertical,
        @Pattern(regexp = "#[0-9a-fA-F]{6}") String corBorda,
        @Pattern(regexp = "#[0-9a-fA-F]{6}") String corFundo) {}