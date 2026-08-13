export function envConfigured(val: string | undefined): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith('your-') || trimmed.startsWith('set-in-') || trimmed.includes('...')) return false;
  return true;
}
