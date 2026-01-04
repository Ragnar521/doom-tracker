interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`doom-spinner ${sizeClasses[size]}`} />
      {text && (
        <p className="text-gray-500 text-[10px] tracking-widest animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function SkeletonPanel() {
  return (
    <div className="doom-panel p-4 space-y-3">
      <SkeletonBox className="h-4 w-1/3" />
      <SkeletonBox className="h-8 w-full" />
      <SkeletonBox className="h-4 w-2/3" />
    </div>
  );
}
