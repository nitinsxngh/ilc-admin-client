'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import {
  DAY_LABELS,
  RANGE_PRESETS,
  addDays,
  addMonths,
  defaultScheduleForm,
  getSchedulePreview,
  isScheduleFormValid,
  toInputDate,
  type ScheduleMode,
} from '@/lib/availabilitySchedule';

export type ScheduleFormState = ReturnType<typeof defaultScheduleForm>;

interface AddScheduleModalProps {
  open: boolean;
  onClose: () => void;
  form: ScheduleFormState;
  setForm: React.Dispatch<React.SetStateAction<ScheduleFormState>>;
  counsellorOptions: { value: string; label: string }[];
  saving: boolean;
  onSubmit: (mode: ScheduleMode) => void;
}

const MODE_OPTIONS: { id: ScheduleMode; label: string; hint: string }[] = [
  { id: 'weekly', label: 'Every week', hint: 'Same days each week (e.g. Mon–Fri)' },
  { id: 'monthly', label: 'Every month', hint: 'Same date each month (e.g. 15th)' },
  { id: 'daily', label: 'Every day', hint: 'Same time daily in the range' },
  { id: 'single', label: 'Single day', hint: 'One-off availability' },
];

export function AddScheduleModal({
  open,
  onClose,
  form,
  setForm,
  counsellorOptions,
  saving,
  onSubmit,
}: AddScheduleModalProps) {
  const mode = form.frequency as ScheduleMode;
  const preview = getSchedulePreview(mode, form);
  const canSubmit = isScheduleFormValid(mode, form);

  const applyPreset = (preset: (typeof RANGE_PRESETS)[number]) => {
    const startDate = form.startDate || toInputDate();
    setForm((prev) => ({
      ...prev,
      startDate,
      endDate: 'weeks' in preset ? addDays(startDate, preset.weeks * 7) : addMonths(startDate, preset.months),
    }));
  };

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Schedule" size="lg">
      <div className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, frequency: option.id }))}
              className={cn(
                'rounded-xl border p-3 text-left transition-colors',
                mode === option.id
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <p className="text-sm font-semibold text-slate-900">{option.label}</p>
              <p className="mt-1 text-xs text-slate-500">{option.hint}</p>
            </button>
          ))}
        </div>

        <Select
          label="Counsellor"
          value={form.counsellorId}
          onChange={(e) => setForm((prev) => ({ ...prev, counsellorId: e.target.value }))}
          options={[{ value: '', label: 'Select counsellor...' }, ...counsellorOptions]}
        />

        {mode === 'single' ? (
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                label="End date"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Quick range</label>
              <div className="flex flex-wrap gap-2">
                {RANGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'weekly' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Repeat on</label>
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm',
                        form.daysOfWeek.includes(index)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start time"
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
            placeholder="10:00 AM"
          />
          <Input
            label="End time"
            value={form.endTime}
            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
            placeholder="6:00 PM"
          />
        </div>

        <Input
          label="Slot duration (mins)"
          type="number"
          min={15}
          step={5}
          value={form.slotDuration}
          onChange={(e) => setForm((prev) => ({ ...prev, slotDuration: e.target.value }))}
        />

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">{preview}</div>

        <Button
          onClick={() => onSubmit(mode)}
          loading={saving}
          disabled={!canSubmit}
          className="w-full"
        >
          {mode === 'single' ? 'Create availability' : 'Create recurring schedule'}
        </Button>
      </div>
    </Modal>
  );
}
