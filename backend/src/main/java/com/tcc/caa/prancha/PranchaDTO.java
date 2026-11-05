package com.tcc.caa.prancha;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record PranchaDTO(
        Long id,
        @NotBlank @Size(max = 120) String titulo,
        @Min(1) @Max(8) int colunas,
        @Min(1) @Max(6) int linhas,
        @Valid List<CelulaDTO> celulas) {}