import { jsPDF } from 'jspdf'
import type { Celula, Celulas } from './types'

type Opcoes = {
  titulo: string
  colunas: number
  linhas: number
  celulas: Celulas
  orientacao: 'landscape' | 'portrait'
}

type ImagemCarregada = { dataUrl: string; w: number; h: number }

const MARGEM = 10 // mm
const ALTURA_TITULO = 14
const ALTURA_CREDITO = 6
const CREDITO =
  'Pictogramas: ARASAAC (arasaac.org), de Sergio Palao, propriedade do Governo de Aragão, licença CC BY-NC-SA.'

function hexParaRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function urlDaImagem(c: Celula): string {
  return c.arasaacId > 0 ? `/api/pictogramas/${c.arasaacId}/imagem` : c.url
}

async function carregarImagem(url: string): Promise<ImagemCarregada> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('imagem indisponível')
  const blob = await res.blob()

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(leitor.result as string)
    leitor.onerror = () => reject(new Error('falha ao ler a imagem'))
    leitor.readAsDataURL(blob)
  })

  const dimensoes = await new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.onerror = () => reject(new Error('falha ao decodificar a imagem'))
    img.src = dataUrl
  })

  return { dataUrl, ...dimensoes }
}

function nomeDoArquivo(titulo: string): string {
  const base = titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return `${base || 'prancha'}.pdf`
}

// Devolve quantas imagens não puderam ser incluídas
export async function exportarPdf({
  titulo,
  colunas,
  linhas,
  celulas,
  orientacao,
}: Opcoes): Promise<number> {
  const doc = new jsPDF({ orientation: orientacao, unit: 'mm', format: 'a4' })
  const larguraPagina = doc.internal.pageSize.getWidth()
  const alturaPagina = doc.internal.pageSize.getHeight()

  // Título (diminui a fonte se for comprido)
  doc.setFont('helvetica', 'bold')
  let tamanhoTitulo = 18
  doc.setFontSize(tamanhoTitulo)
  while (doc.getTextWidth(titulo) > larguraPagina - 2 * MARGEM && tamanhoTitulo > 10) {
    tamanhoTitulo -= 1
    doc.setFontSize(tamanhoTitulo)
  }
  doc.setTextColor(0)
  doc.text(titulo, larguraPagina / 2, MARGEM + ALTURA_TITULO / 2, {
    align: 'center',
    baseline: 'middle',
  })

  // Células quadradas, ocupando o máximo possível da folha
  const areaLargura = larguraPagina - 2 * MARGEM
  const areaAltura = alturaPagina - 2 * MARGEM - ALTURA_TITULO - ALTURA_CREDITO
  const lado = Math.min(areaLargura / colunas, areaAltura / linhas)
  const x0 = (larguraPagina - lado * colunas) / 2
  const y0 = MARGEM + ALTURA_TITULO

  // Só as células que estão dentro da grade
  const preenchidas = Object.entries(celulas)
    .map(([chave, celula]) => {
      const [linha, coluna] = chave.split('-').map(Number)
      return { linha, coluna, celula }
    })
    .filter((p) => p.linha < linhas && p.coluna < colunas)

  // Baixa cada imagem uma única vez
  const imagens = new Map<string, ImagemCarregada | null>()
  const urls = [...new Set(preenchidas.map((p) => urlDaImagem(p.celula)))]
  await Promise.all(
    urls.map(async (url) => {
      try {
        imagens.set(url, await carregarImagem(url))
      } catch {
        imagens.set(url, null)
      }
    }),
  )

  // 1) Fundos coloridos
  for (const { linha, coluna, celula } of preenchidas) {
    if (!celula.corFundo) continue
    const [r, g, b] = hexParaRgb(celula.corFundo)
    doc.setFillColor(r, g, b)
    doc.rect(x0 + coluna * lado, y0 + linha * lado, lado, lado, 'F')
  }

  // 2) Linhas da grade (por cima dos fundos, para não ficarem cobertas)
  doc.setDrawColor(150)
  doc.setLineWidth(0.2)
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      doc.rect(x0 + c * lado, y0 + l * lado, lado, lado, 'S')
    }
  }
  doc.setDrawColor(51)
  doc.setLineWidth(0.5)
  doc.rect(x0, y0, lado * colunas, lado * linhas, 'S')

  // 3) Borda colorida, imagem e texto de cada célula
  let falhas = 0
  for (const { linha, coluna, celula } of preenchidas) {
    const x = x0 + coluna * lado
    const y = y0 + linha * lado

    if (celula.corBorda) {
      const espessura = Math.max(1, lado * 0.035)
      const [r, g, b] = hexParaRgb(celula.corBorda)
      doc.setDrawColor(r, g, b)
      doc.setLineWidth(espessura)
      doc.rect(x + espessura / 2, y + espessura / 2, lado - espessura, lado - espessura, 'S')
    }

    const margemInterna = lado * 0.07
    const interno = lado - 2 * margemInterna
    const tamanhoFonte = Math.min(20, Math.max(8, lado * 0.22)) // pt
    const alturaLinha = tamanhoFonte * 0.3528 * 1.2 // mm

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(tamanhoFonte)
    doc.setTextColor(0)
    const linhasTexto: string[] = celula.texto
      ? (doc.splitTextToSize(celula.texto, interno) as string[]).slice(0, 2)
      : []
    const alturaTexto = linhasTexto.length * alturaLinha

    const url = urlDaImagem(celula)
    const imagem = imagens.get(url) ?? null
    if (!imagem) falhas += 1

    const espaco = imagem && linhasTexto.length > 0 ? lado * 0.02 : 0
    let imgLargura = 0
    let imgAltura = 0
    if (imagem) {
      const maxLargura = lado * 0.6
      const maxAltura = Math.max(interno - alturaTexto - espaco, lado * 0.1)
      const escala = Math.min(maxLargura / imagem.w, maxAltura / imagem.h)
      imgLargura = imagem.w * escala
      imgAltura = imagem.h * escala
    }

    // Alinhamento vertical do bloco (imagem + texto)
    const alturaBloco = imgAltura + espaco + alturaTexto
    let yBloco = y + margemInterna
    if (celula.alinhVertical === 'meio') yBloco = y + (lado - alturaBloco) / 2
    if (celula.alinhVertical === 'base') yBloco = y + lado - margemInterna - alturaBloco

    // Alinhamento horizontal
    const xEsquerda = x + margemInterna
    const xCentro = x + lado / 2
    const xDireita = x + lado - margemInterna
    const h = celula.alinhHorizontal
    const xTexto = h === 'esquerda' ? xEsquerda : h === 'direita' ? xDireita : xCentro
    const modo = h === 'esquerda' ? 'left' : h === 'direita' ? 'right' : 'center'
    const xImagem =
      h === 'esquerda'
        ? xEsquerda
        : h === 'direita'
          ? xDireita - imgLargura
          : xCentro - imgLargura / 2

    if (imagem) {
      doc.addImage(imagem.dataUrl, 'PNG', xImagem, yBloco, imgLargura, imgAltura, url)
    }
    linhasTexto.forEach((texto, i) => {
      doc.text(texto, xTexto, yBloco + imgAltura + espaco + i * alturaLinha, {
        align: modo,
        baseline: 'top',
      })
    })
  }

  // Crédito do ARASAAC (exigido pela licença)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(80)
  doc.text(CREDITO, larguraPagina / 2, alturaPagina - MARGEM, {
    align: 'center',
    baseline: 'bottom',
  })

  doc.save(nomeDoArquivo(titulo))
  return falhas
}