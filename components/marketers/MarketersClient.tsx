'use client';
import { useState, useTransition } from 'react';
import { Marketer } from '@/types';
import { createMarketer, updateMarketer, deleteMarketer } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Edit2, Trash2, Users, Power } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/utils';

interface Props { initialMarketers: Marketer[]; }

const emptyForm = { full_name: '', target_tiktok: 15, target_instagram: 15 };

export default function MarketersClient({ initialMarketers }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Marketer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Marketer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  const filtered = initialMarketers.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => setForm(emptyForm);

  const handleAdd = () => { resetForm(); setShowAdd(true); };
  const handleEdit = (m: Marketer) => {
    setForm({ full_name: m.full_name, target_tiktok: m.target_tiktok, target_instagram: m.target_instagram });
    setEditTarget(m);
  };

  const handleSubmitAdd = () => {
    if (!form.full_name.trim()) { showToast('Name is required', 'error'); return; }
    startTransition(async () => {
      const res = await createMarketer({ full_name: form.full_name, target_tiktok: Number(form.target_tiktok), target_instagram: Number(form.target_instagram) });
      if (res.error) { showToast(res.error, 'error'); }
      else { showToast('Marketer added successfully'); setShowAdd(false); router.refresh(); }
    });
  };

  const handleSubmitEdit = () => {
    if (!editTarget) return;
    startTransition(async () => {
      const res = await updateMarketer(editTarget.id, { full_name: form.full_name, target_tiktok: Number(form.target_tiktok), target_instagram: Number(form.target_instagram) });
      if (res.error) { showToast(res.error, 'error'); }
      else { showToast('Marketer updated'); setEditTarget(null); router.refresh(); }
    });
  };

  const handleToggleActive = (m: Marketer) => {
    startTransition(async () => {
      const res = await updateMarketer(m.id, { is_active: !m.is_active });
      if (res.error) showToast(res.error, 'error');
      else { showToast(`Marketer ${m.is_active ? 'deactivated' : 'activated'}`); router.refresh(); }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteMarketer(deleteTarget.id);
      if (res.error) { showToast(res.error, 'error'); }
      else { showToast('Marketer deleted'); setDeleteTarget(null); router.refresh(); }
    });
  };

  const FormFields = () => (
    <div className="space-y-4">
      <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Enter marketer's full name" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="TikTok Target" type="number" min={1} value={form.target_tiktok} onChange={(e) => setForm({ ...form, target_tiktok: Number(e.target.value) })} />
        <Input label="Instagram Target" type="number" min={1} value={form.target_instagram} onChange={(e) => setForm({ ...form, target_instagram: Number(e.target.value) })} />
      </div>
    </div>
  );

  const activeCount = initialMarketers.filter((m) => m.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Marketers"
        subtitle={`${activeCount} active · ${initialMarketers.length} total`}
        actions={<Button onClick={handleAdd} size="sm"><Plus className="w-4 h-4" />Add Marketer</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{initialMarketers.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Active</p>
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Inactive</p>
          <p className="text-2xl font-bold text-red-400">{initialMarketers.length - activeCount}</p>
        </Card>
      </div>

      {/* Search */}
      <Input placeholder="Search marketers..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Name</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden sm:table-cell">TikTok Target</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Instagram Target</th>
                <th className="text-center px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider hidden md:table-cell">Added</th>
                <th className="text-right px-6 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {search ? 'No marketers found' : 'No marketers yet. Add your first one!'}
                  </td>
                </tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
                        {m.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{m.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-text-secondary hidden sm:table-cell">{m.target_tiktok}</td>
                  <td className="px-6 py-4 text-right text-text-secondary hidden sm:table-cell">{m.target_instagram}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                      m.is_active
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-surface-border text-text-muted border-surface-border'
                    )}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {m.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-text-muted text-xs hidden md:table-cell">{formatDate(m.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleActive(m)}
                        className={cn('p-1.5 rounded-lg transition-colors', m.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-text-muted hover:text-green-400 hover:bg-green-500/10')}
                        title={m.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg text-text-muted hover:text-gold hover:bg-gold/10 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(m)} className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
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

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Marketer">
        <div className="space-y-5">
          <FormFields />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleSubmitAdd} loading={isPending}>Add Marketer</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Marketer">
        <div className="space-y-5">
          <FormFields />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSubmitEdit} loading={isPending}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Marketer" size="sm">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Are you sure you want to delete <span className="text-white font-medium">{deleteTarget?.full_name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={isPending}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
