import { useState } from 'react'

type Props = {
  rotulo: string
  valor: number
  min: number
  max: number
  onChange: (valor: number) => void
}

// Campo numérico que permite apagar e digitar livremente.
// O valor só é aplicado quando está dentro do intervalo; ao sair do campo
// (ou apertar Enter) um valor vazio ou fora do intervalo é corrigido.
export default function CampoNumero({ rotulo, valor, min, max, onChange }: Props) {
  const [texto, setTexto] = useState(String(valor))
  const [valorVisto, setValorVisto] = useState(valor)

  // Acompanha mudanças externas (ex.: ao abrir uma prancha salva)
  if (valor !== valorVisto) {
    setValorVisto(valor)
    setTexto(String(valor))
  }

  function aoDigitar(novo: string) {
    setTexto(novo)
    const n = Number(novo)
    if (novo !== '' && Number.isInteger(n) && n >= min && n <= max) {
      onChange(n)
    }
  }

  function confirmar() {
    const n = Number(texto)
    const final =
      texto === '' || !Number.isFinite(n)
        ? valor
        : Math.min(max, Math.max(min, Math.round(n)))
    setTexto(String(final))
    onChange(final)
  }

  return (
    <label className="campo">
      {rotulo}
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={texto}
        title={`De ${min} a ${max}`}
        onChange={(e) => aoDigitar(e.target.value)}
        onBlur={confirmar}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </label>
  )
}
