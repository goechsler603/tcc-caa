export type Pictograma = {
  id: number
  palavra: string
  url: string
}

// chave no formato "linha-coluna", ex.: "0-2"
export type Celulas = Record<string, Pictograma>