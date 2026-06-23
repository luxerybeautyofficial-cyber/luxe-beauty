import { getLeaderboard } from '@/lib/actions';
import { getStatus, MONTHS } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import { Trophy, TrendingUp, FileText } from 'lucide-react';

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboard();
  const now = new Date();

  const topMarketer = leaderboard[0];
  const avgPerf = leaderboard.length
    ? Math.round(leaderboard.reduce((s, m) => s + m.avg_performance, 0) / leaderboard.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Leaderboard"
        subtitle={`${MONTHS[now.getMonth()]} ${now.getFullYear()} rankings`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Top Performer" value={topMarketer?.full_name || '—'} icon={Trophy} gold
          subtitle={topMarketer ? `${topMarketer.avg_performance}% avg` : undefined} />
        <StatCard title="Team Average" value={`${avgPerf}%`} icon={TrendingUp} />
        <StatCard title="Active Marketers" value={leaderboard.length} icon={FileText} />
      </div>

      {/* Top 3 podium */}
      {leaderboard.length >= 1 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map((idx) => {
            const m = leaderboard[idx];
            if (!m) return <div key={idx} />;
            const isFirst = idx === 0;
            return (
              <Card key={m.marketer_id} gold={isFirst} className={isFirst ? 'order-2 sm:order-none' : ''}>
                <div className="p-5 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold border-2 ${isFirst ? 'bg-gold text-black border-gold' : 'bg-surface-border text-white border-surface-border'}`}>
                    {m.rank}
                  </div>
                  <p className={`font-bold text-sm ${isFirst ? 'gold-text text-base' : 'text-white'}`}>{m.full_name}</p>
                  <p className={`text-2xl font-bold mt-1 ${isFirst ? 'text-gold' : 'text-white'}`}>{m.avg_performance}%</p>
                  <p className="text-text-muted text-xs mt-1">{m.total_posts} posts</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Rank','Marketer','Avg Performance','Total Posts','Designs','AI Videos','Status'].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider ${i >= 2 ? 'text-right' : 'text-left'} ${i >= 4 && i < 5 ? 'hidden md:table-cell' : ''} ${i === 5 ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-muted">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No data this month
                </td></tr>
              ) : leaderboard.map((m, i) => (
                <tr key={m.marketer_id} className={`border-b border-surface-border/50 hover:bg-surface-hover transition-colors ${i === 0 ? 'bg-gold/5' : ''}`}>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${i === 0 ? 'bg-gold text-black' : i < 3 ? 'bg-surface-border text-white' : 'text-text-secondary'}`}>
                      {m.rank}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-gold/10 text-gold border border-gold/30' : 'bg-surface-border text-text-secondary'}`}>
                        {m.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className={`font-semibold ${i === 0 ? 'gold-text' : 'text-white'}`}>{m.full_name}</span>
                      {i === 0 && <Trophy className="w-3.5 h-3.5 text-gold" />}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-lg font-bold ${i === 0 ? 'text-gold' : 'text-white'}`}>{m.avg_performance}%</span>
                  </td>
                  <td className="px-5 py-4 text-right text-text-secondary">{m.total_posts.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-text-secondary hidden md:table-cell">{m.total_designs}</td>
                  <td className="px-5 py-4 text-right text-text-secondary hidden lg:table-cell">{m.total_ai_videos}</td>
                  <td className="px-5 py-4 text-right"><StatusBadge status={getStatus(m.avg_performance)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
