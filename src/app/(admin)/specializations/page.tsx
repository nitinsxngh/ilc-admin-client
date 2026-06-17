'use client';

import { useEffect, useState } from 'react';
import { Plus, Archive, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import type { Specialization } from '@/types';

export default function SpecializationsPage() {
  const [items, setItems] = useState<Specialization[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = () => {
    api.specializations.list(true).then((res) => setItems(res.data)).catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.specializations.create(name.trim());
      setName('');
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (item: Specialization) => {
    if (!confirm(`Deactivate "${item.name}"? It will be hidden from new counsellor assignments.`)) return;
    setActingId(item._id);
    try {
      await api.specializations.softDelete(item._id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActingId(null);
    }
  };

  const handlePermanentDelete = async (item: Specialization) => {
    if (
      !confirm(
        `Permanently delete "${item.name}"? This cannot be undone and removes it from the database.`
      )
    ) {
      return;
    }
    setActingId(item._id);
    try {
      await api.specializations.permanentDelete(item._id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActingId(null);
    }
  };

  const activeCount = items.filter((item) => item.status === 'active').length;

  return (
    <>
      <Header title="Specializations" description="Manage counsellor specialization tags" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Add Specialization" />
            <CardBody>
              <form onSubmit={handleCreate} className="flex gap-3">
                <Input
                  className="flex-1"
                  placeholder="e.g. Stream selection (8-12)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button type="submit" loading={loading}><Plus className="h-4 w-4" /> Add</Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="All Specializations"
              description={`${activeCount} active · ${items.length} total`}
            />
            <CardBody>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500">No specializations yet.</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-medium text-slate-900">{item.name}</span>
                        <Badge variant={item.status}>{item.status}</Badge>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {item.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={actingId === item._id}
                            onClick={() => handleSoftDelete(item)}
                            title="Soft delete (deactivate)"
                          >
                            <Archive className="h-4 w-4" />
                            Deactivate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          loading={actingId === item._id}
                          onClick={() => handlePermanentDelete(item)}
                          title="Permanently delete"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
