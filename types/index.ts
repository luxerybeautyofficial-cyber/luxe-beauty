export type Platform = 'tiktok' | 'instagram';

export type PerformanceStatus = 'excellent' | 'good' | 'followup';

export interface Marketer {
  id: string;
  full_name: string;
  target_tiktok: number;
  target_instagram: number;
  is_active: boolean;
  created_at: string;
}

export interface Account {
  id: string;
  account_name: string;
  platform: Platform;
  marketer_id: string;
  is_active: boolean;
  created_at: string;
  marketer?: Marketer;
}

export interface DailyReport {
  id: string;
  report_date: string;
  marketer_id: string;
  account_id: string;
  morning_tiktok: number;
  morning_instagram: number;
  scheduled_tiktok: number;
  scheduled_instagram: number;
  image_designs: number;
  ai_videos: number;
  notes?: string;
  created_at: string;
  marketer?: Marketer;
  account?: Account;
}

export interface DailyReportWithCalc extends DailyReport {
  total_tiktok: number;
  total_instagram: number;
  total_posts: number;
  performance_pct: number;
  status: PerformanceStatus;
}

export interface MarketerStats {
  marketer_id: string;
  full_name: string;
  total_tiktok: number;
  total_instagram: number;
  total_posts: number;
  total_designs: number;
  total_ai_videos: number;
  avg_performance: number;
  report_count: number;
  rank?: number;
}

export interface DashboardStats {
  today_tiktok: number;
  today_instagram: number;
  today_designs: number;
  today_ai_videos: number;
  monthly_total_posts: number;
  monthly_avg_performance: number;
  total_reports: number;
  active_marketers: number;
  active_accounts: number;
  best_marketer: string;
  lowest_marketer: string;
  top_account: string;
}
