package com.tcc.caa.prancha;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prancha")
public class Prancha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(nullable = false)
    private int colunas;

    @Column(nullable = false)
    private int linhas;

    @Column(name = "criada_em", nullable = false, updatable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();

    @OneToMany(mappedBy = "prancha", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CelulaPrancha> celulas = new ArrayList<>();

    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public int getColunas() { return colunas; }
    public void setColunas(int colunas) { this.colunas = colunas; }
    public int getLinhas() { return linhas; }
    public void setLinhas(int linhas) { this.linhas = linhas; }
    public LocalDateTime getCriadaEm() { return criadaEm; }
    public List<CelulaPrancha> getCelulas() { return celulas; }
}