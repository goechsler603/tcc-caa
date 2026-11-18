package com.tcc.caa.prancha;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PranchaServiceTest {

    @Mock
    private PranchaRepository repository;

    private PranchaService service() {
        return new PranchaService(repository);
    }

    private static CelulaDTO celula(int linha, int coluna, String texto) {
        return new CelulaDTO(linha, coluna, 10L, texto, null, "centro", "base", "#000000", "#ffffff");
    }

    private static PranchaDTO dto(String titulo, int colunas, int linhas, List<CelulaDTO> celulas) {
        return new PranchaDTO(null, titulo, colunas, linhas, celulas);
    }

    @Test
    void criarRemoveEspacosDoTituloEPersisteCelulas() {
        when(repository.save(any(Prancha.class))).thenAnswer(i -> i.getArgument(0));

        PranchaDTO resultado = service().criar(dto("  Rotina  ", 3, 2, List.of(celula(0, 0, "a"), celula(1, 2, "b"))));

        assertThat(resultado.titulo()).isEqualTo("Rotina");
        assertThat(resultado.colunas()).isEqualTo(3);
        assertThat(resultado.celulas()).hasSize(2);
    }

    @Test
    void criarDescartaCelulasForaDaGrade() {
        when(repository.save(any(Prancha.class))).thenAnswer(i -> i.getArgument(0));

        PranchaDTO resultado = service().criar(dto("Grade", 2, 2,
                List.of(celula(0, 0, "ok"), celula(2, 0, "linha fora"), celula(0, 2, "coluna fora"))));

        assertThat(resultado.celulas()).extracting(CelulaDTO::texto).containsExactly("ok");
    }

    @Test
    void criarDescartaPosicoesRepetidasMantendoAPrimeira() {
        when(repository.save(any(Prancha.class))).thenAnswer(i -> i.getArgument(0));

        PranchaDTO resultado = service().criar(dto("Dup", 2, 2,
                List.of(celula(1, 1, "primeira"), celula(1, 1, "segunda"))));

        assertThat(resultado.celulas()).extracting(CelulaDTO::texto).containsExactly("primeira");
    }

    @Test
    void criarAceitaListaDeCelulasNula() {
        when(repository.save(any(Prancha.class))).thenAnswer(i -> i.getArgument(0));

        PranchaDTO resultado = service().criar(dto("Vazia", 2, 2, null));

        assertThat(resultado.celulas()).isEmpty();
    }

    @Test
    void listarMapeiaParaResumo() {
        Prancha p = new Prancha();
        p.setTitulo("A");
        p.setColunas(4);
        p.setLinhas(3);
        when(repository.findAllByOrderByIdDesc()).thenReturn(List.of(p));

        List<PranchaResumoDTO> lista = service().listar();

        assertThat(lista).hasSize(1);
        assertThat(lista.get(0).titulo()).isEqualTo("A");
        assertThat(lista.get(0).colunas()).isEqualTo(4);
        assertThat(lista.get(0).linhas()).isEqualTo(3);
    }

    @Test
    void buscarInexistenteLancaNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().buscar(99L))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void atualizarFazFlushAntesDeInserirNovasCelulas() {
        Prancha existente = new Prancha();
        existente.setTitulo("Velha");
        when(repository.findById(1L)).thenReturn(Optional.of(existente));

        PranchaDTO resultado = service().atualizar(1L, dto("Nova", 2, 2, List.of(celula(0, 0, "x"))));

        InOrder ordem = inOrder(repository);
        ordem.verify(repository).findById(1L);
        ordem.verify(repository).flush();
        assertThat(resultado.titulo()).isEqualTo("Nova");
        assertThat(resultado.celulas()).hasSize(1);
    }

    @Test
    void atualizarInexistenteLancaNotFound() {
        when(repository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().atualizar(5L, dto("X", 1, 1, List.of())))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void excluirRemoveAPrancha() {
        Prancha existente = new Prancha();
        when(repository.findById(1L)).thenReturn(Optional.of(existente));

        service().excluir(1L);

        verify(repository).delete(existente);
    }

    @Test
    void excluirInexistenteLancaNotFound() {
        when(repository.findById(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().excluir(7L)).isInstanceOf(ResponseStatusException.class);
    }
}
