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

    @Column(name = "alinh_horizontal", length = 10)
    private String alinhHorizontal;

    @Column(name = "alinh_vertical", length = 10)
    private String alinhVertical;

    @Column(name = "cor_texto", length = 9)
    private String corTexto;

    @Column(name = "cor_borda", length = 9)
    private String corBorda;

    @Column(name = "cor_fundo", length = 9)
    private String corFundo;

    public String getAlinhHorizontal() { return alinhHorizontal; }
    public void setAlinhHorizontal(String alinhHorizontal) { this.alinhHorizontal = alinhHorizontal; }
    public String getAlinhVertical() { return alinhVertical; }
    public void setAlinhVertical(String alinhVertical) { this.alinhVertical = alinhVertical; }
    public String getCorTexto() { return corTexto; }
    public void setCorTexto(String corTexto) { this.corTexto = corTexto; }
    public String getCorBorda() { return corBorda; }
    public void setCorBorda(String corBorda) { this.corBorda = corBorda; }
    public String getCorFundo() { return corFundo; }
    public void setCorFundo(String corFundo) { this.corFundo = corFundo; }
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