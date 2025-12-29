import { motion } from 'framer-motion';
import { Quote } from '../../utils/quotes';

interface WarriorQuoteProps {
  quote: Quote;
  showContext?: boolean;
}

export const WarriorQuote = ({ quote, showContext = false }: WarriorQuoteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-4 px-6"
    >
      <p className="text-warrior-gold text-lg font-light italic">
        "{quote.text}"
      </p>
      {showContext && (
        <p className="text-warrior-muted text-xs mt-2 uppercase tracking-wider">
          {quote.context}
        </p>
      )}
    </motion.div>
  );
};
