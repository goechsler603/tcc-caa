import { useState, type FormEvent } from 'react'
import { entrar } from '../apiAuth'
import logoAma from '../assets/logo-ama.png'

type Props = {
  onEntrou: (usuario: string) => void
}

export default function LoginPage({ onEntrou }: Props) {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!login.trim() || !senha) {
      setErro('Informe o usuário e a senha.')
      return
    }
    setOcupado(true)
    setErro('')
    try {
      const sessao = await entrar(login.trim(), senha)
      onEntrou(sessao.usuario ?? login.trim())
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.')
      setSenha('')
      setOcupado(false)
    }
  }

  return (
    <div className="login-tela">
      <div className="faixa" />
      <form className="login-cartao" onSubmit={enviar}>
        <img
          className="login-logo"
          src={logoAma}
          alt="AMA - Associação de Amigos do Autista"
        />
        <h1>Entrar</h1>

        <label className="campo-texto">
          Usuário
          <input
            value={login}
            autoComplete="username"
            autoFocus
            onChange={(e) => setLogin(e.target.value)}
          />
        </label>

        <label className="campo-texto">
          Senha
          <input
            type="password"
            value={senha}
            autoComplete="current-password"
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>

        {erro && (
          <p className="erro" role="alert">
            {erro}
          </p>
        )}

        <button className="botao" type="submit" disabled={ocupado}>
          {ocupado ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}