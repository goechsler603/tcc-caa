import { useState } from 'react'
import './App.css'
import Prancha from './components/Prancha'
import PictogramaSearchModal from './components/PictogramaSearchModal'
import type { Celulas, Pictograma } from './types'

const limitar = (valor: number, min: number, max: number) =>
  Math.min(max, Math.max(min, valor))

function App() {
  const [titulo, setTitulo] = useState('Prancha 1')
  const [colunas, setColunas] = useState(4)
  const [linhas, setLinhas] = useState(3)
  const [celulas, setCelulas] = useState<Celulas>({})
  const [celulaAtiva, setCelulaAtiva] = useState<string | null>(null)

  function selecionar(p: Pictograma) {
    if (celulaAtiva === null) return
    setCelulas((anterior) => ({ ...anterior, [celulaAtiva]: p }))
    setCelulaAtiva(null)
  }

  function remover(chave: string) {
    setCelulas((anterior) => {
      const novo = { ...anterior }
      delete novo[chave]
      return novo
    })
  }

  function novaPrancha() {
    if (
      Object.keys(celulas).length > 0 &&
      !window.confirm('Descartar a prancha atual e começar uma nova?')
    ) {
      return
    }
    setTitulo('Prancha 1')
    setCelulas({})
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">AMA</div>
        <nav>
          <button className="nav-item ativo">Pranchas</button>
          <button className="nav-item" disabled title="Em breve">
            Arquivos
          </button>
          <button className="nav-item" disabled title="Em breve">
            Pictogramas
          </button>
        </nav>
        <div className="sidebar-rodape">
          <button className="nav-item" disabled>
            Usuário
          </button>
        </div>
      </aside>

      <main className="conteudo">
        <div className="faixa" />

        <div className="barra">
          <button className="botao" onClick={novaPrancha}>
            + Nova Prancha
          </button>
          <label className="campo">
            Colunas
            <input
              type="number"
              min={1}
              max={8}
              value={colunas}
              onChange={(e) =>
                setColunas(limitar(Number(e.target.value) || 1, 1, 8))
              }
            />
          </label>
          <label className="campo">
            Linhas
            <input
              type="number"
              min={1}
              max={6}
              value={linhas}
              onChange={(e) =>
                setLinhas(limitar(Number(e.target.value) || 1, 1, 6))
              }
            />
          </label>
        </div>

        <input
          className="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          aria-label="Título da prancha"
        />

        <Prancha
          colunas={colunas}
          linhas={linhas}
          celulas={celulas}
          onCelulaClick={setCelulaAtiva}
          onRemover={remover}
        />

        <p className="credito">
          Pictogramas: ARASAAC (arasaac.org), de Sergio Palao, propriedade do
          Governo de Aragão, licença CC BY-NC-SA.
        </p>
      </main>

      {celulaAtiva !== null && (
        <PictogramaSearchModal
          onSelect={selecionar}
          onClose={() => setCelulaAtiva(null)}
        />
      )}
    </div>
  )
}

export default App