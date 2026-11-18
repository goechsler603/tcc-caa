import { useEffect, useState } from 'react'
import './App.css'
import logoAma from './assets/logo-ama.png'
import Prancha from './components/Prancha'
import PictogramaSearchModal from './components/PictogramaSearchModal'
import EditarCelulaModal from './components/EditarCelulaModal'
import LoginPage from './components/LoginPage'
import type { Celula, Celulas, Pictograma } from './types'
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
import { sair as encerrarSessao, sessaoAtual } from './apiAuth'
import { EVENTO_SESSAO_EXPIRADA } from './http'
import { exportarPdf } from './exportarPdf'

const limitar = (valor: number, min: number, max: number) =>
  Math.min(max, Math.max(min, valor))

const FORMATO_PADRAO = {
  alinhHorizontal: 'centro',
  alinhVertical: 'base',
  corBorda: null,
  corFundo: null,
} as const

function App() {
  const [usuario, setUsuario] = useState<string | null>(null)
  const [verificando, setVerificando] = useState(true)

  const [pranchaId, setPranchaId] = useState<number | null>(null)
  const [titulo, setTitulo] = useState('Prancha 1')
  const [colunas, setColunas] = useState(4)
  const [linhas, setLinhas] = useState(3)
  const [celulas, setCelulas] = useState<Celulas>({})
  const [buscando, setBuscando] = useState<string | null>(null)
  const [editando, setEditando] = useState<string | null>(null)

  const [salvas, setSalvas] = useState<PranchaResumo[]>([])
  const [mensagem, setMensagem] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [orientacao, setOrientacao] = useState<'landscape' | 'portrait'>('landscape')

  // Ao abrir a tela: já existe uma sessão ativa?
  useEffect(() => {
    sessaoAtual()
      .then((s) => setUsuario(s.autenticado ? s.usuario : null))
      .catch(() => setUsuario(null))
      .finally(() => setVerificando(false))
  }, [])

  // Sessão expirada em qualquer requisição: volta ao login
  useEffect(() => {
    const aoExpirar = () => setUsuario(null)
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar)
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar)
  }, [])

  // Com usuário logado, carrega a lista de pranchas salvas
  useEffect(() => {
    if (!usuario) return
    listarPranchas()
      .then(setSalvas)
      .catch(() => setMensagem('Não foi possível carregar as pranchas salvas.'))
  }, [usuario])

  function aoClicarCelula(chave: string) {
    if (celulas[chave]) setEditando(chave)
    else setBuscando(chave)
  }

  function selecionar(p: Pictograma) {
    if (buscando === null) return
    const chave = buscando
    setCelulas((anterior) => ({
      ...anterior,
      [chave]: {
        ...FORMATO_PADRAO,
        ...anterior[chave],
        arasaacId: p.id,
        url: p.url,
        texto: p.palavra,
      },
    }))
    setBuscando(null)
  }

  function atualizarCelula(chave: string, nova: Celula) {
    setCelulas((anterior) => ({ ...anterior, [chave]: nova }))
  }

  function remover(chave: string) {
    setCelulas((anterior) => {
      const novo = { ...anterior }
      delete novo[chave]
      return novo
    })
    setEditando(null)
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

  async function baixarPdf() {
    setOcupado(true)
    setMensagem('Gerando PDF...')
    try {
      const falhas = await exportarPdf({ titulo, colunas, linhas, celulas, orientacao })
      setMensagem(
        falhas > 0
          ? `PDF baixado, mas ${falhas} imagem(ns) não puderam ser incluídas.`
          : 'PDF baixado.',
      )
    } catch (e) {
      console.error('Erro ao gerar PDF:', e)
      setMensagem(
        `Não foi possível gerar o PDF: ${e instanceof Error ? e.message : 'erro desconhecido'}`,
      )
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

  async function sair() {
    try {
      await encerrarSessao()
    } finally {
      // limpa a memória, para a próxima pessoa não ver a prancha anterior
      reiniciar()
      setSalvas([])
      setMensagem('')
      setBuscando(null)
      setEditando(null)
      setUsuario(null)
    }
  }

  if (verificando) return <p className="centralizado">Carregando…</p>
  if (!usuario) return <LoginPage onEntrou={setUsuario} />

  return (
    <div className={`app ${orientacao === 'landscape' ? 'paisagem' : 'retrato'}`}>
      <style>{`@page { size: A4 ${orientacao}; margin: 10mm; }`}</style>

      <aside className="sidebar">
        <div className="logo">
          <img src={logoAma} alt="AMA - Associação de Amigos do Autista" />
        </div>
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
          <div className="usuario-logado" title={usuario}>
            👤 {usuario}
          </div>
          <button className="nav-item" onClick={sair}>
            Sair
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
          <select
            value={orientacao}
            onChange={(e) => setOrientacao(e.target.value as 'landscape' | 'portrait')}
            aria-label="Orientação da folha"
          >
            <option value="landscape">Folha: paisagem</option>
            <option value="portrait">Folha: retrato</option>
          </select>
          <button className="botao" onClick={baixarPdf} disabled={ocupado}>
            Baixar PDF
          </button>
          <button className="botao" onClick={() => window.print()} disabled={ocupado}>
            Imprimir
          </button>
          {pranchaId !== null && (
            <button className="botao perigo" onClick={excluir} disabled={ocupado}>
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
          onCelulaClick={aoClicarCelula}
          onRemover={remover}
        />

        <p className="credito">
          Pictogramas: ARASAAC (arasaac.org), de Sergio Palao, propriedade do
          Governo de Aragão, licença CC BY-NC-SA.
        </p>
      </main>

      {buscando !== null && (
        <PictogramaSearchModal
          onSelect={selecionar}
          onClose={() => setBuscando(null)}
        />
      )}

      {editando !== null && celulas[editando] && (
        <EditarCelulaModal
          celula={celulas[editando]}
          onChange={(nova) => atualizarCelula(editando, nova)}
          onTrocar={() => {
            setBuscando(editando)
            setEditando(null)
          }}
          onRemover={() => remover(editando)}
          onClose={() => setEditando(null)}
        />
      )}
    </div>
  )
}

export default App