package com.tcc.caa.prancha;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PranchaService {

    private final PranchaRepository repository;

    public PranchaService(PranchaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PranchaResumoDTO> listar() {
        return repository.findAllByOrderByIdDesc().stream()
                .map(p -> new PranchaResumoDTO(p.getId(), p.getTitulo(), p.getColunas(), p.getLinhas()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PranchaDTO buscar(Long id) {
        return paraDTO(obter(id));
    }

    @Transactional
    public PranchaDTO criar(PranchaDTO dto) {
        Prancha prancha = new Prancha();
        preencher(prancha, dto);
        adicionarCelulas(prancha, dto);
        return paraDTO(repository.save(prancha));
    }

    @Transactional
    public PranchaDTO atualizar(Long id, PranchaDTO dto) {
        Prancha prancha = obter(id);
        preencher(prancha, dto);
        prancha.getCelulas().clear();
        // Força a exclusão das células antigas ANTES de inserir as novas.
        // Sem isso, o Hibernate insere primeiro e viola a restrição
        // UNIQUE (prancha_id, linha, coluna) do banco.
        repository.flush();
        adicionarCelulas(prancha, dto);
        return paraDTO(prancha);
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(obter(id));
    }

    private Prancha obter(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Prancha não encontrada"));
    }

    private void preencher(Prancha prancha, PranchaDTO dto) {
        prancha.setTitulo(dto.titulo().trim());
        prancha.setColunas(dto.colunas());
        prancha.setLinhas(dto.linhas());
    }

    private void adicionarCelulas(Prancha prancha, PranchaDTO dto) {
        if (dto.celulas() == null) {
            return;
        }
        Set<String> usadas = new HashSet<>();
        for (CelulaDTO c : dto.celulas()) {
            // descarta células fora da grade e posições repetidas
            if (c.linha() >= dto.linhas() || c.coluna() >= dto.colunas()) {
                continue;
            }
            if (!usadas.add(c.linha() + "-" + c.coluna())) {
                continue;
            }
            CelulaPrancha celula = new CelulaPrancha();
            celula.setPrancha(prancha);
            celula.setLinha(c.linha());
            celula.setColuna(c.coluna());
            celula.setArasaacId(c.arasaacId());
            celula.setTexto(c.texto());
            celula.setImagemUrl(c.imagemUrl());
            celula.setAlinhHorizontal(c.alinhHorizontal());
            celula.setAlinhVertical(c.alinhVertical());
            celula.setCorTexto(c.corTexto());
            celula.setCorBorda(c.corBorda());
            celula.setCorFundo(c.corFundo());
            prancha.getCelulas().add(celula);
        }
    }

    private PranchaDTO paraDTO(Prancha p) {
        List<CelulaDTO> celulas = p.getCelulas().stream()
                .map(c -> new CelulaDTO(c.getLinha(), c.getColuna(),
                        c.getArasaacId(), c.getTexto(), c.getImagemUrl(),
                        c.getAlinhHorizontal(), c.getAlinhVertical(),
                        c.getCorTexto(), c.getCorBorda(), c.getCorFundo()))
                .toList();
        return new PranchaDTO(p.getId(), p.getTitulo(), p.getColunas(), p.getLinhas(), celulas);
    }
}