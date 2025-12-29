import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  highlight?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  className = '',
  onClick,
  highlight = false,
  padding = 'md',
}: CardProps) => {
  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`
        bg-warrior-surface rounded-xl
        ${paddings[padding]}
        ${highlight ? 'border border-warrior-gold/30' : 'border border-warrior-subtle/50'}
        ${onClick ? 'cursor-pointer hover:border-warrior-gold/50 transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
