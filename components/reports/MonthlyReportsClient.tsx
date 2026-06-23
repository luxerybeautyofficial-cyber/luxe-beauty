'use client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import { getStatus, MONTHS, getTodayString } from '@/lib/utils';
import { TrendingUp, BarChart3, ImageIcon, Video, FileText, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Select from '@/components/ui/Select';

interface Props {
  leaderboard: any[];
  totals: { total_tiktok: number; total_instagram: number; total_designs: number; total_ai_videos: number; avg_performance: number; total_reports: number };
  month: number;
  year: number;
  monthName: string;
}

export default function MonthlyReportsClient({ leaderboard, totals, month, year, monthName }: Props) {
  const router = useRouter();
  const now = new Date();

  const monthOptions = MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = now.getFullYear() - i;
    return { value: String(y), label: String(y) };
  });

  const navigate = (m: number, y: number) => {
    router.push(`/monthly-reports?month=${m}&year=${y}`);
  };

  const exportXLSX = () => {
    const data = leaderboard.map((m) => ({
      Rank: m.rank,
      Marketer: m.full_name,
      'Total TikTok': m.total_tiktok,
      'Total Instagram': m.total_instagram,
      'Total Posts': m.total_posts,
      'Total Designs': m.total_designs,
      'Total AI Videos': m.total_ai_videos,
      'Reports Count': m.count,
      'Avg Performance %': m.avg_performance,
      Status: getStatus(m.avg_performance) === 'excellent' ? 'Excellent' : getStatus(m.avg_performance) === 'good' ? 'Good' : 'Needs Follow Up',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Monthly Report');
    XLSX.writeFile(wb, `luxe-beauty-${monthName}-${year}.xlsx`);
  };

  const exportCSV = () => {
    const data = leaderboard.map((m) =>
      [m.rank, m.full_name, m.total_tiktok, m.total_instagram, m.total_posts, m.total_designs, m.total_ai_videos, m.count, m.avg_performance].join(',')
    );
    const header = 'Rank,Marketer,TikTok,Instagram,Total Posts,Designs,AI Videos,Reports,Avg Performance %';
    const csv = [header, ...data].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `luxe-beauty-${monthName}-${year}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Monthly Reports"
        subtitle={`${monthName} ${year}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4" />CSV</Button>
            <Button variant="outline" size="sm" onClick={exportXLSX}><Download className="w-4 h-4" />Excel</Button>
          </div>
        }
      />

      {/* Month / Year selector */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-3 flex-wrap items-end">
            <Select label="Month" options={monthOptions} value={String(month)} onChange={(e) => navigate(Number(e.target.value), year)} className="w-44" />
            <Select label="Year" options={yearOptions} value={String(year)} onChange={(e) => navigate(month, Number(e.target.value))} className="w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total TikTok Posts" value={totals.total_tiktok.toLocaleString()} icon={TrendingUp} gold />
        <StatCard title="Total Instagram Posts" value={totals.total_instagram.toLocaleString()} icon={BarChart3} gold />
        <StatCard title="Image Designs" value={totals.total_designs.toLocaleString()} icon={ImageIcon} />
        <StatCard title="AI Videos" value={totals.total_ai_videos.toLocaleString()} icon={Video} />
        <StatCard title="Avg Performance" value={`${totals.avg_performance}%`} icon={TrendingUp} />
        <StatCard title="Total Reports" value={totals.total_reports} icon={FileText} />
      </div>

      {/* Leaderboard table */}
      <Card>
        <CardHeader>
          <CardTitle>Marketer Performance — {monthName} {year}</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Rank','Marketer','Avg Performance','Total Posts','Designs','AI Videos','Reports','Status'].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider ${i >= 2 ? 'text-right' : 'text-left'} ${i >= 4 && i < 6 ? 'hidden md:table-cell' : ''} ${i === 6 ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-text-muted">No data for this month</td></tr>
              ) : leaderboard.map((m, i) => (
                <tr key={m.marketer_id} className={`border-b border-surface-border/50 hover:bg-surface-hover transition-colors ${i === 0 ? 'bg-gold/5' : ''}`}>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${i === 0 ? 'bg-gold text-black' : i === 1 ? 'bg-surface-border text-white' : 'bg-surface-border text-text-secondary'}`}>
                      {m.rank}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className={`font-semibold ${i === 0 ? 'gold-text' : 'text-white'}`}>{m.full_name}</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-lg font-bold ${i === 0 ? 'text-gold' : 'text-white'}`}>{m.avg_performance}%</span>
                  </td>
                  <td className="px-5 py-4 text-right text-text-secondary">{m.total_posts.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-text-secondary hidden md:table-cell">{m.total_designs}</td>
                  <td className="px-5 py-4 text-right text-text-secondary hidden md:table-cell">{m.total_ai_videos}</td>
                  <td className="px-5 py-4 text-right text-text-muted hidden lg:table-cell">{m.count}</td>
                  <td className="px-5 py-4 text-right">
                    <StatusBadge status={getStatus(m.avg_performance)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
