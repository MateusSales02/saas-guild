/**
 * Converte erros técnicos (axios, rede) em mensagens que fazem sentido para o jogador.
 * A mensagem enviada pela API tem prioridade quando existe.
 */
export function friendlyError(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  const e = error as {
    message?: string
    code?: string
    response?: { status?: number; data?: { message?: string | string[] } }
  }

  const apiMessage = e?.response?.data?.message
  if (Array.isArray(apiMessage) && apiMessage.length) return apiMessage.join(' ')
  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage

  const status = e?.response?.status
  if (!e?.response) {
    if (e?.code === 'ECONNABORTED') return 'O servidor demorou para responder. Tente novamente.'
    if (e?.message === 'Network Error' || e?.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
    }
  }
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para esta ação.'
  if (status === 404) return 'Não encontramos o que você procurava.'
  if (status === 429) return 'Muitas tentativas seguidas. Aguarde um instante.'
  if (status && status >= 500) return 'O servidor encontrou um problema. Tente novamente em instantes.'

  return fallback
}
