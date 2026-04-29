/**
 * Validates critical environment variables at startup.
 * Part of Issue #3: Environment Variable Schema Validation
 */

export const REQUIRED_ENV_VARS = [
  'VITE_PROXY_URL',
  'VITE_NVIDIA_API_KEY'
] as const;

export function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !import.meta.env[key] || import.meta.env[key] === ''
  );

  if (missing.length > 0) {
    console.error(
      `[Environment Error] Missing required environment variables:\n${missing.join(
        '\n'
      )}\n\nPlease check your .env.local file.`
    );
    return false;
  }

  return true;
}

export const ENV = {
  PROXY_URL: import.meta.env.VITE_PROXY_URL,
  AUTH_TOKEN: import.meta.env.VITE_NVIDIA_API_KEY,
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};
