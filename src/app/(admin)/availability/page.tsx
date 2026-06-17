'use client';

import { useEffect, useState } from 'react';
import { Plus, Ban, Pencil, Trash2, Eye } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { defaultScheduleForm } from '@/lib/availabilitySchedule';
import { AddScheduleModal } from '@/components/availability/AddScheduleModal';
import type { ScheduleMode } from '@/lib/availabilitySchedule';
import type { Counsellor, Availability } from '@/types';

type ModalType = 'schedule' | 'block' | 'edit' | 'slots' | null;

function toInputDate(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function counsellorLabel(a: Availability) {
  if (typeof a.counsellorId === 'object' && a.counsellorId) {
    return `${a.counsellorId.firstName} ${a.counsellorId.lastName}`.trim();
  }
  return '—';
}

const defaultForm = defaultScheduleForm();

export default function AvailabilityPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [filterCounsellor, setFilterCounsellor] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [editing, setEditing] = useState<Availability | null>(null);
  const [viewingSlots, setViewingSlots] = useState<Availability | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const loadAvailability = () => {
    setLoading(true);
    const params: Record<string, string> = { limit: '100' };
    if (filterCounsellor) params.counsellorId = filterCounsellor;
    if (filterType) params.type = filterType;

    api.availability.list(params)
      .then((aRes) => setAvailability(aRes.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.counsellors.list({ status: 'active' })
      .then((cRes) => {
        setCounsellors(cRes.data);
        if (cRes.data.length) {
          setForm((p) => (p.counsellorId ? p : { ...p, counsellorId: cRes.data[0]._id }));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => { loadAvailability(); }, [filterCounsellor, filterType]);

  const refresh = () => {
    loadAvailability();
  };

  const counsellorOptions = counsellors.map((c) => ({
    value: c._id,
    label: `${c.firstName} ${c.lastName}`,
  }));

  const openEdit = (item: Availability) => {
    setEditing(item);
    setForm((p) => ({
      ...p,
      counsellorId: typeof item.counsellorId === 'object' ? item.counsellorId._id : String(item.counsellorId),
      date: toInputDate(item.date),
      startTime: item.startTime,
      endTime: item.endTime,
      slotDuration: String(item.slotDuration || 45),
      blockReason: item.blockReason || '',
    }));
    setModal('edit');
  };

  const handleSaveSchedule = async (mode: ScheduleMode) => {
    setSaving(true);
    try {
      if (mode === 'single') {
        await api.availability.create({
          counsellorId: form.counsellorId,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          slotDuration: parseInt(form.slotDuration, 10),
        });
      } else {
        const res = await api.availability.createRecurring({
          counsellorId: form.counsellorId,
          startDate: form.startDate,
          endDate: form.endDate,
          startTime: form.startTime,
          endTime: form.endTime,
          slotDuration: parseInt(form.slotDuration, 10),
          frequency: mode,
          daysOfWeek: mode === 'weekly' ? form.daysOfWeek : [],
        });
        alert(`Recurring schedule created for ${res.data.length} day(s).`);
      }
      setModal(null);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.type === 'blocked') {
        await api.availability.update(editing._id, { blockReason: form.blockReason });
      } else {
        await api.availability.update(editing._id, {
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          slotDuration: parseInt(form.slotDuration, 10),
        });
      }
      setModal(null);
      setEditing(null);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Availability) => {
    const label = item.type === 'blocked' ? 'remove this block' : 'delete this availability';
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;

    try {
      await api.availability.delete(item._id);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleBlock = async () => {
    setSaving(true);
    try {
      const dates = form.blockDates.split(',').map((d) => d.trim()).filter(Boolean);
      await api.availability.block({
        counsellorId: form.counsellorId,
        dates,
        reason: form.blockReason,
      });
      setModal(null);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="Availability"
        description="Set weekly or monthly schedules in one go — no need to add each day manually"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={() => setModal('schedule')}>
            <Plus className="h-4 w-4" /> Add Schedule
          </Button>
          <Button variant="outline" onClick={() => setModal('block')}>
            <Ban className="h-4 w-4" /> Block Dates
          </Button>
        </div>

        <Card>
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row">
            <div className="w-full sm:w-56">
              <Select
                value={filterCounsellor}
                onChange={(e) => setFilterCounsellor(e.target.value)}
                options={[{ value: '', label: 'All counsellors' }, ...counsellorOptions]}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: '', label: 'All types' },
                  { value: 'available', label: 'Open slots' },
                  { value: 'recurring', label: 'Recurring' },
                  { value: 'blocked', label: 'Blocked' },
                ]}
              />
            </div>
          </div>
          <CardHeader title="Schedule Overview" description="Click View slots to see booked vs open times" />
          <CardBody className="p-0">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : availability.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-slate-500">No availability found.</p>
            ) : (
              <Table>
                <THead>
                  <TH>Counsellor</TH>
                  <TH>Date</TH>
                  <TH>Time</TH>
                  <TH>Slots</TH>
                  <TH>Type</TH>
                  <TH className="text-right">Actions</TH>
                </THead>
                <TBody>
                  {availability.map((a) => {
                    const open = a.slots?.filter((s) => !s.isBooked).length ?? 0;
                    const total = a.slots?.length ?? 0;
                    const booked = total - open;
                    return (
                      <TR key={a._id}>
                        <TD className="font-medium">{counsellorLabel(a)}</TD>
                        <TD>{formatDate(a.date)}</TD>
                        <TD>{a.type === 'blocked' ? 'All day' : `${a.startTime} – ${a.endTime}`}</TD>
                        <TD>
                          {a.type === 'blocked' ? (
                            <span className="text-sm text-slate-500">{a.blockReason || 'Blocked'}</span>
                          ) : (
                            <span className="text-sm">{open} open{booked > 0 ? ` · ${booked} booked` : ''} / {total}</span>
                          )}
                        </TD>
                        <TD><Badge variant={a.type === 'blocked' ? 'cancelled' : 'active'}>{a.type}</Badge></TD>
                        <TD className="text-right">
                          <div className="flex justify-end gap-1">
                            {a.type !== 'blocked' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setViewingSlots(a); setModal('slots'); }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(a)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      <AddScheduleModal
        open={modal === 'schedule'}
        onClose={() => setModal(null)}
        form={form}
        setForm={setForm}
        counsellorOptions={counsellorOptions}
        saving={saving}
        onSubmit={handleSaveSchedule}
      />

      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setEditing(null); }} title="Edit Availability">
        {editing && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {counsellorLabel(editing)} · {formatDate(editing.date)}
            </p>
            {editing.type === 'blocked' ? (
              <Input label="Block reason" value={form.blockReason} onChange={(e) => setForm((p) => ({ ...p, blockReason: e.target.value }))} />
            ) : (
              <>
                <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
                  <Input label="End Time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
                </div>
                <Input label="Slot Duration (mins)" type="number" value={form.slotDuration} onChange={(e) => setForm((p) => ({ ...p, slotDuration: e.target.value }))} />
                <p className="text-xs text-amber-700">Booked slots must remain in the new time range or update will be rejected.</p>
              </>
            )}
            <Button onClick={handleUpdate} loading={saving} className="w-full">Save Changes</Button>
          </div>
        )}
      </Modal>

      <Modal open={modal === 'slots'} onClose={() => { setModal(null); setViewingSlots(null); }} title="Time Slots" size="lg">
        {viewingSlots && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {counsellorLabel(viewingSlots)} · {formatDate(viewingSlots.date)} · {viewingSlots.startTime} – {viewingSlots.endTime}
            </p>
            <Table>
              <THead>
                <TH>Time</TH>
                <TH>Status</TH>
              </THead>
              <TBody>
                {(viewingSlots.slots || []).map((slot) => (
                  <TR key={slot._id}>
                    <TD>{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</TD>
                    <TD>
                      <Badge variant={slot.isBooked ? 'confirmed' : 'active'}>
                        {slot.isBooked ? 'Booked' : 'Open'}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </Modal>

      <Modal open={modal === 'block'} onClose={() => setModal(null)} title="Block Dates">
        <div className="space-y-4">
          <Select label="Counsellor" value={form.counsellorId} onChange={(e) => setForm((p) => ({ ...p, counsellorId: e.target.value }))} options={[{ value: '', label: 'Select...' }, ...counsellorOptions]} />
          <Input label="Dates (comma-separated YYYY-MM-DD)" value={form.blockDates} onChange={(e) => setForm((p) => ({ ...p, blockDates: e.target.value }))} placeholder="2026-06-15, 2026-06-16" />
          <Input label="Reason" value={form.blockReason} onChange={(e) => setForm((p) => ({ ...p, blockReason: e.target.value }))} placeholder="Vacation, Holiday, etc." />
          <Button onClick={handleBlock} loading={saving} className="w-full" variant="danger">Block Dates</Button>
        </div>
      </Modal>
    </>
  );
}
