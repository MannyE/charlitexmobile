import React from 'react';

/**
 * Reusable popup component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether popup is open
 * @param {function} props.onClose - Close handler
 * @param {string} props.title - Popup title
 * @param {string} props.message - Popup message
 * @param {string} props.type - Popup type ('error', 'success', 'warning', 'info')
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Custom content
 */
const Popup = ({ isOpen, onClose, title, message, type = 'info', className = '', children }) => {
  if (!isOpen) return null;

  const getPopupClass = () => {
    const baseClass = 'popup';
    const typeClass = `popup-${type}`;
    return `${baseClass} ${typeClass} ${className}`.trim();
  };

  return (
    <div
      className="popup-backdrop"
      onClick={onClose}>
      <div
        className={getPopupClass()}
        onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          {title && <h3 className="popup-title">{title}</h3>}
          <button
            className="popup-close"
            onClick={onClose}>
            ×
          </button>
        </div>

        <div className="popup-content">
          {message && <p className="popup-message">{message}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popup;
