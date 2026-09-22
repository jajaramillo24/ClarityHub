/**
 * Allowed browser origins for this service's CORS policy, from CORS_ORIGIN
 * (comma-separated). Defaults to the local Vite dev server — set
 * CORS_ORIGIN explicitly wherever this is deployed (see DEPLOY.md).
 */
export function corsOrigins(): string[] {
  return (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
