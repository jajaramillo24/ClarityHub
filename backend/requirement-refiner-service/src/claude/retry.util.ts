import { Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

const logger = new Logger('ClaudeRetry');

export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
}

const isRetryable = (error: unknown): boolean => {
  if (error instanceof Anthropic.RateLimitError) return true;
  if (error instanceof Anthropic.APIConnectionError) return true;
  if (error instanceof Anthropic.InternalServerError) return true;
  if (error instanceof Anthropic.APIError) return (error.status ?? 0) >= 500;
  return false;
};

/**
 * Retries transient Claude API failures (rate limits, 5xx, connection drops)
 * with exponential backoff. Non-retryable errors (bad request, auth, not
 * found) fail fast — this is the boundary that keeps a flaky AI provider
 * from cascading into the rest of the distributed system.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 3, baseDelayMs = 1000 }: RetryOptions = {},
): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > retries || !isRetryable(error)) {
        throw error;
      }
      const delay = baseDelayMs * 2 ** (attempt - 1);
      logger.warn(
        `Claude API call failed (attempt ${attempt}/${retries}), retrying in ${delay}ms: ${
          (error as Error).message
        }`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
