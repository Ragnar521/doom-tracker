import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-gray-400 text-[8px] tracking-widest mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            doom-input w-full px-3 py-2 text-[10px]
            bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]
            border-2 border-[#3a3a3a]
            text-white placeholder-gray-600
            focus:border-doom-gold focus:outline-none
            transition-colors duration-200
            ${error ? 'border-doom-red' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-doom-red text-[8px] mt-1 tracking-wider">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
