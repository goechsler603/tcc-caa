import { useEffect, useRef, useState } from 'react'
import type { Pictograma } from '../types'

type Props = {
  onSelect: (p: Pictograma) => void
  onClose: () => void
}

export default function PictogramaSearchModal({ onSelect, onClose }: Props) {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<Pictograma[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [buscou, setBuscou] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function aoPressionar(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', aoPressionar)
    return () => window.removeEventListener('keydown', aoPressionar)
  }, [onClose])

  async function buscar() {
    if (!busca.trim()) return
    setCarregando(true)
    setErro('')
    try {
      const res = await fetch(`/api/pictogramas?busca=${encodeURIComponent(busca)}`)
      if (!res.ok) throw new Error()
      setResultados(await res.json())
      setBuscou(true)
    } catch {
      setErro('Não foi possível buscar os pictogramas.')
      setResultados([])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="modal-fundo" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-titulo">
          <span>Buscar Pictograma</span>
          <button className="modal-fechar" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="modal-busca">
          <input
            ref={inputRef}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            placeholder="Digite uma palavra (ex.: casa)"
          />
          <button onClick={buscar}>Buscar</button>
        </div>

        <div className="modal-corpo">
          {carregando && <p>Buscando...</p>}
          {erro && <p className="erro">{erro}</p>}
          {buscou && !carregando && !erro && resultados.length === 0 && (
            <p>Nenhum resultado.</p>
          )}
          <div className="resultados">
            {resultados.map((p) => (
              <button key={p.id} className="resultado" onClick={() => onSelect(p)}>
                <img src={p.url} alt={p.palavra} />
                <span>{p.palavra}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}