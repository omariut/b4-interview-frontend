import React, { useEffect, useState, useCallback } from 'react';
import './ServerErrorToast.css';

const ServerErrorToast = () => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handleServerError = (event) => {
      const message = event.detail?.message || 'Internal server error. Please try again later.';
      const id = Date.now() + Math.random();

      setToasts(prev => [...prev, { id, message }]);

      // Auto-dismiss after 6 seconds
      setTimeout(() => dismiss(id), 6000);
    };

    window.addEventListener('server-error', handleServerError);
    return () => window.removeEventListener('server-error', handleServerError);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="server-error-toast-container" role="alert" aria-live="assertive">
      {toasts.map(toast => (
        <div key={toast.id} className="server-error-toast">
          <div className="server-error-toast__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="server-error-toast__content">
            <span className="server-error-toast__title">Server Error</span>
            <span className="server-error-toast__message">{toast.message}</span>
          </div>
          <button
            className="server-error-toast__close"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss error notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="server-error-toast__progress" />
        </div>
      ))}
    </div>
  );
};

export default ServerErrorToast;
