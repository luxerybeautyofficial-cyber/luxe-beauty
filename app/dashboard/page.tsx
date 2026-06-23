import { getDashboardStats, getDailyTrend, getLeaderboard } from '@/lib/actions';
import StatCard from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import {
  TrendingUp, Users, AtSign, FileText, Star, AlertTriangle,
  Video, ImageIcon, BarChart3, Calendar,
} from 'lucide-react';
import { formatPct, getStatus } from '@/lib/utils';

export default async function DashboardPage() {
  const [stats, trend, leaderboard] = await Promise.all([
    getDashboardStats(),
    getDailyTrend(14),
    getLeaderboard(),
  ]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20">
            <span className="text-gold text-xs font-medium">Monthly Avg: </span>
            <span className="text-gold text-sm font-bold">{stats.monthly_avg_performance}%</span>
          </div>
        </div>
      </div>

      {/* Today stats */}
      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3 font-medium">Today&apos;s Activity</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="TikTok Posts" value={stats.today_tiktok} icon={TrendingUp} gold />
          <StatCard title="Instagram Posts" value={stats.today_instagram} icon={BarChart3} gold />
          <StatCard title="Image Designs" value={stats.today_designs} icon={ImageIcon} />
          <StatCard title="AI Videos" value={stats.today_ai_videos} icon={Video} />
        </div>
      </div>

      {/* Monthly stats */}
      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3 font-medium">This Month</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Posts" value={stats.monthly_total_posts.toLocaleString()} icon={FileText} />
          <StatCard title="Avg Performance" value={formatPct(stats.monthly_avg_performance)} icon={TrendingUp} />
          <StatCard title="Reports Submitted" value={stats.total_reports} icon={FileText} />
          <StatCard title="Active Marketers" value={stats.active_marketers} icon={Users} />
        </div>
      </div>

      {/* Performance highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-0.5">Best Performer</p>
                <p className="text-white font-semibold text-sm">{stats.best_marketer}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-0.5">Needs Attention</p>
                <p className="text-white font-semibold text-sm">{stats.lowest_marketer}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="pt-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <AtSign className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-0.5">Top Account</p>
                <p className="text-white font-semibold text-sm">{stats.top_account}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts trend={trend} leaderboard={leaderboard} />

      {/* Mini leaderboard */}
      {leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Marketer Rankings — This Month</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Rank</th>
                    <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Marketer</th>
                    <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Performance</th>
                    <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Posts</th>
                    <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.slice(0, 5).map((m, i) => (
                    <tr key={m.marketer_id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          i === 0 ? 'bg-gold/20 text-gold' : 'bg-surface-border text-text-secondary'
                        }`}>
                          {m.rank}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className={`font-medium ${i === 0 ? 'text-gold' : 'text-white'}`}>{m.full_name}</p>
                        <p className="text-text-muted text-xs">{m.count} reports</p>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="font-semibold text-white">{m.avg_performance}%</span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-text-secondary hidden sm:table-cell">
                        {m.total_posts.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 text-right hidden md:table-cell">
                        <StatusBadge status={getStatus(m.avg_performance)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
