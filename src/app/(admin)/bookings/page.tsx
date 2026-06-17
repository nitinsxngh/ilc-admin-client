'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { api, type TimeSlotPublic } from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import type { Booking } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'no_show', label: 'No Show' },
];

type SlotOption = TimeSlotPublic & { date: string; label: string };

function BookingsContent() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);
  const [rescheduleSlots, setRescheduleSlots] = useState<SlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = { limit: '50' };
    if (statusFilter) params.status = statusFilter;
    api.bookings
      .list(params)
      .then((res) => setBookings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const loadRescheduleSlots = async (booking: Booking) => {
    const counsellorId = typeof booking.counsellorId === 'object'
      ? booking.counsellorId._id
      : booking.counsellorId;

    setLoadingSlots(true);
    setSelectedSlot('');
    try {
      const res = await api.availability.slots(counsellorId);
      const options: SlotOption[] = [];
      for (const [date, slots] of Object.entries(res.data || {})) {
        for (const slot of slots) {
          options.push({
            ...slot,
            date,
            label: `${formatDate(date)} · ${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`,
          });
        }
      }
      setRescheduleSlots(options);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load slots');
      setRescheduleSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const openManage = (booking: Booking) => {
    setSelected(booking);
    setRescheduleSlots([]);
    setSelectedSlot('');
    if (!['cancelled', 'completed'].includes(booking.status)) {
      loadRescheduleSlots(booking);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    setUpdating(true);
    try {
      await api.bookings.updateStatus(selected._id, { status });
      setSelected(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleReschedule = async () => {
    if (!selected || !selectedSlot) return;
    const slot = rescheduleSlots.find((s) => `${s.availabilityId}:${s.slotId}` === selectedSlot);
    if (!slot) return;

    setUpdating(true);
    try {
      await api.bookings.reschedule(selected._id, {
        availabilityId: slot.availabilityId,
        slotId: slot.slotId,
      });
      setSelected(null);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reschedule');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Header title="Bookings" description="View, reschedule, cancel, and complete counselling bookings" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>
          <CardBody className="p-0">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-slate-500">No bookings found.</p>
            ) : (
              <Table>
                <THead>
                  <TH>Student</TH>
                  <TH>Counsellor</TH>
                  <TH>Date</TH>
                  <TH>Time</TH>
                  <TH>Fee</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </THead>
                <TBody>
                  {bookings.map((b) => (
                    <TR key={b._id}>
                      <TD>
                        <p className="font-medium text-slate-900">{b.studentName}</p>
                        <p className="text-xs text-slate-500">{b.studentEmail || '—'}</p>
                      </TD>
                      <TD>
                        {typeof b.counsellorId === 'object'
                          ? `${b.counsellorId.firstName} ${b.counsellorId.lastName}`
                          : '—'}
                      </TD>
                      <TD>{formatDate(b.bookingDate)}</TD>
                      <TD>{formatTime(b.startTime)}</TD>
                      <TD>{formatCurrency(b.sessionFee)}</TD>
                      <TD><Badge variant={b.status}>{b.status.replace('_', ' ')}</Badge></TD>
                      <TD className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openManage(b)}>
                          Manage
                        </Button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Manage Booking" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p><strong>Student:</strong> {selected.studentName}</p>
              <p><strong>Date:</strong> {formatDate(selected.bookingDate)} at {formatTime(selected.startTime)}</p>
              <p><strong>Fee:</strong> {formatCurrency(selected.sessionFee)}</p>
              <p><strong>Status:</strong> <Badge variant={selected.status}>{selected.status}</Badge></p>
            </div>

            {!['cancelled', 'completed'].includes(selected.status) && (
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-900">Reschedule to new slot</p>
                {loadingSlots ? (
                  <p className="text-sm text-slate-500">Loading available slots...</p>
                ) : rescheduleSlots.length === 0 ? (
                  <p className="text-sm text-slate-500">No open slots for this counsellor.</p>
                ) : (
                  <>
                    <Select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      options={[
                        { value: '', label: 'Select a new slot...' },
                        ...rescheduleSlots.map((s) => ({
                          value: `${s.availabilityId}:${s.slotId}`,
                          label: s.label,
                        })),
                      ]}
                    />
                    <Button
                      onClick={handleReschedule}
                      loading={updating}
                      disabled={!selectedSlot}
                      className="w-full"
                    >
                      Reschedule booking
                    </Button>
                  </>
                )}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-slate-900">Update status</p>
              <div className="flex flex-wrap gap-2">
                {['confirmed', 'completed', 'cancelled', 'no_show'].map((s) => (
                  <Button
                    key={s}
                    variant={s === 'cancelled' ? 'danger' : 'outline'}
                    size="sm"
                    loading={updating}
                    onClick={() => updateStatus(s)}
                    disabled={selected.status === s}
                  >
                    Mark {s.replace('_', ' ')}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Cancelling frees the original time slot.</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}
