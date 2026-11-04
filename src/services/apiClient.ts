/**
 * Resilient API Client & Safe JSON Handling
 * 
 * Prevents "Unexpected token 'T', 'The page c'... is not valid JSON" errors
 * by verifying Content-Type headers, inspecting response bodies, and gracefully
 * handling server HTML error pages (404/500/502/SPA redirects) without crashing.
 */

export interface SafeApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
  isHtmlFallback?: boolean;
}

/**
 * Safely parse a fetch Response as JSON.
 * If the response is HTML, plain text, or corrupted, it never throws a syntax error.
 */
export async function safeResponseJson<T = any>(
  res: Response,
  fallback: T | null = null
): Promise<SafeApiResponse<T>> {
  const status = res.status;
  const contentType = res.headers.get('content-type') || '';

  try {
    const rawText = await res.text();
    const trimmed = rawText.trim();

    // Check if body is HTML (e.g. <!DOCTYPE html> or "The page cannot be found...")
    const isHtmlOrText =
      trimmed.startsWith('<!') ||
      trimmed.startsWith('<html') ||
      trimmed.startsWith('The page') ||
      trimmed.includes('Cannot GET') ||
      trimmed.includes('Cannot POST') ||
      trimmed.includes('NOT_FOUND');

    if (!contentType.includes('application/json') && isHtmlOrText) {
      return {
        ok: false,
        status,
        data: fallback,
        error: `Service endpoint unavailable (${status}).`,
        isHtmlFallback: true
      };
    }

    // Try parsing as JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return {
          ok: res.ok,
          status,
          data: parsed as T,
          error: res.ok ? undefined : parsed?.error || parsed?.message || `Request failed (${status})`,
          isHtmlFallback: false
        };
      } catch (jsonErr) {
        // Fall through to text handling
      }
    }

    // Response was not valid JSON
    return {
      ok: res.ok,
      status,
      data: fallback,
      error: res.ok ? undefined : (trimmed.length < 120 ? trimmed : `HTTP Error ${status}`),
      isHtmlFallback: !contentType.includes('application/json')
    };
  } catch (readErr: any) {
    return {
      ok: false,
      status,
      data: fallback,
      error: readErr?.message || 'Failed to read response from server.',
      isHtmlFallback: true
    };
  }
}

/**
 * Universal safe fetch wrapper that guarantees:
 * 1. Never throws "Unexpected token 'T', 'The page c'..."
 * 2. Transparently handles server restarts, 404s, HTML redirects, and offline conditions
 * 3. Returns typed data and structured error messaging
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallback: T | null = null
): Promise<SafeApiResponse<T>> {
  try {
    const res = await fetch(input, init);
    return await safeResponseJson<T>(res, fallback);
  } catch (networkErr: any) {
    const isOffline =
      typeof navigator !== 'undefined' && !navigator.onLine;

    return {
      ok: false,
      status: 0,
      data: fallback,
      error: isOffline
        ? 'You appear to be offline. Please check your internet connection.'
        : networkErr?.message || 'Network connection failed.',
      isHtmlFallback: true
    };
  }
}
