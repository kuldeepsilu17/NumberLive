export function validateResultDate(dateStr: any): {
  isValid: boolean;
  value?: string;
  error?: string;
} {
  if (!dateStr || typeof dateStr !== 'string') {
    return { isValid: false, error: 'Result date is required (YYYY-MM-DD).' };
  }

  const trimmed = dateStr.trim();
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(trimmed)) {
    return { isValid: false, error: 'Date must be in YYYY-MM-DD format.' };
  }

  const [year, month, day] = trimmed.split('-').map(Number);
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return { isValid: false, error: 'Invalid calendar date values.' };
  }

  return { isValid: true, value: trimmed };
}

export function validateResultValue(val: any): {
  isValid: boolean;
  value?: string;
  error?: string;
} {
  if (val === undefined || val === null) {
    return { isValid: false, error: 'Result number outcome is required.' };
  }

  const str = String(val).trim();
  if (str === '') {
    return { isValid: false, error: 'Result number cannot be empty.' };
  }

  // Format single digit like '7' to '07'
  const padded = str.padStart(2, '0');
  if (!/^\d{2}$/.test(padded)) {
    return { isValid: false, error: 'Result must be a 2-digit number (00 to 99).' };
  }

  return { isValid: true, value: padded };
}

export function validateResultStatus(status: any): {
  isValid: boolean;
  value?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'CORRECTED';
  error?: string;
} {
  const allowed = ['PUBLISHED', 'DRAFT', 'ARCHIVED', 'CORRECTED'];
  if (!status || typeof status !== 'string') {
    return { isValid: true, value: 'PUBLISHED' };
  }

  const upper = status.trim().toUpperCase();
  if (!allowed.includes(upper)) {
    return {
      isValid: false,
      error: `Status must be one of: ${allowed.join(', ')}`,
    };
  }

  return { isValid: true, value: upper as any };
}

export function sanitizeText(text: any, maxLength = 500): string {
  if (!text || typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
}
