import { DailyReport, DailyReportWithCalc, PerformanceStatus } from '@/types';

export const DAILY_TARGET = 30;

export function calcReportStats(report: DailyReport): DailyReportWithCalc {
  const total_tiktok = (report.morning_tiktok || 0) + (report.scheduled_tiktok || 0);
  const total_instagram = (report.morning_instagram || 0) + (report.scheduled_instagram || 0);
  const total_posts = total_tiktok + total_instagram;
  const performance_pct = Math.round((total_posts / DAILY_TARGET) * 100);
  const status = getStatus(performance_pct);
  return { ...report, total_tiktok, total_instagram, total_posts, performance_pct, status };
}

export function getStatus(pct: number): PerformanceStatus {
  if (pct >= 100) return 'excellent';
  if (pct >= 80) return 'good';
  return 'followup';
}

export function getStatusLabel(status: PerformanceStatus): string {
  const map = { excellent: 'Excellent', good: 'Good', followup: 'Needs Follow Up' };
  return map[status];
}

export function getStatusColor(status: PerformanceStatus): string {
  const map = { excellent: '#22C55E', good: '#EAB308', followup: '#EF4444' };
  return map[status];
}

export function getStatusBg(status: PerformanceStatus): string {
  const map = {
    excellent: 'bg-green-500/10 text-green-400 border-green-500/20',
    good: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    followup: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return map[status];
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatPct(pct: number): string {
  return `${pct}%`;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const end = new Date(year, month, 0).toISOString().split('T')[0];
  return { start, end };
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
