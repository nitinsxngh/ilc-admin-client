'use client';

import { useState } from 'react';
import { cn, formatCurrency, formatTime } from '@/lib/utils';
import { CounsellorAvatar } from '@/components/counsellors/CounsellorAvatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, type TimeSlotPublic } from '@/lib/api';
import type { Counsellor } from '@/types';

interface CounsellorDetailProps {
  counsellor: Counsellor;
  availability: Record<string, TimeSlotPublic[]>;
  onBooked: () => void;
}

export function CounsellorDetail({ counsellor, availability, onBooked }: CounsellorDetailProps) {
  const dates = Object.keys(availability).sort();
  const [selectedDate, setSelectedDate] = useState(dates[0] || '');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotPublic | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const slots = selectedDate ? availability[selectedDate] || [] : [];

  const formatDateChip = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handleBook = async () => {
    if (!selectedSlot || !studentName.trim()) return;
    setLoading(true);
    try {
      await api.bookings.create({
        counsellorId: counsellor._id,
        availabilityId: selectedSlot.availabilityId,
        slotId: selectedSlot.slotId,
        studentName: studentName.trim(),
        studentEmail,
      });
      setSuccess(true);
      onBooked();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</div>
        <h3 className="mt-4 text-xl font-bold text-slate-900">Booking Confirmed!</h3>
        <p className="mt-2 text-slate-600">Your session with {counsellor.firstName} has been confirmed.</p>
        <p className="mt-1 text-sm text-slate-500">Online video session · Link shared after confirmation</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex gap-4">
        <CounsellorAvatar
          firstName={counsellor.firstName}
          lastName={counsellor.lastName}
          imageUrl={counsellor.profileImageUrl}
          className="h-16 w-16"
          textClassName="text-xl"
        />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {counsellor.firstName} {counsellor.lastName}
          </h2>
          <p className="text-slate-500">{counsellor.designation}</p>
        </div>
      </div>

      {counsellor.bio && (
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{counsellor.bio}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Session fee</p>
          <p className="mt-1 font-semibold text-slate-900">{formatCurrency(counsellor.sessionFee)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Duration</p>
          <p className="mt-1 font-semibold text-slate-900">{counsellor.sessionDuration} minutes</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Experience</p>
          <p className="mt-1 font-semibold text-slate-900">{counsellor.experienceYears}+ years</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Languages</p>
          <p className="mt-1 font-semibold text-slate-900">{counsellor.languages?.join(', ')}</p>
        </div>
      </div>

      {counsellor.specializations?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">Specialisation</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {counsellor.specializations.map((s) => (
              <span key={s._id} className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600">
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-900">Choose a date</h3>
        {dates.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No available dates at the moment.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {dates.slice(0, 7).map((date) => (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  selectedDate === date
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                {formatDateChip(date)}
              </button>
            ))}
          </div>
        )}
      </div>

      {slots.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900">Available time</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot.slotId}
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                  selectedSlot?.slotId === slot.slotId
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                {formatTime(slot.startTime)}
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm ? (
        <div className="mt-6 space-y-3 rounded-xl border border-slate-200 p-4">
          <Input label="Your Name *" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          <Input label="Email" type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
          <Button onClick={handleBook} loading={loading} className="w-full" disabled={!studentName.trim()}>
            Confirm booking — {formatCurrency(counsellor.sessionFee)}
          </Button>
        </div>
      ) : (
        <div className="mt-8">
          <Button
            className="w-full"
            size="lg"
            disabled={!selectedSlot}
            onClick={() => setShowForm(true)}
          >
            Confirm booking — {formatCurrency(counsellor.sessionFee)}
          </Button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Online video session · Link shared after confirmation
          </p>
        </div>
      )}
    </div>
  );
}
