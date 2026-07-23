import api from './api'

export const pedidoCartaoService = {
  criar: async (dados) => {
    const response = await api.post('/api/beneficios/pedidos-cartao/', dados)
    return response.data
  },

  listarMeus: async () => {
    const response = await api.get('/api/beneficios/pedidos-cartao/')
    return response.data
  },

  listarOperacional: async (params = {}) => {
    const response = await api.get('/api/beneficios/pedidos-cartao/operacional/', { params })
    return response.data
  },

  alterarStatus: async (id, status, observacao = '') => {
    const response = await api.patch(`/api/beneficios/pedidos-cartao/${id}/status/`, {
      status,
      observacao,
    })
    return response.data
  },
}
