import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Machine API — server-to-server routes under /api/machine/* called by the
// creatives machine (Python pipeline on the Hostinger VPS). Auth is a single
// shared bearer token in MACHINE_API_TOKEN; there is no user session.
//
// Error bodies are always { error: <stable code>, message: <human text>,
// field?: <offending input field> } so the caller can branch on `error`.
// ─────────────────────────────────────────────────────────────────────────────

export const MACHINE_TOKEN_ENV = 'MACHINE_API_TOKEN';

export type MachineTokenCheck = 'ok' | 'unconfigured' | 'unauthorized';

/**
 * Compares the Authorization header against the expected token in constant
 * time. Both sides are hashed first so timingSafeEqual gets equal-length
 * buffers and the token length doesn't leak either.
 */
export function checkMachineToken(
  authorization: string | null,
  expected: string | undefined
): MachineTokenCheck {
  const secret = expected?.trim();
  if (!secret) return 'unconfigured';

  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) return 'unauthorized';

  const a = createHash('sha256').update(match[1].trim()).digest();
  const b = createHash('sha256').update(secret).digest();
  return timingSafeEqual(a, b) ? 'ok' : 'unauthorized';
}

export function machineError(
  status: number,
  error: string,
  message: string,
  field?: string
): NextResponse {
  return NextResponse.json(field ? { error, message, field } : { error, message }, { status });
}

/** Returns an error response when the request isn't authorized, else null. */
export function requireMachineAuth(request: Request): NextResponse | null {
  const check = checkMachineToken(
    request.headers.get('authorization'),
    process.env[MACHINE_TOKEN_ENV]
  );
  if (check === 'ok') return null;
  if (check === 'unconfigured') {
    return machineError(503, 'not_configured', `${MACHINE_TOKEN_ENV} is not set on the server.`);
  }
  return machineError(401, 'unauthorized', 'Missing or invalid bearer token.');
}

/** Parses a JSON object body, or returns the error response to send. */
export async function readJsonObject(
  request: Request
): Promise<{ body: Record<string, unknown> } | { response: NextResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: machineError(400, 'invalid_json', 'Request body must be valid JSON.') };
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { response: machineError(400, 'invalid_json', 'Request body must be a JSON object.') };
  }
  return { body: body as Record<string, unknown> };
}
