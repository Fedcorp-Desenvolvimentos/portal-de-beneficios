// services/taxaConfigService.js
import api from './api.js';

export const taxaConfigService = {
  /**
   * Lista configurações de taxa
   * @param {Object} params - Filtros: { vinculo, administradora, condominio, produto, ativo }
   */
  async listar(params = {}) {
    try {
      const response = await api.get('/api/taxas-config/', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar taxas:', error);
      throw error;
    }
  },

  /**
   * Busca configuração de taxa por ID
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/api/taxas-config/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar taxa ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria nova configuração de taxa
   * @param {Object} dados - { vinculo, produto, taxa_tipo, taxa_valor, ativo }
   */
  async criar(dados) {
    try {
      const response = await api.post('/api/taxas-config/', dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar taxa:', error);
      throw error;
    }
  },

  /**
   * Atualiza configuração de taxa
   * @param {number} id - ID da configuração
   * @param {Object} dados - Campos a atualizar
   */
  async atualizar(id, dados) {
    try {
      const response = await api.put(`/api/taxas-config/${id}/`, dados);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar taxa ${id}:`, error);
      throw error;
    }
  },

  /**
   * Atualiza parcialmente configuração de taxa
   * @param {number} id - ID da configuração
   * @param {Object} dados - Campos a atualizar
   */
  async atualizarParcial(id, dados) {
    try {
      const response = await api.patch(`/api/taxas-config/${id}/`, dados);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar taxa ${id}:`, error);
      throw error;
    }
  },

  /**
   * Remove configuração de taxa
   * @param {number} id - ID da configuração
   */
  async remover(id) {
    try {
      await api.delete(`/api/taxas-config/${id}/`);
      return true;
    } catch (error) {
      console.error(`Erro ao remover taxa ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lista vínculos de uma administradora com taxas aninhadas
   * @param {number} administradoraId - ID da administradora
   */
  async listarVinculosComTaxas(administradoraId) {
    try {
      const response = await api.get(`/api/administradoras/${administradoraId}/condominios/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar vinculos com taxas:', error);
      throw error;
    }
  },

  /**
   * Lista vínculos gerais com taxas aninhadas
   * @param {Object} params - Filtros: { administradora }
   */
  async listarVinculos(params = {}) {
    try {
      const response = await api.get('/api/vinculos/', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar vinculos:', error);
      throw error;
    }
  },
};
