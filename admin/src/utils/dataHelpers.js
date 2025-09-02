
export function toISODate(date) {
  if (!date) return '';
  if (typeof date === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
    // Convert DD-MM-YYYY to YYYY-MM-DD
    const [dd, mm, yyyy] = date.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
  // If already ISO or Date object
  const d = new Date(date);
  if (!isNaN(d)) {
    return d.toISOString().split('T')[0];
  }
  return date;
}

export function formatISOToDDMMYYYY(isoDate) {
  if (!isoDate) return '';
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj)) return isoDate;
  return `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth()+1).padStart(2, '0')}-${dateObj.getFullYear()}`;
}

export function formatName(name) {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim()
    .replace(/\./g, '') // ✅ remove all dots
    .split(/\s+/)        // split by any whitespace
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
}

export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}