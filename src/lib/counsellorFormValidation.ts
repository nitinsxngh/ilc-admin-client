import type { KeyboardEvent } from 'react';

export type CounsellorFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  designation: string;
  bio: string;
  experienceYears: string;
  sessionFee: string;
  sessionDuration: string;
  languages: string[];
  specializations: string[];
  status: string;
  isRecommended: boolean;
};

export type CounsellorFormErrors = Partial<Record<keyof CounsellorFormValues, string>>;

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'.-]*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
const INTEGER_PATTERN = /^\d+$/;

function cleanPhone(value: string) {
  return value.replace(/[\s-]/g, '');
}

export function sanitizeDigitsOnly(value: string, maxLength = 6) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

export function sanitizeMoneyInput(value: string) {
  return sanitizeDigitsOnly(value, 6);
}

export function clampIntegerString(value: string, min: number, max: number) {
  if (!value.trim()) return '';
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return '';
  return String(Math.min(max, Math.max(min, parsed)));
}

export function blockNonNumericKey(e: KeyboardEvent<HTMLInputElement>) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (allowed.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

export function validateCounsellorForm(
  values: CounsellorFormValues,
  options: { isEdit?: boolean } = {}
): CounsellorFormErrors {
  const errors: CounsellorFormErrors = {};
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const designation = values.designation.trim();
  const bio = values.bio.trim();
  const password = values.password.trim();

  if (!firstName) {
    errors.firstName = 'First name is required.';
  } else if (firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 characters.';
  } else if (firstName.length > 50) {
    errors.firstName = 'First name must be 50 characters or fewer.';
  } else if (!NAME_PATTERN.test(firstName)) {
    errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes.';
  }

  if (lastName) {
    if (lastName.length > 50) {
      errors.lastName = 'Last name must be 50 characters or fewer.';
    } else if (!NAME_PATTERN.test(lastName)) {
      errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes.';
    }
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!options.isEdit && password && password.length < 6) {
    errors.password = 'Password must be at least 6 characters, or leave blank to auto-generate.';
  }

  if (phone) {
    const normalized = cleanPhone(phone);
    if (!PHONE_PATTERN.test(normalized)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
  }

  if (!designation) {
    errors.designation = 'Designation is required.';
  } else if (designation.length < 2) {
    errors.designation = 'Designation must be at least 2 characters.';
  } else if (designation.length > 100) {
    errors.designation = 'Designation must be 100 characters or fewer.';
  }

  if (!values.sessionFee.trim()) {
    errors.sessionFee = 'Session price is required.';
  } else if (!INTEGER_PATTERN.test(values.sessionFee.trim())) {
    errors.sessionFee = 'Session price must be a whole number.';
  } else {
    const fee = Number.parseInt(values.sessionFee, 10);
    if (fee < 1) {
      errors.sessionFee = 'Session price must be at least ₹1.';
    } else if (fee > 100000) {
      errors.sessionFee = 'Session price must be ₹1,00,000 or less.';
    }
  }

  if (!values.sessionDuration.trim()) {
    errors.sessionDuration = 'Session duration is required.';
  } else if (!INTEGER_PATTERN.test(values.sessionDuration.trim())) {
    errors.sessionDuration = 'Session duration must be a whole number.';
  } else {
    const duration = Number.parseInt(values.sessionDuration, 10);
    if (duration < 15 || duration > 240) {
      errors.sessionDuration = 'Session duration must be between 15 and 240 minutes.';
    } else if (duration % 5 !== 0) {
      errors.sessionDuration = 'Session duration must be in 5-minute steps (e.g. 15, 30, 45).';
    }
  }

  const experienceValue = values.experienceYears.trim() || '0';
  if (!INTEGER_PATTERN.test(experienceValue)) {
    errors.experienceYears = 'Experience must be a whole number.';
  } else {
    const years = Number.parseInt(experienceValue, 10);
    if (years < 0 || years > 60) {
      errors.experienceYears = 'Experience must be between 0 and 60 years.';
    }
  }

  if (bio.length > 2000) {
    errors.bio = 'Bio must be 2000 characters or fewer.';
  }

  if (values.languages.length === 0) {
    errors.languages = 'Select at least one language.';
  }

  if (values.specializations.length === 0) {
    errors.specializations = 'Select at least one specialization.';
  }

  return errors;
}

export function hasCounsellorFormErrors(errors: CounsellorFormErrors) {
  return Object.keys(errors).length > 0;
}

export function isCounsellorFormComplete(
  values: CounsellorFormValues,
  options: { isEdit?: boolean } = {}
) {
  return !hasCounsellorFormErrors(validateCounsellorForm(values, options));
}
