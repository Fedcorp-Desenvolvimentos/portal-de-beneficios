import api from './api'

export const uploadService = {
  async uploadFile(file, administradoraId) {
    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append('file_type', 'RB')
      formData.append('administradora_id', administradoraId)

      const response = await api.post('/api/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('Erro no upload do arquivo:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      })

      throw error
    }
  },

  async confirmUpload(payload) {
    try {
      console.log('Payload enviado para confirmação:', payload)

      const response = await api.post('/api/upload/confirm/', payload)

      console.log('Confirmação concluída:', response.data)

      return response.data
    } catch (error) {
      console.error(
        'RESPOSTA DO BACKEND:',
        JSON.stringify(error?.response?.data, null, 2)
      )

      console.error(
        'PAYLOAD ENVIADO:',
        JSON.stringify(payload, null, 2)
      )

      throw error
    }
  },
}