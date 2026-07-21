// src/services/operacionalService.js
import api, { API_BASE_URL } from './api';

const unwrap = (response) => response.data;

export const operacionalFaturaService = {
  async getAll() {
    const response = await api.get('/api/beneficios/kanban/faturas/');
    return response;
  },

  async move(id, status) {
    const response = await api.patch(`/api/beneficios/kanban/${id}/move/`, {
      status,
    });
    return response;
  },

  async parsePdf(file) {
    const form = new FormData();
    form.append('file', file);

    const response = await api.post('/api/operacional/faturas/parse/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  },

  async parseBoleto(file) {
    const form = new FormData();
    form.append('file', file);

    const response = await api.post('/api/operacional/faturas/parse-boleto/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  },

  async upload(file, payload = {}) {
    const form = new FormData();
    form.append('file', file);

    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, value);
      }
    });

    const response = await api.post('/api/operacional/faturas/upload/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  },

  async remove(id) {
    const response = await api.delete(`/api/operacional/faturas/${id}/`);
    return response;
  },

  async pagoTodos(id) {
    const response = await api.post(`/api/operacional/faturas/${id}/pago-todos/`);
    return response;
  },

  async move(id, status) {
    const response = await api.patch(`/api/operacional/faturas/${id}/move/`, {
      status,
    });

    return response;
  },

  async enviarContasPagar(id, formaPagemento) {
    const response = await api.post(
      `/api/operacional/faturas/${id}/enviar-contas-pagar/`,
      {
        formaPagemento,
      }
    );

    return response;
  },

  async gerarBoletoVr(id) {
    const response = await api.post(`/api/operacional/faturas/${id}/gerar-boleto-vr/`);
    return response;
  },

  async uploadBoletoVr(id, file) {
    const form = new FormData();
    form.append('file', file);

    const response = await api.post(
      `/api/operacional/faturas/${id}/upload-boleto-vr/`,
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  },

  async togglePago(id, idx) {
    const response = await api.post(
      `/api/operacional/faturas/${id}/coestipulante/${idx}/pago/`
    );

    return response;
  },

  async getComments(id) {
    const response = await api.get(`/api/operacional/faturas/${id}/comments/`);
    return response;
  },

  async postComment(id, text, imageData) {
    const response = await api.post(`/api/operacional/faturas/${id}/comments/`, {
      text,
      imageData,
    });

    return response;
  },

  boletoVrPdfUrl(id) {
    return `${API_BASE_URL}/api/operacional/faturas/${id}/boleto-vr-file/pdf/`;
  },

  coestipulanteBoletoVrPdfUrl(id, idx) {
    return `${API_BASE_URL}/api/operacional/faturas/${id}/coestipulante/${idx}/boleto-vr/pdf/`;
  },

  boletoOriginalPdfUrl(id, idx) {
    return `${API_BASE_URL}/api/operacional/faturas/${id}/coestipulante/${idx}/boleto-original/pdf/`;
  },
};

export const operacionalBoletoService = {
  async getAll() {
    const response = await api.get('/api/beneficios/kanban/boletos/');
    return response;
  },

  async getUploaders() {
    const response = await api.get('/api/operacional/boletos/uploaders/');
    return response;
  },

  async upload(file) {
    const form = new FormData();
    form.append('file', file);

    const response = await api.post('/api/operacional/boletos/upload/', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response;
  },

  async marcarPago(id, method) {
    const response = await api.post(`/api/operacional/boletos/${id}/pago/`, {
      method,
    });

    return response;
  },

  async markPaid(id) {
    const response = await api.post(`/api/operacional/boletos/${id}/mark-paid/`);
    return response;
  },

  downloadUrl(id) {
    return `${API_BASE_URL}/api/operacional/boletos/${id}/download/`;
  },

  async remove(id) {
    const response = await api.delete(`/api/operacional/boletos/${id}/`);
    return response;
  },
};

export const operacionalReportService = {
  uploadsPdfUrl() {
    return `${API_BASE_URL}/api/operacional/reports/uploads.pdf`;
  },
};

export const operacionalService = {
  async listarFaturas() {
    const response = await operacionalFaturaService.getAll();
    return unwrap(response);
  },

  async excluirFatura(id) {
    const response = await operacionalFaturaService.remove(id);
    return unwrap(response);
  },

  async marcarTodosComoPagos(id) {
    const response = await operacionalFaturaService.pagoTodos(id);
    return unwrap(response);
  },

  async alternarPagamentoCoestipulante(id, idx) {
    const response = await operacionalFaturaService.togglePago(id, idx);
    return unwrap(response);
  },
};

export default operacionalFaturaService;
