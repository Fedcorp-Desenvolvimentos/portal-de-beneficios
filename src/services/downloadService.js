// downloadService.js - VERSÃO CORRETA (sem invenção)
import api from "./api";

export const downloadService = {
  async downloadExcelBeneficios() {
    try {
      const response = await api.get('/api/upload/download-excel-vr/', {
        responseType: 'blob' // Importante para download de arquivos
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modelo_importacao_vr.xlsm');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // console.log('Download do template VR concluído');
      return response.data;
    } catch (error) {
      console.error('Erro no download do template VR:', error);
      throw error;
    }
  },

  async downloadExcelVT() {
    try {
      const response = await api.get('/api/upload/download-excel-vt/', {
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modelo_importacao_vt.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Download do template VT concluído');
      return response.data;
    } catch (error) {
      console.error('Erro no download do template VT:', error);
      throw error;
    }
  },
};