import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';

const ICONS = {
  success: FaCheckCircle,
  error: FaExclamationCircle,
  warning: FaExclamationTriangle,
  info: FaInfoCircle,
};

export default function ToastContainer({ toasts = [] }) {
  if (!Array.isArray(toasts) || !toasts.length) {
    return null;
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || ICONS.info;

        return (
          <div
            key={toast.id}
            className={`toast toast-${toast.type || 'info'}${
              toast.show ? ' toast-show' : ''
            }`}
          >
            <Icon className="toast-icon" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}