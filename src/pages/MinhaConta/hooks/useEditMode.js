import { useState, useCallback, useRef, useEffect } from 'react';

export const useEditMode = (initialData, saveFunction, resetFunction) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);
  const isMounted = useRef(true);
  const isFirstRun = useRef(true);

  // Só executa na primeira montagem e quando initialData mudar de verdade
  useEffect(() => {
    // Pula a primeira execução
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    
    // Se não está editando, atualiza os dados (mas evita loop comparando)
    if (!isEditing && JSON.stringify(initialData) !== JSON.stringify(editedData)) {
      setEditedData(initialData);
      setOriginalData(initialData);
    }
  }, [initialData, isEditing, editedData]);

  const startEditing = useCallback(() => {
    setOriginalData({ ...editedData });
    setIsEditing(true);
  }, [editedData]);

  const cancelEditing = useCallback(() => {
    setEditedData({ ...originalData });
    setIsEditing(false);
    if (resetFunction) resetFunction(originalData);
  }, [originalData, resetFunction]);

  const saveEditing = useCallback(async () => {
    const success = await saveFunction(editedData);
    if (success) {
      setIsEditing(false);
    }
    return success;
  }, [editedData, saveFunction]);

  const updateField = useCallback((field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    isEditing,
    editedData,
    startEditing,
    cancelEditing,
    saveEditing,
    updateField
  };
};