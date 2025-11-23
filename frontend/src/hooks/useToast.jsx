// hooks/useToast.js
import { useState, useCallback } from 'react';

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, options = {}) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            type: options.type || 'success',
            delay: options.delay || 5000,
            show: true,
            ...options
        };

        setToasts(prev => [...prev, toast]);

        // Auto remove after delay
        setTimeout(() => {
            removeToast(id);
        }, toast.delay);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = useCallback((message, options) => {
        return addToast(message, options);
    }, [addToast]);

    // Convenience methods
    toast.success = (message, options) => addToast(message, { ...options, type: 'success' });
    toast.error = (message, options) => addToast(message, { ...options, type: 'danger' });
    toast.warning = (message, options) => addToast(message, { ...options, type: 'warning' });
    toast.info = (message, options) => addToast(message, { ...options, type: 'info' });

    return {
        toasts,
        toast,
        removeToast
    };
};