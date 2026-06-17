export type ScheduleMode = 'single' | 'weekly' | 'monthly' | 'daily';

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const RANGE_PRESETS = [
  { id: '4w', label: '4 weeks', weeks: 4 },
  { id: '8w', label: '8 weeks', weeks: 8 },
  { id: '3m', label: '3 months', months: 3 },
  { id: '6m', label: '6 months', months: 6 },
] as const;

export function toInputDate(value: Date | string = new Date()) {
  return new Date(value).toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toInputDate(d);
}

export function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return toInputDate(d);
}

export function defaultScheduleForm() {
  const startDate = toInputDate();
  return {
    counsellorId: '',
    date: startDate,
    startDate,
    endDate: addDays(startDate, 28),
    startTime: '10:00 AM',
    endTime: '6:00 PM',
    slotDuration: '45',
    frequency: 'weekly' as ScheduleMode,
    daysOfWeek: [1, 2, 3, 4, 5],
    blockDates: '',
    blockReason: '',
  };
}

export function normalizeScheduleDate(dateInput: string) {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDatesInRange(
  startDate: string,
  endDate: string,
  frequency: ScheduleMode,
  daysOfWeek: number[] = []
) {
  const dates: Date[] = [];
  const current = normalizeScheduleDate(startDate);
  const end = normalizeScheduleDate(endDate);
  const startDay = normalizeScheduleDate(startDate).getDate();

  while (current <= end) {
    if (frequency === 'daily') {
      dates.push(new Date(current));
    } else if (frequency === 'weekly') {
      if (daysOfWeek.includes(current.getDay())) {
        dates.push(new Date(current));
      }
    } else if (frequency === 'monthly') {
      if (current.getDate() === startDay) {
        dates.push(new Date(current));
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function getSchedulePreview(
  mode: ScheduleMode,
  form: {
    date: string;
    startDate: string;
    endDate: string;
    daysOfWeek: number[];
  }
) {
  if (mode === 'single') {
    return form.date ? 'Creates availability for 1 day.' : 'Select a date.';
  }

  if (!form.startDate || !form.endDate) {
    return 'Select a start and end date.';
  }

  if (normalizeScheduleDate(form.startDate) > normalizeScheduleDate(form.endDate)) {
    return 'End date must be on or after the start date.';
  }

  if (mode === 'weekly' && form.daysOfWeek.length === 0) {
    return 'Select at least one weekday.';
  }

  const count = getDatesInRange(form.startDate, form.endDate, mode, form.daysOfWeek).length;
  if (count === 0) {
    return 'No dates match this pattern in the selected range.';
  }

  if (mode === 'weekly') {
    const days = form.daysOfWeek.map((d) => DAY_LABELS[d]).join(', ');
    return `Creates the same time slot on ${days} for ${count} day${count === 1 ? '' : 's'}.`;
  }

  if (mode === 'monthly') {
    const day = new Date(form.startDate).getDate();
    return `Creates the same time on day ${day} of each month (${count} occurrence${count === 1 ? '' : 's'}).`;
  }

  return `Creates the same time every day for ${count} day${count === 1 ? '' : 's'}.`;
}

export function isScheduleFormValid(
  mode: ScheduleMode,
  form: {
    counsellorId: string;
    date: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    slotDuration: string;
    daysOfWeek: number[];
  }
) {
  if (!form.counsellorId || !form.startTime.trim() || !form.endTime.trim()) return false;
  const duration = Number.parseInt(form.slotDuration, 10);
  if (!Number.isFinite(duration) || duration < 15) return false;

  if (mode === 'single') {
    return Boolean(form.date);
  }

  if (!form.startDate || !form.endDate) return false;
  if (normalizeScheduleDate(form.startDate) > normalizeScheduleDate(form.endDate)) return false;
  if (mode === 'weekly' && form.daysOfWeek.length === 0) return false;

  return getDatesInRange(form.startDate, form.endDate, mode, form.daysOfWeek).length > 0;
}
