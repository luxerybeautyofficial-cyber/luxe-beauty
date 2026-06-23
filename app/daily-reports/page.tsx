import { getDailyReports, getMarketers, getAccounts } from '@/lib/actions';
import DailyReportsClient from '@/components/reports/DailyReportsClient';

export default async function DailyReportsPage() {
  const [reports, marketers, accounts] = await Promise.all([
    getDailyReports(),
    getMarketers(true),
    getAccounts(true),
  ]);
  return <DailyReportsClient initialReports={reports} marketers={marketers} accounts={accounts} />;
}
