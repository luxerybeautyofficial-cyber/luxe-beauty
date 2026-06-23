'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface DashboardChartsProps {
  trend: { date: string; avg_pct: number }[];
  leaderboard: { full_name: string; avg_performance: number; total_posts: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-surface-border rounded-xl p-3 shadow-card text-sm">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color }}>
          {p.value}{p.name.includes('pct') || p.name.includes('performance') ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

export default function DashboardCharts({ trend, leaderboard }: DashboardChartsProps) {
  const trendData = trend.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const leaderboardData = leaderboard.slice(0, 8).map((m) => ({
    name: m.full_name.split(' ')[0],
    performance: m.avg_performance,
    posts: m.total_posts,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance Trend</CardTitle>
          <p className="text-text-secondary text-sm mt-0.5">Average performance % over last 14 days</p>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="date" tick={{ fill: '#A0A0A0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#A0A0A0', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={100} stroke="#D4AF37" strokeDasharray="4 4" strokeOpacity={0.5} />
                <ReferenceLine y={80} stroke="#EAB308" strokeDasharray="4 4" strokeOpacity={0.3} />
                <Line
                  type="monotone" dataKey="avg_pct" stroke="#D4AF37" strokeWidth={2}
                  dot={{ fill: '#D4AF37', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#D4AF37' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-text-muted text-sm">
              No data available yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Marketer Performance Ranking</CardTitle>
          <p className="text-text-secondary text-sm mt-0.5">Average performance % this month</p>
        </CardHeader>
        <CardContent>
          {leaderboardData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leaderboardData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#A0A0A0', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#A0A0A0', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine x={100} stroke="#D4AF37" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Bar dataKey="performance" fill="#D4AF37" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-text-muted text-sm">
              No data available yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
