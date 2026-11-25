import { useState, type CSSProperties } from 'react'
import type { Celulas } from '../types'

const HORIZONTAL = {
  esquerda: 'flex-start',
  centro: 'center',
  direita: 'flex-end',
} as const

const TEXTO_ALINHADO = {
  esquerda: 'left',
  centro: 'center',
  direita: 'right',
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
  onMover: (origem: string, destino: string) => void
}

export default function Prancha({
  colunas,
  linhas,
  celulas,
  onCelulaClick,
  onRemover,
  onMover,
}: Props) {
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [alvo, setAlvo] = useState<string | null>(null)

  function terminarArrasto() {
    setArrastando(null)
    setAlvo(null)
  }

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
          gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`,
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
            className={
              'celula' +
              (arrastando === chave ? ' arrastando' : '') +
              (alvo === chave && arrastando !== chave ? ' alvo' : '')
            }
            style={estilo}
            role="button"
            tabIndex={0}
            draggable={!!c}
            onDragStart={(e) => {
              if (!c) return
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', chave)
              setArrastando(chave)
            }}
            onDragOver={(e) => {
              if (arrastando === null) return
              e.preventDefault() // permite soltar aqui
              e.dataTransfer.dropEffect = 'move'
              if (alvo !== chave) setAlvo(chave)
            }}
            onDrop={(e) => {
              e.preventDefault()
              const origem = e.dataTransfer.getData('text/plain')
              if (origem) onMover(origem, chave)
              terminarArrasto()
            }}
            onDragEnd={terminarArrasto}
            onClick={() => onCelulaClick(chave)}
            onKeyDown={(e) => e.key === 'Enter' && onCelulaClick(chave)}
          >
            {c && (
              <>
                <div className="celula-conteudo">
                  <img src={c.url} alt={c.texto} draggable={false} />
                  {c.texto && (
                    <div
                      className="celula-texto-camada"
                      style={{
                        alignItems: HORIZONTAL[c.alinhHorizontal],
                        justifyContent: VERTICAL[c.alinhVertical],
                      }}
                    >
                      <span
                        className="celula-texto"
                        style={{ textAlign: TEXTO_ALINHADO[c.alinhHorizontal], color: c.corTexto }}
                      >
                        {c.texto}
                      </span>
                    </div>
                  )}
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