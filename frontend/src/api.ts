import type { Celulas } from './types'

export type CelulaDTO = {
  linha: number
  coluna: number
  arasaacId: number | null
  texto: string | null
  imagemUrl: string | null
}

export type PranchaDTO = {
  id: number | null
  titulo: string
  colunas: number
  linhas: number
  celulas: CelulaDTO[]
}

export type PranchaResumo = {
  id: number
  titulo: string
  colunas: number
  linhas: number
}

async function requisitar<T>(url: string, opcoes?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  })
  if (!res.ok) throw new Error(`Erro ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export const listarPranchas = () => requisitar<PranchaResumo[]>('/api/pranchas')

export const buscarPrancha = (id: number) =>
  requisitar<PranchaDTO>(`/api/pranchas/${id}`)

export const criarPrancha = (dados: PranchaDTO) =>
  requisitar<PranchaDTO>('/api/pranchas', {
    method: 'POST',
    body: JSON.stringify(dados),
  })

export const atualizarPrancha = (id: number, dados: PranchaDTO) =>
  requisitar<PranchaDTO>(`/api/pranchas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })

export const excluirPrancha = (id: number) =>
  requisitar<void>(`/api/pranchas/${id}`, { method: 'DELETE' })

// Converte as células da tela ("linha-coluna" -> pictograma) para o formato da API
export function celulasParaDTO(celulas: Celulas): CelulaDTO[] {
  return Object.entries(celulas).map(([chave, p]) => {
    const [linha, coluna] = chave.split('-').map(Number)
    return { linha, coluna, arasaacId: p.id, texto: p.palavra, imagemUrl: p.url }
  })
}

// E o caminho de volta
export function dtoParaCelulas(lista: CelulaDTO[]): Celulas {
  const resultado: Celulas = {}
  for (const c of lista) {
    resultado[`${c.linha}-${c.coluna}`] = {
      id: c.arasaacId ?? 0,
      palavra: c.texto ?? '',
      url: c.imagemUrl ?? '',
    }
  }
  return resultado
}