import React from 'react';
import Loading from './Loading';

/**
 * Reusable button component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {function} props.onClick - Click handler
 * @param {string} props.variant - Button variant ('primary', 'secondary', 'outline', 'ghost')
 * @param {string} props.size - Button size ('small', 'medium', 'large')
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is loading
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type
 */
const Button = ({ children, onClick, variant = 'primary', size = 'medium', disabled = false, loading = false, className = '', type = 'button', ...props }) => {
  const getButtonClass = () => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const disabledClass = disabled || loading ? 'btn-disabled' : '';
    const loadingClass = loading ? 'btn-loading' : '';

    return `${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${loadingClass} ${className}`.trim();
  };

  return (
    <button
      type={type}
      className={getButtonClass()}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}>
      {loading && <Loading size="small" />}
      <span className={loading ? 'btn-content-loading' : 'btn-content'}>{children}</span>
    </button>
  );
};

export default Button;
