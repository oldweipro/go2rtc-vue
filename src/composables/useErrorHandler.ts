import { ref } from 'vue';
import type { StreamError } from '../types';

export function useErrorHandler() {
  const errors = ref<StreamError[]>([]);
  const lastError = ref<StreamError | null>(null);

  const addError = (error: StreamError): void => {
    errors.value.push(error);
    lastError.value = error;
    
    console.error(`[${error.type}] ${error.message}`, {
      timestamp: new Date(error.timestamp).toISOString(),
      error
    });
  };

  const clearErrors = (): void => {
    errors.value = [];
    lastError.value = null;
  };

  const handleConnectionError = (message: string): void => {
    addError({
      type: 'connection',
      message,
      timestamp: Date.now()
    });
  };

  const handleMediaError = (message: string): void => {
    addError({
      type: 'media',
      message,
      timestamp: Date.now()
    });
  };

  const handleBufferError = (message: string): void => {
    addError({
      type: 'buffer',
      message,
      timestamp: Date.now()
    });
  };

  const handleGenericError = (message: string, error?: Error): void => {
    addError({
      type: 'unknown',
      message: error ? `${message}: ${error.message}` : message,
      timestamp: Date.now()
    });
  };

  const shouldReload = (): boolean => {
    const criticalErrors = errors.value.filter(
      error => error.type === 'media' || error.type === 'buffer'
    );
    
    return criticalErrors.length >= 3;
  };

  const getErrorSummary = (): string => {
    if (errors.value.length === 0) return 'No errors';
    
    const errorCounts = errors.value.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorCounts)
      .map(([type, count]) => `${type}: ${count}`)
      .join(', ');
  };

  return {
    errors,
    lastError,
    addError,
    clearErrors,
    handleConnectionError,
    handleMediaError,
    handleBufferError,
    handleGenericError,
    shouldReload,
    getErrorSummary
  };
}