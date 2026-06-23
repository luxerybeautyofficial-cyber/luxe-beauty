'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { calcReportStats, getMonthRange } from '@/lib/utils';
import { DailyReport, Marketer, Account } from '@/types';

// ── AUTH ──────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { success: true };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/');
}

// ── MARKETERS ─────────────────────────────────────────
export async function getMarketers(activeOnly = false) {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from('marketers').select('*').order('full_name');
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw error;
  return data as Marketer[];
}

export async function createMarketer(data: { full_name: string; target_tiktok: number; target_instagram: number }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('marketers').insert({ ...data, is_active: true });
  if (error) return { error: error.message };
  revalidatePath('/marketers');
  return { success: true };
}

export async function updateMarketer(id: string, data: Partial<Marketer>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('marketers').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/marketers');
  return { success: true };
}

export async function deleteMarketer(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('marketers').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/marketers');
  return { success: true };
}

// ── ACCOUNTS ──────────────────────────────────────────
export async function getAccounts(activeOnly = false) {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from('accounts')
    .select('*, marketer:marketers(id, full_name)')
    .order('account_name');
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw error;
  return data as Account[];
}

export async function createAccount(data: { account_name: string; platform: string; marketer_id: string }) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('accounts').insert({ ...data, is_active: true });
  if (error) return { error: error.message };
  revalidatePath('/accounts');
  return { success: true };
}

export async function updateAccount(id: string, data: Partial<Account>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('accounts').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/accounts');
  return { success: true };
}

export async function deleteAccount(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/accounts');
  return { success: true };
}

// ── DAILY REPORTS ─────────────────────────────────────
export async function getDailyReports(filters?: {
  date?: string;
  marketer_id?: string;
  account_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from('daily_reports')
    .select('*, marketer:marketers(id, full_name), account:accounts(id, account_name, platform)')
    .order('report_date', { ascending: false });

  if (filters?.date) q = q.eq('report_date', filters.date);
  if (filters?.marketer_id) q = q.eq('marketer_id', filters.marketer_id);
  if (filters?.account_id) q = q.eq('account_id', filters.account_id);
  if (filters?.start_date) q = q.gte('report_date', filters.start_date);
  if (filters?.end_date) q = q.lte('report_date', filters.end_date);

  const { data, error } = await q;
  if (error) throw error;
  return (data as DailyReport[]).map(calcReportStats);
}

export async function createDailyReport(data: Omit<DailyReport, 'id' | 'created_at'>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('daily_reports').insert(data);
  if (error) return { error: error.message };
  revalidatePath('/daily-reports');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateDailyReport(id: string, data: Partial<DailyReport>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('daily_reports').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/daily-reports');
  return { success: true };
}

export async function deleteDailyReport(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('daily_reports').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/daily-reports');
  return { success: true };
}

// ── DASHBOARD STATS ───────────────────────────────────
export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const { start, end } = getMonthRange(now.getFullYear(), now.getMonth() + 1);

  const [todayReports, monthReports, marketers, accounts] = await Promise.all([
    getDailyReports({ date: today }),
    getDailyReports({ start_date: start, end_date: end }),
    getMarketers(true),
    getAccounts(true),
  ]);

  const today_tiktok = todayReports.reduce((s, r) => s + r.total_tiktok, 0);
  const today_instagram = todayReports.reduce((s, r) => s + r.total_instagram, 0);
  const today_designs = todayReports.reduce((s, r) => s + (r.image_designs || 0), 0);
  const today_ai_videos = todayReports.reduce((s, r) => s + (r.ai_videos || 0), 0);
  const monthly_total_posts = monthReports.reduce((s, r) => s + r.total_posts, 0);
  const monthly_avg_performance = monthReports.length
    ? Math.round(monthReports.reduce((s, r) => s + r.performance_pct, 0) / monthReports.length)
    : 0;

  // Best/lowest marketer
  const marketerMap: Record<string, { name: string; total: number; count: number }> = {};
  monthReports.forEach((r) => {
    if (!marketerMap[r.marketer_id]) {
      marketerMap[r.marketer_id] = { name: r.marketer?.full_name || '', total: 0, count: 0 };
    }
    marketerMap[r.marketer_id].total += r.performance_pct;
    marketerMap[r.marketer_id].count++;
  });

  const marketerAvgs = Object.values(marketerMap).map((m) => ({
    ...m,
    avg: m.count > 0 ? m.total / m.count : 0,
  }));
  marketerAvgs.sort((a, b) => b.avg - a.avg);

  // Top account
  const accountMap: Record<string, { name: string; total: number }> = {};
  monthReports.forEach((r) => {
    const name = r.account?.account_name || '';
    if (!accountMap[r.account_id]) accountMap[r.account_id] = { name, total: 0 };
    accountMap[r.account_id].total += r.total_posts;
  });
  const topAccount = Object.values(accountMap).sort((a, b) => b.total - a.total)[0];

  return {
    today_tiktok,
    today_instagram,
    today_designs,
    today_ai_videos,
    monthly_total_posts,
    monthly_avg_performance,
    total_reports: monthReports.length,
    active_marketers: marketers.length,
    active_accounts: accounts.length,
    best_marketer: marketerAvgs[0]?.name || '—',
    lowest_marketer: marketerAvgs[marketerAvgs.length - 1]?.name || '—',
    top_account: topAccount?.name || '—',
  };
}

// ── LEADERBOARD ───────────────────────────────────────
export async function getLeaderboard(year?: number, month?: number) {
  const now = new Date();
  const y = year || now.getFullYear();
  const m = month || now.getMonth() + 1;
  const { start, end } = getMonthRange(y, m);

  const reports = await getDailyReports({ start_date: start, end_date: end });
  const marketers = await getMarketers();

  const statsMap: Record<string, {
    marketer_id: string; full_name: string;
    total_tiktok: number; total_instagram: number; total_posts: number;
    total_designs: number; total_ai_videos: number;
    total_pct: number; count: number;
  }> = {};

  reports.forEach((r) => {
    if (!statsMap[r.marketer_id]) {
      const m = marketers.find((mk) => mk.id === r.marketer_id);
      statsMap[r.marketer_id] = {
        marketer_id: r.marketer_id,
        full_name: m?.full_name || r.marketer?.full_name || '',
        total_tiktok: 0, total_instagram: 0, total_posts: 0,
        total_designs: 0, total_ai_videos: 0, total_pct: 0, count: 0,
      };
    }
    statsMap[r.marketer_id].total_tiktok += r.total_tiktok;
    statsMap[r.marketer_id].total_instagram += r.total_instagram;
    statsMap[r.marketer_id].total_posts += r.total_posts;
    statsMap[r.marketer_id].total_designs += r.image_designs || 0;
    statsMap[r.marketer_id].total_ai_videos += r.ai_videos || 0;
    statsMap[r.marketer_id].total_pct += r.performance_pct;
    statsMap[r.marketer_id].count++;
  });

  return Object.values(statsMap)
    .map((s) => ({
      ...s,
      avg_performance: s.count > 0 ? Math.round(s.total_pct / s.count) : 0,
    }))
    .sort((a, b) => b.avg_performance - a.avg_performance)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

// ── DAILY TREND ───────────────────────────────────────
export async function getDailyTrend(days = 14) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const reports = await getDailyReports({
    start_date: start.toISOString().split('T')[0],
    end_date: end.toISOString().split('T')[0],
  });

  const dayMap: Record<string, { date: string; avg_pct: number; total: number; count: number }> = {};
  reports.forEach((r) => {
    if (!dayMap[r.report_date]) {
      dayMap[r.report_date] = { date: r.report_date, avg_pct: 0, total: 0, count: 0 };
    }
    dayMap[r.report_date].total += r.performance_pct;
    dayMap[r.report_date].count++;
  });

  return Object.values(dayMap)
    .map((d) => ({ date: d.date, avg_pct: Math.round(d.total / d.count) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
