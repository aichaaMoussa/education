import React, { useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'warning',
  isLoading = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Gérer la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <FiXCircle className="w-6 h-6 text-red-600" />,
      iconBg: 'bg-red-100',
      buttonVariant: 'danger' as const,
      borderColor: 'border-red-200',
    },
    warning: {
      icon: <FiAlertCircle className="w-6 h-6 text-yellow-600" />,
      iconBg: 'bg-yellow-100',
      buttonVariant: 'primary' as const,
      borderColor: 'border-yellow-200',
    },
    info: {
      icon: <FiInfo className="w-6 h-6 text-blue-600" />,
      iconBg: 'bg-blue-100',
      buttonVariant: 'primary' as const,
      borderColor: 'border-blue-200',
    },
    success: {
      icon: <FiCheckCircle className="w-6 h-6 text-green-600" />,
      iconBg: 'bg-green-100',
      buttonVariant: 'primary' as const,
      borderColor: 'border-green-200',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div
          className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex items-start">
              {/* Icon */}
              <div className={`flex-shrink-0 mx-auto sm:mx-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg}`}>
                {styles.icon}
              </div>

              {/* Text Content */}
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`px-6 py-4 sm:px-8 sm:py-5 bg-gray-50 border-t ${styles.borderColor} flex flex-col-reverse sm:flex-row sm:justify-end gap-3`}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {cancelText}
            </Button>
            <Button
              variant={styles.buttonVariant}
              onClick={onConfirm}
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

