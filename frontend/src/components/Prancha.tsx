import type { Celulas } from '../types'

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
      style={{ gridTemplateColumns: `repeat(${colunas}, 1fr)` }}
    >
      {chaves.map((chave) => {
        const p = celulas[chave]
        return (
          <div
            key={chave}
            className="celula"
            role="button"
            tabIndex={0}
            onClick={() => onCelulaClick(chave)}
            onKeyDown={(e) => e.key === 'Enter' && onCelulaClick(chave)}
          >
            {p && (
              <>
                <img src={p.url} alt={p.palavra} />
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