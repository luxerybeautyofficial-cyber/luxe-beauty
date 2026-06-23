import { cn } from '@/lib/cn';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gold?: boolean;
  trend?: number;
  className?: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, gold, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-5 bg-surface-elevated shadow-card transition-all duration-200 hover:shadow-gold-sm hover:border-gold/20',
      gold ? 'border-gold/30 shadow-gold-sm' : 'border-surface-border',
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-secondary uppercase tracking-wider font-medium mb-2">{title}</p>
          <p className={cn('text-2xl font-bold truncate', gold ? 'gold-text' : 'text-white')}>{value}</p>
          {subtitle && <p className="text-xs text-text-muted mt-1 truncate">{subtitle}</p>}
          {trend !== undefined && (
            <p className={cn('text-xs mt-1', trend >= 0 ? 'text-green-400' : 'text-red-400')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          gold ? 'bg-gold/10' : 'bg-surface-border'
        )}>
          <Icon className={cn('w-5 h-5', gold ? 'text-gold' : 'text-text-secondary')} />
        </div>
      </div>
    </div>
  );
}
