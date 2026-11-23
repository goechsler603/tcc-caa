export type AlinhHorizontal = 'esquerda' | 'centro' | 'direita'
export type AlinhVertical = 'topo' | 'meio' | 'base'

// Resultado da busca no ARASAAC
export type CorTexto = '#000000' | '#ffffff'

export type Pictograma = {
  id: number
  palavra: string
  url: string
}

// Conteúdo de uma célula da prancha
export type Celula = {
  arasaacId: number // 0 quando a imagem é enviada pelo usuário
  url: string
  texto: string
  alinhHorizontal: AlinhHorizontal
  alinhVertical: AlinhVertical
  corTexto: CorTexto // fonte preta ou branca
  corBorda: string | null
  corFundo: string | null
}

// chave no formato "linha-coluna", ex.: "0-2"
export type Celulas = Record<string, Celula>
