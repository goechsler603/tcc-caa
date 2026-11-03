import { useState } from 'react'

type Pictograma = {
  id: number
  palavra: string
  url: string
}

function App() {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<Pictograma[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [buscou, setBuscou] = useState(false)

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
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <h1>Pictogramas</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscar()}
          placeholder="Digite uma palavra (ex.: casa)"
          style={{ flex: 1, padding: 8, fontSize: 16 }}
        />
        <button onClick={buscar} style={{ padding: '8px 16px', fontSize: 16 }}>
          Buscar
        </button>
      </div>

      {carregando && <p>Buscando...</p>}
      {erro && <p style={{ color: 'crimson' }}>{erro}</p>}
      {buscou && !carregando && !erro && resultados.length === 0 && (
        <p>Nenhum resultado.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
        {resultados.map((p) => (
          <div
            key={p.id}
            style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, textAlign: 'center' }}
          >
            <img src={p.url} alt={p.palavra} style={{ width: '100%' }} />
            <div>{p.palavra}</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#555' }}>
        Pictogramas: ARASAAC (arasaac.org), de Sergio Palao, propriedade do Governo de
        Aragão, licença CC BY-NC-SA.
      </p>
    </div>
  )
}

export default App