import { apiFetch } from './http'
import type { AlinhHorizontal, AlinhVertical, CorTexto, Celulas } from './types'

export type CelulaDTO = {
  linha: number
  coluna: number
  arasaacId: number | null
  texto: string | null
  imagemUrl: string | null
  alinhHorizontal: string | null
  alinhVertical: string | null
  corTexto: string | null
  corBorda: string | null
  corFundo: string | null
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
  const res = await apiFetch(url, {
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

export async function enviarImagem(
  imagem: Blob,
): Promise<{ id: number; url: string }> {
  const form = new FormData()
  form.append('arquivo', imagem, 'imagem.png')
  // Sem cabeçalho Content-Type: o navegador define o do multipart sozinho
  const res = await apiFetch('/api/imagens', { method: 'POST', body: form })
  if (!res.ok) {
    throw new Error(
      res.status === 400 || res.status === 413
        ? 'Imagem inválida ou grande demais.'
        : `Erro ${res.status} ao enviar a imagem.`,
    )
  }
  return res.json()
}

// Tela -> API
export function celulasParaDTO(celulas: Celulas): CelulaDTO[] {
  return Object.entries(celulas).map(([chave, c]) => {
    const [linha, coluna] = chave.split('-').map(Number)
    return {
      linha,
      coluna,
      arasaacId: c.arasaacId > 0 ? c.arasaacId : null,
      texto: c.texto,
      imagemUrl: c.url,
      alinhHorizontal: c.alinhHorizontal,
      alinhVertical: c.alinhVertical,
      corTexto: c.corTexto,
      corBorda: c.corBorda,
      corFundo: c.corFundo,
    }
  })
}

// API -> Tela (com valores padrão para pranchas salvas antes)
export function dtoParaCelulas(lista: CelulaDTO[]): Celulas {
  const resultado: Celulas = {}
  for (const c of lista) {
    resultado[`${c.linha}-${c.coluna}`] = {
      arasaacId: c.arasaacId ?? 0,
      url: c.imagemUrl ?? '',
      texto: c.texto ?? '',
      alinhHorizontal: (c.alinhHorizontal ?? 'centro') as AlinhHorizontal,
      alinhVertical: (c.alinhVertical ?? 'base') as AlinhVertical,
      corTexto: (c.corTexto === '#ffffff' ? '#ffffff' : '#000000') as CorTexto,
      corBorda: c.corBorda,
      corFundo: c.corFundo,
    }
  }
  return resultado
}