interface FormErrorProps {
  message: string | null;
}

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="doom-panel p-3 border-2 border-doom-red bg-gradient-to-b from-[#3a1a1a] to-[#2a0a0a]">
      <div className="flex items-center gap-2">
        <span className="text-doom-red text-lg">⚠</span>
        <p className="text-doom-red text-[9px] tracking-wider font-bold">{message}</p>
      </div>
    </div>
  );
}
