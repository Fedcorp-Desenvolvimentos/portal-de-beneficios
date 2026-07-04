import { useCallback, useEffect, useRef, useState } from 'react';

let toastId = 0;

const VALID_TYPES = new Set(['success', 'error', 'warning', 'info']);

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const clearToastTimers = useCallback((id) => {
    const timers = timersRef.current.get(id);

    if (timers) {
      timers.forEach((timer) => clearTimeout(timer));
      timersRef.current.delete(id);
    }
  }, []);

  const removeToast = useCallback((id) => {
    clearToastTimers(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, [clearToastTimers]);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    const safeType = VALID_TYPES.has(type) ? type : 'info';
    const safeMessage = message || 'Operação concluída.';

    setToasts((prev) => [
      ...prev,
      {
        id,
        message: safeMessage,
        type: safeType,
        show: false,
      },
    ]);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setToasts((prev) =>
          prev.map((toast) =>
            toast.id === id ? { ...toast, show: true } : toast
          )
        );
      });
    });

    const hideTimer = setTimeout(() => {
      setToasts((prev) =>
        prev.map((toast) =>
          toast.id === id ? { ...toast, show: false } : toast
        )
      );

      const removeTimer = setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        timersRef.current.delete(id);
      }, 300);

      const currentTimers = timersRef.current.get(id) || [];
      timersRef.current.set(id, [...currentTimers, removeTimer]);
    }, 3500);

    timersRef.current.set(id, [hideTimer]);

    return id;
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timers) => {
        timers.forEach((timer) => clearTimeout(timer));
      });

      timersRef.current.clear();
    };
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
}