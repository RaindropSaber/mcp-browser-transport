export const generateSessionId = () => {
  // Use the standard crypto API for UUID generation if available
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for environments where crypto.randomUUID is not available
  // Current timestamp as prefix (in base 36 for shorter string)
  const timePrefix = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `${timePrefix}-${randomSuffix}`;
};
