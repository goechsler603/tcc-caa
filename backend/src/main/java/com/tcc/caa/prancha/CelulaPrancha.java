package com.tcc.caa.prancha;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "celula_prancha")
public class CelulaPrancha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prancha_id")
    private Prancha prancha;

    @Column(nullable = false)
    private int linha;

    @Column(nullable = false)
    private int coluna;

    @Column(name = "arasaac_id")
    private Long arasaacId;

    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    @Column(length = 100)
    private String texto;

    public Long getId() { return id; }
    public Prancha getPrancha() { return prancha; }
    public void setPrancha(Prancha prancha) { this.prancha = prancha; }
    public int getLinha() { return linha; }
    public void setLinha(int linha) { this.linha = linha; }
    public int getColuna() { return coluna; }
    public void setColuna(int coluna) { this.coluna = coluna; }
    public Long getArasaacId() { return arasaacId; }
    public void setArasaacId(Long arasaacId) { this.arasaacId = arasaacId; }
    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
}