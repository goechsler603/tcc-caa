import { useEffect } from 'react'
import type { AlinhHorizontal, AlinhVertical, Celula } from '../types'

type Props = {
  celula: Celula
  onChange: (nova: Celula) => void
  onTrocar: () => void
  onRemover: () => void
  onClose: () => void
}

const HORIZONTAL: { valor: AlinhHorizontal; rotulo: string }[] = [
  { valor: 'esquerda', rotulo: 'Esquerda' },
  { valor: 'centro', rotulo: 'Centro' },
  { valor: 'direita', rotulo: 'Direita' },
]

const VERTICAL: { valor: AlinhVertical; rotulo: string }[] = [
  { valor: 'topo', rotulo: 'Topo' },
  { valor: 'meio', rotulo: 'Meio' },
  { valor: 'base', rotulo: 'Base' },
]

function CampoCor({
  rotulo,
  valor,
  onChange,
}: {
  rotulo: string
  valor: string | null
  onChange: (v: string | null) => void
}) {
  return (
    <div className="campo-cor">
      <span>{rotulo}</span>
      <input
        type="color"
        value={valor ?? '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        aria-label={rotulo}
      />
      <button type="button" onClick={() => onChange(null)} disabled={valor === null}>
        Sem cor
      </button>
    </div>
  )
}

export default function EditarCelulaModal({
  celula,
  onChange,
  onTrocar,
  onRemover,
  onClose,
}: Props) {
  useEffect(() => {
    function aoPressionar(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', aoPressionar)
    return () => window.removeEventListener('keydown', aoPressionar)
  }, [onClose])

  return (
    <div className="modal-fundo leve" onClick={onClose}>
      <div className="modal modal-editar" onClick={(e) => e.stopPropagation()}>
        <div className="modal-titulo">
          <span>Editar Pictograma</span>
          <button className="modal-fechar" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="modal-corpo formulario">
          <label className="campo-texto">
            Texto do pictograma
            <input
              value={celula.texto}
              maxLength={100}
              onChange={(e) => onChange({ ...celula, texto: e.target.value })}
            />
          </label>

          <div className="grupo">
            <span>Alinhamento horizontal</span>
            <div className="grupo-botoes">
              {HORIZONTAL.map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  className={celula.alinhHorizontal === o.valor ? 'opcao ativa' : 'opcao'}
                  aria-pressed={celula.alinhHorizontal === o.valor}
                  onClick={() => onChange({ ...celula, alinhHorizontal: o.valor })}
                >
                  {o.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="grupo">
            <span>Alinhamento vertical</span>
            <div className="grupo-botoes">
              {VERTICAL.map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  className={celula.alinhVertical === o.valor ? 'opcao ativa' : 'opcao'}
                  aria-pressed={celula.alinhVertical === o.valor}
                  onClick={() => onChange({ ...celula, alinhVertical: o.valor })}
                >
                  {o.rotulo}
                </button>
              ))}
            </div>
          </div>

          <CampoCor
            rotulo="Cor da borda"
            valor={celula.corBorda}
            onChange={(v) => onChange({ ...celula, corBorda: v })}
          />
          <CampoCor
            rotulo="Cor do fundo"
            valor={celula.corFundo}
            onChange={(v) => onChange({ ...celula, corFundo: v })}
          />

          <div className="modal-acoes">
            <button type="button" className="botao" onClick={onTrocar}>
              Trocar pictograma
            </button>
            <button type="button" className="botao perigo" onClick={onRemover}>
              Remover
            </button>
            <button type="button" className="botao" onClick={onClose}>
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}