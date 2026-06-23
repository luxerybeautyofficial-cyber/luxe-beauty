import { getLeaderboard, getDailyReports } from '@/lib/actions';
import { getMonthRange, MONTHS } from '@/lib/utils';
import MonthlyReportsClient from '@/components/reports/MonthlyReportsClient';

interface PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function MonthlyReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const now = new Date();
  const month = Number(params.month) || now.getMonth() + 1;
  const year = Number(params.year) || now.getFullYear();

  const { start, end } = getMonthRange(year, month);
  const [leaderboard, reports] = await Promise.all([
    getLeaderboard(year, month),
    getDailyReports({ start_date: start, end_date: end }),
  ]);

  const totals = {
    total_tiktok: reports.reduce((s, r) => s + r.total_tiktok, 0),
    total_instagram: reports.reduce((s, r) => s + r.total_instagram, 0),
    total_designs: reports.reduce((s, r) => s + (r.image_designs || 0), 0),
    total_ai_videos: reports.reduce((s, r) => s + (r.ai_videos || 0), 0),
    avg_performance: reports.length ? Math.round(reports.reduce((s, r) => s + r.performance_pct, 0) / reports.length) : 0,
    total_reports: reports.length,
  };

  return (
    <MonthlyReportsClient
      leaderboard={leaderboard}
      totals={totals}
      month={month}
      year={year}
      monthName={MONTHS[month - 1]}
    />
  );
}
