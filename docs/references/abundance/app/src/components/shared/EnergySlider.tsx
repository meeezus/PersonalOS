import { motion } from 'framer-motion';
import { EnergyAlignment } from '../../types';

interface EnergySliderProps {
  value: EnergyAlignment;
  onChange: (value: EnergyAlignment) => void;
}

export const EnergySlider = ({ value, onChange }: EnergySliderProps) => {
  const options: { value: EnergyAlignment; label: string; color: string }[] = [
    { value: 'scarcity', label: 'Scarcity', color: 'bg-warrior-red' },
    { value: 'neutral', label: 'Neutral', color: 'bg-warrior-muted' },
    { value: 'abundance', label: 'Abundance', color: 'bg-warrior-gold' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-warrior-muted uppercase tracking-wider">
        <span>Scarcity</span>
        <span>Abundance</span>
      </div>
      <div className="relative">
        <div className="flex gap-1 p-1 bg-warrior-elevated rounded-lg">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                flex-1 py-3 rounded-md text-sm font-medium transition-all duration-200
                ${value === option.value
                  ? `${option.color} text-warrior-black`
                  : 'text-warrior-muted hover:text-warrior-white'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-warrior-muted">
        {value === 'scarcity' && "I'm operating from fear, desperation, or proving"}
        {value === 'neutral' && "I'm present, neither pulled by scarcity nor anchored in abundance"}
        {value === 'abundance' && "I'm operating from worthiness, curiosity, and trust"}
      </p>
    </div>
  );
};
