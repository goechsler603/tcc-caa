export const EVENTO_SESSAO_EXPIRADA = 'sessao-expirada'

export function lerCookie(nome: string): string | null {
  const par = document.cookie.split('; ').find((c) => c.startsWith(`${nome}=`))
  return par ? decodeURIComponent(par.slice(nome.length + 1)) : null
}

export async function apiFetch(url: string, opcoes: RequestInit = {}): Promise<Response> {
  const metodo = (opcoes.method ?? 'GET').toUpperCase()
  const cabecalhos = new Headers(opcoes.headers)

  if (!['GET', 'HEAD', 'OPTIONS'].includes(metodo)) {
    const token = lerCookie('XSRF-TOKEN')
    if (token) cabecalhos.set('X-XSRF-TOKEN', token)
  }

  const res = await fetch(url, { ...opcoes, headers: cabecalhos, credentials: 'same-origin' })

  // Sessão expirada (ou cookie apagado): a tela volta para o login
  if (res.status === 401 && !url.startsWith('/api/auth/')) {
    window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA))
  }
  return res
}