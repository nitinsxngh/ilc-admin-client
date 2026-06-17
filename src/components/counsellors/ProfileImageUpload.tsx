'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface ProfileImageUploadProps {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  uploading?: boolean;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export function ProfileImageUpload({
  firstName = '',
  lastName = '',
  imageUrl,
  uploading,
  onFileSelect,
  onRemove,
  disabled,
}: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = (file: File | null) => {
    if (!file) return;
    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Use JPEG, PNG, or WebP.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be 5 MB or smaller.');
      return;
    }

    onFileSelect(file);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">Profile Photo</label>
      <div className="flex items-center gap-4">
        <div className="relative">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`${firstName} ${lastName}`.trim() || 'Counsellor'}
              className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-bold text-white">
              {getInitials(firstName, lastName)}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => {
              handleFile(e.target.files?.[0] || null);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50',
              (disabled || uploading) && 'cursor-not-allowed opacity-60'
            )}
          >
            <Camera className="h-4 w-4" />
            {imageUrl ? 'Change photo' : 'Upload photo'}
          </button>
          {imageUrl && onRemove && !uploading && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"
            >
              <X className="h-3 w-3" />
              Remove photo
            </button>
          )}
          <p className="text-xs text-slate-400">JPEG, PNG, or WebP · max 5 MB</p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
