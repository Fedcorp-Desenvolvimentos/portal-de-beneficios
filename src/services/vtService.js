import api from "./api";

export const vtService = {
  async uploadVTFile(file, administradoraId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', 'VT');
      formData.append('administradora_id', administradoraId);

      const response = await api.post('/api/upload/vt/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro no upload do arquivo VT:', error);
      throw error;
    }
  },

  async confirmVTUpload(payload) {
    try {
      const response = await api.post('/api/upload/vt/confirm/', payload);
      return response.data;
    } catch (error) {
      console.error('Erro na confirmação do upload VT:', error);
      throw error;
    }
  },
};