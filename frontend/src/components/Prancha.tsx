import type { CSSProperties } from 'react'
import type { Celulas } from '../types'

const HORIZONTAL = {
  esquerda: 'flex-start',
  centro: 'center',
  direita: 'flex-end',
} as const

const VERTICAL = {
  topo: 'flex-start',
  meio: 'center',
  base: 'flex-end',
} as const

type Props = {
  colunas: number
  linhas: number
  celulas: Celulas
  onCelulaClick: (chave: string) => void
  onRemover: (chave: string) => void
}

export default function Prancha({
  colunas,
  linhas,
  celulas,
  onCelulaClick,
  onRemover,
}: Props) {
  const chaves: string[] = []
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      chaves.push(`${l}-${c}`)
    }
  }

  return (
       <div
      className="prancha"
      style={
        {
          gridTemplateColumns: `repeat(${colunas}, 1fr)`,
          '--cols': colunas,
          '--rows': linhas,
        } as CSSProperties
      }
    >
      {chaves.map((chave) => {
        const c = celulas[chave]
        const estilo: CSSProperties = c
          ? {
              background: c.corFundo ?? undefined,
              boxShadow: c.corBorda ? `inset 0 0 0 5px ${c.corBorda}` : undefined,
            }
          : {}

        return (
          <div
            key={chave}
            className="celula"
            style={estilo}
            role="button"
            tabIndex={0}
            onClick={() => onCelulaClick(chave)}
            onKeyDown={(e) => e.key === 'Enter' && onCelulaClick(chave)}
          >
            {c && (
              <>
                <div
                  className="celula-conteudo"
                  style={{
                    alignItems: HORIZONTAL[c.alinhHorizontal],
                    justifyContent: VERTICAL[c.alinhVertical],
                  }}
                >
                  <img src={c.url} alt={c.texto} />
                  {c.texto && <span className="celula-texto">{c.texto}</span>}
                </div>
                <button
                  className="celula-remover"
                  aria-label="Remover pictograma"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemover(chave)
                  }}
                >
                  ✕
                </button>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}