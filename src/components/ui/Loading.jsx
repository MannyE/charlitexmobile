import React from 'react';

/**
 * Reusable loading component
 * @param {Object} props - Component props
 * @param {string} props.size - Size ('small', 'medium', 'large')
 * @param {string} props.message - Loading message
 * @param {string} props.className - Additional CSS classes
 */
const Loading = ({ size = 'medium', message, className = '' }) => {
  const getLoaderClass = () => {
    return `loading-spinner loading-${size} ${className}`.trim();
  };

  return (
    <div className="loading-container">
      <div className={getLoaderClass()}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loading;
