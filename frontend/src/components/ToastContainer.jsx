// components/ToastContainer.js
import React from 'react';
import Toast from 'react-bootstrap/Toast';
import { useToast } from '../hooks/useToast';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    const getToastHeader = (type) => {
        const headers = {
            success: { bg: 'success', text: 'white', title: 'Success' },
            danger: { bg: 'danger', text: 'white', title: 'Error' },
            warning: { bg: 'warning', text: 'dark', title: 'Warning' },
            info: { bg: 'info', text: 'white', title: 'Information' }
        };
        return headers[type] || headers.success;
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                minWidth: '300px'
            }}
        >
            {toasts.map((toast) => {
                const header = getToastHeader(toast.type);
                return (
                    <Toast
                        key={toast.id}
                        show={toast.show}
                        onClose={() => removeToast(toast.id)}
                        delay={toast.delay}
                        autohide
                        bg={header.bg}
                    >
                        <Toast.Header className={`text-${header.text}`}>
                            <strong className="me-auto">{header.title}</strong>
                            <small>{new Date().toLocaleTimeString()}</small>
                        </Toast.Header>
                        <Toast.Body className={header.text === 'white' ? 'text-white' : ''}>
                            {toast.message}
                        </Toast.Body>
                    </Toast>
                );
            })}
        </div>
    );
};

export default ToastContainer;