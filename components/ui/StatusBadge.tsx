import { cn } from '@/lib/cn';
import { PerformanceStatus } from '@/types';
import { getStatusBg, getStatusLabel } from '@/lib/utils';

interface StatusBadgeProps {
  status: PerformanceStatus;
  pct?: number;
  className?: string;
}

export default function StatusBadge({ status, pct, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      getStatusBg(status),
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {getStatusLabel(status)}
      {pct !== undefined && <span className="opacity-70">({pct}%)</span>}
    </span>
  );
}
