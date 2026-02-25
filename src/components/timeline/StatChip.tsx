interface StatChipProps {
  label: string;
  value: string;
  color?: string;
}

export default function StatChip({ label, value, color = 'text-doom-green' }: StatChipProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 px-2 py-1 rounded">
      <span className="text-gray-500 text-[9px] tracking-wider">
        {label}:{' '}
      </span>
      <span className={`${color} text-[9px] font-bold`}>
        {value}
      </span>
    </div>
  );
}
