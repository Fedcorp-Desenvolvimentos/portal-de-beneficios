// src/hooks/useLoading.js

import { useGlobal } from '../context/GlobalContext';

export const useLoading = () => {
  const { 
    loading, 
    setLoading, 
    loadingMessage, 
    setLoadingMessage,
    loadingProgress,
    setLoadingProgress
  } = useGlobal();

  const startLoading = (message = 'Carregando...') => {
    setLoadingMessage(message);
    setLoadingProgress(0);  // Reseta progresso
    setLoading(true);
  };

  const updateProgress = (progress, message = null) => {
    setLoadingProgress(progress);
    if (message) setLoadingMessage(message);
  };

  const stopLoading = () => {
    setLoading(false);
    setLoadingMessage('Carregando...');
    setLoadingProgress(0);
  };

  const withLoading = async (callback, message = 'Carregando...') => {
    try {
      startLoading(message);
      const result = await callback();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    loading,
    loadingMessage,
    loadingProgress,
    startLoading,
    updateProgress,  // NOVO - pra atualizar progresso do loop
    stopLoading,
    withLoading
  };
};