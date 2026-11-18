import { apiFetch, lerCookie } from './http'

export type Sessao = { autenticado: boolean; usuario: string | null }

export async function sessaoAtual(): Promise<Sessao> {
  const res = await apiFetch('/api/auth/sessao')
  if (!res.ok) throw new Error(`Erro ${res.status}`)
  return res.json()
}

export async function entrar(login: string, senha: string): Promise<Sessao> {
  // Garante que o cookie do token CSRF já existe antes de enviar o login
  if (!lerCookie('XSRF-TOKEN')) await sessaoAtual()

  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: new URLSearchParams({ username: login, password: senha }),
  })
  if (res.status === 401) throw new Error('Usuário ou senha incorretos.')
  if (!res.ok) throw new Error('Não foi possível entrar. Recarregue a página e tente de novo.')
  return sessaoAtual()
}

export async function sair(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' })
}
