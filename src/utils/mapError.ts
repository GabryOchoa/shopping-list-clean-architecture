const ERROR_MAP: Record<string, string> = {
  'Failed to fetch':
    'Unable to connect. Please check your internet connection.',
  NetworkError: 'Network error. Please check your internet connection.',
  'Request timeout': 'The request took too long. Please try again.',
  ECONNREFUSED: 'Unable to connect to the server. Please try again later.',
};

const SUPABASE_ERROR_MAP: Record<string, string> = {
  '23505': 'This item already exists. Please use a different name.',
  '42501': 'You do not have permission to perform this action.',
  PGRST116: 'The requested data was not found.',
  '23503': 'This item is still in use and cannot be removed.',
};

export function mapError(error: unknown): string {
  if (error == null) return 'An unexpected error occurred.';

  const rawMessage = error instanceof Error ? error.message : String(error);

  for (const [key, message] of Object.entries(ERROR_MAP)) {
    if (rawMessage.includes(key)) return message;
  }

  const code = (error as any)?.code;
  if (code && SUPABASE_ERROR_MAP[code]) return SUPABASE_ERROR_MAP[code];

  if (rawMessage.includes('User not authenticated'))
    return 'Your session has expired. Please sign in again.';

  if (rawMessage.includes('No account found'))
    return 'No account found with that email address.';

  if (rawMessage.includes('already a member'))
    return 'This user is already a member of the list.';

  if (rawMessage.includes('not authenticated'))
    return 'Your session has expired. Please sign in again.';

  if (rawMessage.includes('does not exist'))
    return 'This item no longer exists.';

  return 'Something went wrong. Please try again.';
}
