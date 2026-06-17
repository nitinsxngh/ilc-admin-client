'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProfileImageUpload } from '@/components/counsellors/ProfileImageUpload';
import { api } from '@/lib/api';
import {
  blockNonNumericKey,
  clampIntegerString,
  hasCounsellorFormErrors,
  isCounsellorFormComplete,
  sanitizeDigitsOnly,
  sanitizeMoneyInput,
  validateCounsellorForm,
  type CounsellorFormErrors,
} from '@/lib/counsellorFormValidation';
import type { Counsellor, Specialization } from '@/types';

interface CounsellorFormProps {
  initial?: Partial<Counsellor>;
  onSubmit: (data: Record<string, unknown>) => Promise<unknown>;
  onAfterSubmit?: (result: unknown) => void;
  loading?: boolean;
  submitLabel?: string;
}

const LANGUAGES = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Kannada'];
const BIO_MAX_LENGTH = 2000;

export function CounsellorForm({
  initial,
  onSubmit,
  onAfterSubmit,
  loading,
  submitLabel = 'Save Counsellor',
}: CounsellorFormProps) {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState(initial?.profileImageUrl || '');
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<CounsellorFormErrors>({});
  const [form, setForm] = useState({
    firstName: initial?.firstName || '',
    lastName: initial?.lastName || '',
    email: initial?.email || '',
    password: '',
    phone: initial?.phone || '',
    designation: initial?.designation || 'Career Counsellor',
    bio: initial?.bio || '',
    experienceYears: initial?.experienceYears?.toString() || '0',
    sessionFee: initial?.sessionFee?.toString() || '',
    sessionDuration: initial?.sessionDuration?.toString() || '45',
    languages: initial?.languages || [],
    specializations: initial?.specializations?.map((s) => (typeof s === 'object' ? s._id : s)) || [],
    status: initial?.status || 'active',
    isRecommended: initial?.isRecommended || false,
  });

  useEffect(() => {
    api.specializations.list().then((res) => setSpecializations(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  const canSubmit = useMemo(
    () => isCounsellorFormComplete(form, { isEdit: !!initial?._id }),
    [form, initial?._id]
  );

  const clampField = (field: 'sessionFee' | 'sessionDuration' | 'experienceYears') => {
    setForm((prev) => {
      if (field === 'sessionFee') {
        return { ...prev, sessionFee: prev.sessionFee ? clampIntegerString(prev.sessionFee, 1, 100000) : '' };
      }
      if (field === 'sessionDuration') {
        if (!prev.sessionDuration) return prev;
        let value = clampIntegerString(prev.sessionDuration, 15, 240);
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) {
          value = String(Math.round(parsed / 5) * 5);
          value = clampIntegerString(value, 15, 240);
        }
        return { ...prev, sessionDuration: value };
      }
      return {
        ...prev,
        experienceYears: clampIntegerString(prev.experienceYears || '0', 0, 60) || '0',
      };
    });
  };

  const update = (key: keyof typeof form, value: unknown) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleLanguage = (lang: string) => {
    setForm((p) => ({
      ...p,
      languages: p.languages.includes(lang)
        ? p.languages.filter((l) => l !== lang)
        : [...p.languages, lang],
    }));
    setErrors((prev) => {
      if (!prev.languages) return prev;
      const next = { ...prev };
      delete next.languages;
      return next;
    });
  };

  const toggleSpec = (id: string) => {
    setForm((p) => ({
      ...p,
      specializations: p.specializations.includes(id)
        ? p.specializations.filter((s) => s !== id)
        : [...p.specializations, id],
    }));
    setErrors((prev) => {
      if (!prev.specializations) return prev;
      const next = { ...prev };
      delete next.specializations;
      return next;
    });
  };

  const handleImageSelect = async (file: File) => {
    if (initial?._id) {
      setImageUploading(true);
      try {
        const res = await api.counsellors.uploadProfileImage(initial._id, file);
        setProfileImageUrl(res.data.profileImageUrl || '');
        setPendingImage(null);
        if (pendingPreview) URL.revokeObjectURL(pendingPreview);
        setPendingPreview('');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to upload profile image');
      } finally {
        setImageUploading(false);
      }
      return;
    }

    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingImage(file);
    setPendingPreview(URL.createObjectURL(file));
  };

  const handleImageRemove = async () => {
    if (initial?._id && profileImageUrl) {
      setImageUploading(true);
      try {
        await api.counsellors.update(initial._id, { profileImage: '' });
        setProfileImageUrl('');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to remove profile image');
      } finally {
        setImageUploading(false);
      }
      return;
    }

    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingImage(null);
    setPendingPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCounsellorForm(form, { isEdit: !!initial?._id });
    if (hasCounsellorFormErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    const result = await onSubmit({
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim().replace(/[\s-]/g, ''),
      designation: form.designation.trim(),
      bio: form.bio.trim(),
      experienceYears: parseInt(form.experienceYears, 10) || 0,
      sessionFee: parseFloat(form.sessionFee),
      sessionDuration: parseInt(form.sessionDuration, 10),
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
    });

    const created = result as { counsellor?: Counsellor } | Counsellor | undefined;
    const createdId =
      created && 'counsellor' in created
        ? created.counsellor?._id
        : (created as Counsellor | undefined)?._id;
    const counsellorId = initial?._id || createdId;
    if (pendingImage && counsellorId) {
      setImageUploading(true);
      try {
        await api.counsellors.uploadProfileImage(counsellorId, pendingImage);
        if (pendingPreview) URL.revokeObjectURL(pendingPreview);
        setPendingImage(null);
        setPendingPreview('');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Counsellor saved, but profile image upload failed');
      } finally {
        setImageUploading(false);
      }
    }

    onAfterSubmit?.(result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileImageUpload
        firstName={form.firstName}
        lastName={form.lastName}
        imageUrl={pendingPreview || profileImageUrl}
        uploading={imageUploading}
        onFileSelect={handleImageSelect}
        onRemove={pendingPreview || profileImageUrl ? handleImageRemove : undefined}
        disabled={loading}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="firstName"
          label="First Name *"
          value={form.firstName}
          onChange={(e) => update('firstName', e.target.value)}
          error={errors.firstName}
          maxLength={50}
        />
        <Input
          id="lastName"
          label="Last Name"
          value={form.lastName}
          onChange={(e) => update('lastName', e.target.value)}
          error={errors.lastName}
          maxLength={50}
        />
        <Input
          id="email"
          label="Email *"
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          disabled={!!initial?._id}
        />
        {!initial?._id && (
          <Input
            id="password"
            label="Password (leave blank to auto-generate)"
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
            minLength={6}
          />
        )}
        <Input
          id="phone"
          label="Mobile Number"
          type="tel"
          placeholder="10-digit mobile number"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          error={errors.phone}
          maxLength={14}
        />
        <Input
          id="designation"
          label="Designation *"
          value={form.designation}
          onChange={(e) => update('designation', e.target.value)}
          error={errors.designation}
          maxLength={100}
        />
        <Input
          id="sessionFee"
          label="Session Price (₹) *"
          type="text"
          inputMode="numeric"
          placeholder="e.g. 1500"
          value={form.sessionFee}
          onChange={(e) => update('sessionFee', sanitizeMoneyInput(e.target.value))}
          onKeyDown={blockNonNumericKey}
          onBlur={() => clampField('sessionFee')}
          error={errors.sessionFee}
        />
        <Input
          id="sessionDuration"
          label="Session Duration (mins) *"
          type="text"
          inputMode="numeric"
          placeholder="15–240, in steps of 5"
          value={form.sessionDuration}
          onChange={(e) => update('sessionDuration', sanitizeDigitsOnly(e.target.value, 3))}
          onKeyDown={blockNonNumericKey}
          onBlur={() => clampField('sessionDuration')}
          error={errors.sessionDuration}
        />
        <Input
          id="experienceYears"
          label="Experience (years)"
          type="text"
          inputMode="numeric"
          placeholder="0–60"
          value={form.experienceYears}
          onChange={(e) => update('experienceYears', sanitizeDigitsOnly(e.target.value, 2))}
          onKeyDown={blockNonNumericKey}
          onBlur={() => clampField('experienceYears')}
          error={errors.experienceYears}
        />
        <Select
          id="status"
          label="Status"
          value={form.status}
          onChange={(e) => update('status', e.target.value)}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </div>

      <Textarea
        id="bio"
        label="Bio"
        rows={4}
        placeholder={`Write a short profile (max ${BIO_MAX_LENGTH} characters)`}
        value={form.bio}
        onChange={(e) => update('bio', e.target.value.slice(0, BIO_MAX_LENGTH))}
        error={errors.bio}
        maxLength={BIO_MAX_LENGTH}
        showCharCount
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Languages *</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                form.languages.includes(lang)
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        {errors.languages && <p className="mt-2 text-xs text-red-600">{errors.languages}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Specializations *</label>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => (
            <button
              key={spec._id}
              type="button"
              onClick={() => toggleSpec(spec._id)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                form.specializations.includes(spec._id)
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {spec.name}
            </button>
          ))}
        </div>
        {errors.specializations && <p className="mt-2 text-xs text-red-600">{errors.specializations}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.isRecommended}
          onChange={(e) => update('isRecommended', e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Mark as recommended counsellor
      </label>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
        <Button type="submit" loading={loading || imageUploading} disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
