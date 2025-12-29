import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}: ButtonProps) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-warrior-gold text-warrior-black hover:bg-warrior-goldMuted disabled:opacity-50',
    secondary: 'bg-warrior-surface border border-warrior-subtle text-warrior-white hover:border-warrior-gold disabled:opacity-50',
    ghost: 'bg-transparent text-warrior-muted hover:text-warrior-white disabled:opacity-50',
    danger: 'bg-warrior-red text-warrior-white hover:bg-warrior-redBright disabled:opacity-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};
