import api from "./api";

// # ROTAS NO BACKEND: http://localhost:8000/api/upload/download-excel-vr/ e http://localhost:8000/api/upload/download-excel-vt/

export const vtService = {
  async DownloadExcelVR(file, administradoraId) {
    try {
      const response = await api.get('/api/upload/download-excel-vr/');
      console.log('Download do template VR concluído:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro no download do template VR:', error);
      throw error;
    }
  },

  async DownloadExcelVT(payload) {
    try {
      const response = await api.get('/api/upload/download-excel-vt/');
      console.log('Download do template VT concluído:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro no download do template VT:', error);
      throw error;
    }
  },
};