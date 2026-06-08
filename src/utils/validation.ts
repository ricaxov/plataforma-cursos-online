export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  return !Number.isNaN(new Date(dateStr).getTime());
}

export function isPositiveNumber(value: unknown): boolean {
  const n = parseFloat(String(value));
  return !Number.isNaN(n) && n > 0;
}

export function isIntegerPositive(value: unknown): boolean {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
}

export function hoje(): string {
  return new Date().toISOString().split('T')[0];
}

export function gerarCodigoCertificado(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CERT-';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export function gerarTransacaoId(): string {
  return 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}
