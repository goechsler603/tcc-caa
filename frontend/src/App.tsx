import { useEffect, useState } from 'react'
import './App.css'
import Prancha from './components/Prancha'
import PictogramaSearchModal from './components/PictogramaSearchModal'
import type { Celulas, Pictograma } from './types'
import {
  atualizarPrancha,
  buscarPrancha,
  celulasParaDTO,
  criarPrancha,
  dtoParaCelulas,
  excluirPrancha,
  listarPranchas,
  type PranchaDTO,
  type PranchaResumo,
} from './api'

const limitar = (valor: number, min: number, max: number) =>
  Math.min(max, Math.max(min, valor))

function App() {
  const [pranchaId, setPranchaId] = useState<number | null>(null)
  const [titulo, setTitulo] = useState('Prancha 1')
  const [colunas, setColunas] = useState(4)
  const [linhas, setLinhas] = useState(3)
  const [celulas, setCelulas] = useState<Celulas>({})
  const [celulaAtiva, setCelulaAtiva] = useState<string | null>(null)

  const [salvas, setSalvas] = useState<PranchaResumo[]>([])
  const [mensagem, setMensagem] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    listarPranchas()
      .then(setSalvas)
      .catch(() => setMensagem('Não foi possível carregar as pranchas salvas.'))
  }, [])

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

  function reiniciar() {
    setPranchaId(null)
    setTitulo('Prancha 1')
    setColunas(4)
    setLinhas(3)
    setCelulas({})
  }

  function novaPrancha() {
    if (
      Object.keys(celulas).length > 0 &&
      !window.confirm('Começar uma nova prancha? Alterações não salvas serão perdidas.')
    ) {
      return
    }
    reiniciar()
    setMensagem('')
  }

  async function salvar() {
    setOcupado(true)
    setMensagem('')
    const dados: PranchaDTO = {
      id: pranchaId,
      titulo: titulo.trim() || 'Sem título',
      colunas,
      linhas,
      celulas: celulasParaDTO(celulas),
    }
    try {
      const salva =
        pranchaId === null
          ? await criarPrancha(dados)
          : await atualizarPrancha(pranchaId, dados)
      setPranchaId(salva.id)
      setTitulo(salva.titulo)
      setCelulas(dtoParaCelulas(salva.celulas))
      setSalvas(await listarPranchas())
      setMensagem('Prancha salva.')
    } catch {
      setMensagem('Não foi possível salvar a prancha.')
    } finally {
      setOcupado(false)
    }
  }

  async function abrir(id: number) {
    setOcupado(true)
    setMensagem('')
    try {
      const p = await buscarPrancha(id)
      setPranchaId(p.id)
      setTitulo(p.titulo)
      setColunas(p.colunas)
      setLinhas(p.linhas)
      setCelulas(dtoParaCelulas(p.celulas))
    } catch {
      setMensagem('Não foi possível abrir a prancha.')
    } finally {
      setOcupado(false)
    }
  }

  async function excluir() {
    if (pranchaId === null) return
    if (!window.confirm('Excluir esta prancha definitivamente?')) return
    setOcupado(true)
    try {
      await excluirPrancha(pranchaId)
      reiniciar()
      setSalvas(await listarPranchas())
      setMensagem('Prancha excluída.')
    } catch {
      setMensagem('Não foi possível excluir a prancha.')
    } finally {
      setOcupado(false)
    }
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
          <button className="botao" onClick={novaPrancha} disabled={ocupado}>
            + Nova Prancha
          </button>
          <button className="botao" onClick={salvar} disabled={ocupado}>
            Salvar
          </button>
          <select
            value={pranchaId ?? ''}
            onChange={(e) => e.target.value && abrir(Number(e.target.value))}
            disabled={ocupado}
            aria-label="Abrir prancha salva"
          >
            <option value="">Abrir prancha salva…</option>
            {salvas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titulo}
              </option>
            ))}
          </select>
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
          {pranchaId !== null && (
            <button
              className="botao perigo"
              onClick={excluir}
              disabled={ocupado}
            >
              Excluir
            </button>
          )}
        </div>

        {mensagem && (
          <p className="mensagem" role="status">
            {mensagem}
          </p>
        )}

        <input
          className="titulo"
          value={titulo}
          maxLength={120}
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