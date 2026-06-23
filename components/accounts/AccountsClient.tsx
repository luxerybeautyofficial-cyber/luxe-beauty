'use client';
import { useState, useTransition } from 'react';
import { Account, Marketer } from '@/types';
import { createAccount, updateAccount, deleteAccount } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Plus, Edit2, Trash2, AtSign } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/utils';

interface Props { initialAccounts: Account[]; marketers: Marketer[]; }

const emptyForm = { account_name: '', platform: 'tiktok', marketer_id: '' };

const platformOptions = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
];

export default function AccountsClient({ initialAccounts, marketers }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');

  const marketerOptions = marketers.map((m) => ({ value: m.id, label: m.full_name }));

  const filtered = initialAccounts.filter((a) =>
    a.account_name.toLowerCase().includes(search.toLowerCase()) &&
    (!filterPlatform || a.platform === filterPlatform)
  );

  const handleAdd = () => { setForm(emptyForm); setShowAdd(true); };
  const handleEdit = (a: Account) => {
    setForm({ account_name: a.account_name, platform: a.platform, marketer_id: a.marketer_id });
    setEditTarget(a);
  };

  const validate = () => {
    if (!form.account_name.trim()) { showToast('Account name is required', 'error'); return false; }
    if (!form.marketer_id) { showToast('Please select a marketer', 'error'); return false; }
    return true;
  };

  const handleSubmitAdd = () => {
    if (!validate()) return;
    startTransition(async () => {
      const res = await createAccount(form);
      if (res.error) showToast(res.error, 'error');
      else { showToast('Account added'); setShowAdd(false); router.refresh(); }
    });
  };

  const handleSubmitEdit = () => {
    if (!editTarget || !validate()) return;
    startTransition(async () => {
      const res = await updateAccount(editTarget.id, { ...form, platform: form.platform as 'tiktok' | 'instagram' });
      if (res.error) showToast(res.error, 'error');
      else { showToast('Account updated'); setEditTarget(null); router.refresh(); }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteAccount(deleteTarget.id);
      if (res.error) showToast(res.error, 'error');
      else { showToast('Account deleted'); setDeleteTarget(null); router.refresh(); }
    });
  };

  const PlatformBadge = ({ platform }: { platform: string }) => (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      platform === 'tiktok'
        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
    )}>
      {platform === 'tiktok' ? '🎵 TikTok' : '📸 Instagram'}
    </span>
  );

  const FormFields = () => (
    <div className="space-y-4">
      <Input label="Account Name" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} placeholder="@accountname" />
      <Select label="Platform" options={platformOptions} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
      <Select label="Assigned Marketer" options={marketerOptions} value={form.marketer_id} onChange={(e) => setForm({ ...form, marketer_id: e.target.value })} placeholder="Select marketer..." />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Accounts"
        subtitle={`${initialAccounts.length} total accounts`}
        actions={<Button onClick={handleAdd} size="sm"><Plus className="w-4 h-4" />Add Account</Button>}
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <Input placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          options={[{ value: '', label: 'All Platforms' }, ...platformOptions]}
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="w-40"
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Account</th>
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Platform</th>
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Marketer</th>
                <th className="text-center px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Added</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    <AtSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search ? 'No accounts found' : 'No accounts yet'}
                  </td>
                </tr>
              ) : filtered.map((a) => (
                <tr key={a.id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{a.account_name}</td>
                  <td className="px-6 py-4"><PlatformBadge platform={a.platform} /></td>
                  <td className="px-6 py-4 text-text-secondary hidden sm:table-cell">
                    {(a.marketer as any)?.full_name || '—'}
                  </td>
                  <td className="px-6 py-4 text-center hidden md:table-cell">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border',
                      a.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-surface-border text-text-muted border-surface-border'
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-text-muted text-xs hidden lg:table-cell">{formatDate(a.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(a)} className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Account">
        <div className="space-y-5"><FormFields />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleSubmitAdd} loading={isPending}>Add Account</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Account">
        <div className="space-y-5"><FormFields />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSubmitEdit} loading={isPending}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">Delete <span className="text-white font-medium">{deleteTarget?.account_name}</span>? This action cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={isPending}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
