'use client';
import { useState, useTransition } from 'react';
import { DailyReportWithCalc, Marketer, Account } from '@/types';
import { createDailyReport, updateDailyReport, deleteDailyReport } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { Plus, Edit2, Trash2, FileText, Download } from 'lucide-react';
import { formatDate, getTodayString, calcReportStats } from '@/lib/utils';
import * as XLSX from 'xlsx';

interface Props {
  initialReports: DailyReportWithCalc[];
  marketers: Marketer[];
  accounts: Account[];
}

const emptyForm = {
  report_date: getTodayString(),
  marketer_id: '',
  account_id: '',
  morning_tiktok: 0,
  morning_instagram: 0,
  scheduled_tiktok: 0,
  scheduled_instagram: 0,
  image_designs: 0,
  ai_videos: 0,
  notes: '',
};

export default function DailyReportsClient({ initialReports, marketers, accounts }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<DailyReportWithCalc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DailyReportWithCalc | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterDate, setFilterDate] = useState('');
  const [filterMarketer, setFilterMarketer] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const marketerOptions = marketers.map((m) => ({ value: m.id, label: m.full_name }));
  const accountOptions = accounts.map((a) => ({ value: a.id, label: `${a.account_name} (${a.platform})` }));

  // Filter accounts based on marketer selection
  const filteredAccountOptions = form.marketer_id
    ? accounts.filter((a) => a.marketer_id === form.marketer_id).map((a) => ({ value: a.id, label: `${a.account_name} (${a.platform})` }))
    : accountOptions;

  const filtered = initialReports.filter((r) => {
    if (filterDate && r.report_date !== filterDate) return false;
    if (filterMarketer && r.marketer_id !== filterMarketer) return false;
    if (filterAccount && r.account_id !== filterAccount) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const handleAdd = () => { setForm({ ...emptyForm, report_date: getTodayString() }); setShowForm(true); };
  const handleEdit = (r: DailyReportWithCalc) => {
    setForm({
      report_date: r.report_date, marketer_id: r.marketer_id, account_id: r.account_id,
      morning_tiktok: r.morning_tiktok, morning_instagram: r.morning_instagram,
      scheduled_tiktok: r.scheduled_tiktok, scheduled_instagram: r.scheduled_instagram,
      image_designs: r.image_designs, ai_videos: r.ai_videos, notes: r.notes || '',
    });
    setEditTarget(r);
  };

  const validate = () => {
    if (!form.marketer_id) { showToast('Please select a marketer', 'error'); return false; }
    if (!form.account_id) { showToast('Please select an account', 'error'); return false; }
    return true;
  };

  const handleSubmit = (isEdit: boolean) => {
    if (!validate()) return;
    startTransition(async () => {
      const payload = {
        ...form,
        morning_tiktok: Number(form.morning_tiktok),
        morning_instagram: Number(form.morning_instagram),
        scheduled_tiktok: Number(form.scheduled_tiktok),
        scheduled_instagram: Number(form.scheduled_instagram),
        image_designs: Number(form.image_designs),
        ai_videos: Number(form.ai_videos),
      };
      const res = isEdit && editTarget
        ? await updateDailyReport(editTarget.id, payload)
        : await createDailyReport(payload as any);
      if (res.error) showToast(res.error, 'error');
      else {
        showToast(isEdit ? 'Report updated' : 'Report saved');
        setShowForm(false);
        setEditTarget(null);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteDailyReport(deleteTarget.id);
      if (res.error) showToast(res.error, 'error');
      else { showToast('Report deleted'); setDeleteTarget(null); router.refresh(); }
    });
  };

  const exportXLSX = () => {
    const data = filtered.map((r) => ({
      Date: r.report_date,
      Marketer: (r.marketer as any)?.full_name || '',
      Account: (r.account as any)?.account_name || '',
      Platform: (r.account as any)?.platform || '',
      'Morning TikTok': r.morning_tiktok,
      'Scheduled TikTok': r.scheduled_tiktok,
      'Total TikTok': r.total_tiktok,
      'Morning Instagram': r.morning_instagram,
      'Scheduled Instagram': r.scheduled_instagram,
      'Total Instagram': r.total_instagram,
      'Total Posts': r.total_posts,
      'Image Designs': r.image_designs,
      'AI Videos': r.ai_videos,
      'Performance %': r.performance_pct,
      Status: r.status === 'excellent' ? 'Excellent' : r.status === 'good' ? 'Good' : 'Needs Follow Up',
      Notes: r.notes || '',
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Daily Reports');
    XLSX.writeFile(wb, `luxe-beauty-daily-reports-${getTodayString()}.xlsx`);
  };

  const NumInput = ({ field, label }: { field: keyof typeof form; label: string }) => (
    <div>
      <label className="text-xs text-text-secondary block mb-1">{label}</label>
      <input
        type="number" min={0}
        value={form[field] as number}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        className="w-full px-3 py-2 rounded-lg bg-surface-border border border-surface-border text-white text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20"
      />
    </div>
  );

  const FormContent = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Date" type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} />
        <Select label="Marketer" options={marketerOptions} value={form.marketer_id}
          onChange={(e) => setForm({ ...form, marketer_id: e.target.value, account_id: '' })}
          placeholder="Select marketer..." />
      </div>
      <Select label="Account" options={filteredAccountOptions} value={form.account_id}
        onChange={(e) => setForm({ ...form, account_id: e.target.value })}
        placeholder="Select account..." />

      <div className="border-t border-surface-border pt-4">
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">TikTok Posts</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput field="morning_tiktok" label="Morning Posts" />
          <NumInput field="scheduled_tiktok" label="Scheduled Posts" />
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Instagram Posts</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput field="morning_instagram" label="Morning Posts" />
          <NumInput field="scheduled_instagram" label="Scheduled Posts" />
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Creative</p>
        <div className="grid grid-cols-2 gap-4">
          <NumInput field="image_designs" label="Image Designs" />
          <NumInput field="ai_videos" label="AI Videos" />
        </div>
      </div>

      {/* Live preview */}
      {(form.marketer_id || form.account_id) && (() => {
        const preview = calcReportStats({
          ...form, id: '', created_at: '',
          morning_tiktok: Number(form.morning_tiktok),
          morning_instagram: Number(form.morning_instagram),
          scheduled_tiktok: Number(form.scheduled_tiktok),
          scheduled_instagram: Number(form.scheduled_instagram),
          image_designs: Number(form.image_designs),
          ai_videos: Number(form.ai_videos),
        } as any);
        return (
          <div className="bg-surface-border rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-text-muted text-xs">Total Posts</p>
              <p className="text-white font-bold text-xl">{preview.total_posts}</p>
            </div>
            <div>
              <p className="text-text-muted text-xs">Performance</p>
              <p className="text-gold font-bold text-xl">{preview.performance_pct}%</p>
            </div>
            <StatusBadge status={preview.status} />
          </div>
        );
      })()}

      <div>
        <label className="text-sm text-text-secondary font-medium block mb-1.5">Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          placeholder="Any additional notes..."
          className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-surface-border text-white placeholder:text-text-muted text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20 resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Daily Reports"
        subtitle={`${filtered.length} reports`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportXLSX}><Download className="w-4 h-4" />Export</Button>
            <Button size="sm" onClick={handleAdd}><Plus className="w-4 h-4" />Add Report</Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setPage(1); }} className="w-44" />
        <Select options={[{ value: '', label: 'All Marketers' }, ...marketerOptions]} value={filterMarketer}
          onChange={(e) => { setFilterMarketer(e.target.value); setPage(1); }} className="flex-1 min-w-[160px] max-w-xs" />
        <Select options={[{ value: '', label: 'All Accounts' }, ...accountOptions]} value={filterAccount}
          onChange={(e) => { setFilterAccount(e.target.value); setPage(1); }} className="flex-1 min-w-[160px] max-w-xs" />
        {(filterDate || filterMarketer || filterAccount) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterDate(''); setFilterMarketer(''); setFilterAccount(''); setPage(1); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Date','Marketer','Account','TikTok','Instagram','Images','AI Videos','Performance','Status',''].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-text-muted font-medium text-xs uppercase tracking-wider ${i >= 3 ? 'text-right' : 'text-left'} ${i >= 3 && i < 6 ? 'hidden md:table-cell' : ''} ${i === 6 ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-text-muted">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No reports found
                </td></tr>
              ) : paginated.map((r) => (
                <tr key={r.id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3.5 text-text-secondary whitespace-nowrap">{formatDate(r.report_date)}</td>
                  <td className="px-4 py-3.5 font-medium text-white">{(r.marketer as any)?.full_name || '—'}</td>
                  <td className="px-4 py-3.5 text-text-secondary">{(r.account as any)?.account_name || '—'}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-white hidden md:table-cell">{r.total_tiktok}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-white hidden md:table-cell">{r.total_instagram}</td>
                  <td className="px-4 py-3.5 text-right text-text-secondary hidden md:table-cell">{r.image_designs}</td>
                  <td className="px-4 py-3.5 text-right text-text-secondary hidden lg:table-cell">{r.ai_videos}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-white">{r.performance_pct}%</span>
                  </td>
                  <td className="px-4 py-3.5 text-right"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(r)} className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border">
            <p className="text-text-muted text-sm">
              Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Daily Report" size="lg">
        <div className="space-y-5"><FormContent />
          <div className="flex gap-3 justify-end pt-2 border-t border-surface-border">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit(false)} loading={isPending}>Save Report</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Report" size="lg">
        <div className="space-y-5"><FormContent />
          <div className="flex gap-3 justify-end pt-2 border-t border-surface-border">
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={() => handleSubmit(true)} loading={isPending}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Report" size="sm">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">Delete this report from {deleteTarget && formatDate(deleteTarget.report_date)}? This cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={isPending}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
