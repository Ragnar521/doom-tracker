import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'google' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    w-full p-3 font-bold text-[10px] tracking-widest
    transition-all duration-150 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  `;

  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      doom-button text-white
      hover:shadow-[0_0_20px_rgba(255,50,50,0.4)]
      active:translate-y-[2px]
    `,
    secondary: `
      nav-button text-gray-300
      hover:text-white
      active:translate-y-[1px]
    `,
    google: `
      bg-gradient-to-b from-white to-gray-200
      border-2 border-gray-300
      text-gray-800
      hover:from-gray-100 hover:to-gray-300
      hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]
      active:translate-y-[1px]
    `,
    ghost: `
      bg-transparent border-2 border-gray-600
      text-gray-400
      hover:border-gray-500 hover:text-gray-300
      active:translate-y-[1px]
    `,
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="doom-spinner w-4 h-4 border-2" />
          <span>LOADING...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
