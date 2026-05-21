import api from "./api"

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

      // console.log('Upload e Parsing concluídos:', response.data)
      return response.data
    } catch (error) {
      console.error('Erro no upload do arquivo:', error)
      throw error
    }
  },

  async confirmUpload(payload) {
    try {
      const response = await api.post('/api/upload/confirm/', payload)

      // console.log('Confirmação e Gravação final concluídas:', response.data)
      return response.data
    } catch (error) {
      console.error('Erro na confirmação do upload:', error)
      throw error
    }
  },
}