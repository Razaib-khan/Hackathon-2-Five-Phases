// frontend/src/components/ToastNotification.tsx
// Toast notification component for the AIDO task management application

import React, { useEffect } from 'react';
import { UI_CONSTANTS } from '@/lib/constants';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotificationProps {
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  onClose: () => void;
  className?: string;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  type,
  message,
  title,
  duration = UI_CONSTANTS.TOAST_DURATION,
  onClose,
  className = ''
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-md border shadow-lg max-w-sm transition-all duration-300 ${getToastStyles()} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 text-lg">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-bold text-sm mb-1">
              {title}
            </div>
          )}
          <div className="text-sm">
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 text-lg font-bold hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;