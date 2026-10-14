import { describe, expect, it } from 'vitest';
import { checkMachineToken } from '../machine-api';
import {
  deriveFileName,
  parseMachineCreativeInput,
  resolveMimeType,
} from '../machine-creatives';

describe('checkMachineToken', () => {
  it('reports an unset token as unconfigured', () => {
    expect(checkMachineToken('Bearer abc', undefined)).toBe('unconfigured');
    expect(checkMachineToken('Bearer abc', '  ')).toBe('unconfigured');
  });

  it('accepts the exact bearer token, case-insensitive scheme', () => {
    expect(checkMachineToken('Bearer s3cret', 's3cret')).toBe('ok');
    expect(checkMachineToken('bearer s3cret', 's3cret')).toBe('ok');
  });

  it('rejects a missing, malformed or wrong token', () => {
    expect(checkMachineToken(null, 's3cret')).toBe('unauthorized');
    expect(checkMachineToken('s3cret', 's3cret')).toBe('unauthorized');
    expect(checkMachineToken('Basic s3cret', 's3cret')).toBe('unauthorized');
    expect(checkMachineToken('Bearer s3cre', 's3cret')).toBe('unauthorized');
  });
});

const valid = {
  sourceUrl: 'https://aprovar.example.com/files/post-42.mp4',
  title:     'Recruit creators — Tue',
  captions:  { en: 'Join the Dips affiliate program', pt: 'Entre no programa' },
};

describe('parseMachineCreativeInput', () => {
  it('parses a minimal valid body with defaults', () => {
    const r = parseMachineCreativeInput(valid);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.sourceUrl.href).toBe(valid.sourceUrl);
    expect(r.value.captions).toEqual({ en: valid.captions.en, es: null, pt: 'Entre no programa' });
    expect(r.value.active).toBe(true);
    expect(r.value.externalId).toBeNull();
  });

  it('requires https unless allowHttp', () => {
    const body = { ...valid, sourceUrl: 'http://localhost:8000/a.mp4' };
    expect(parseMachineCreativeInput(body)).toMatchObject({ ok: false, field: 'sourceUrl' });
    expect(parseMachineCreativeInput(body, { allowHttp: true }).ok).toBe(true);
  });

  it('requires a title and an English caption', () => {
    expect(parseMachineCreativeInput({ ...valid, title: ' ' })).toMatchObject({ ok: false, field: 'title' });
    expect(parseMachineCreativeInput({ ...valid, captions: { pt: 'x' } }))
      .toMatchObject({ ok: false, field: 'captions.en' });
    expect(parseMachineCreativeInput({ ...valid, captions: 'x' })).toMatchObject({ ok: false, field: 'captions' });
  });

  it('validates externalId and active', () => {
    expect(parseMachineCreativeInput({ ...valid, externalId: 'post:2026-10-15/tue' }))
      .toMatchObject({ ok: false, field: 'externalId' });
    const ok = parseMachineCreativeInput({ ...valid, externalId: 'post:2026-10-15:tue', active: false });
    expect(ok).toMatchObject({ ok: true, value: { externalId: 'post:2026-10-15:tue', active: false } });
    expect(parseMachineCreativeInput({ ...valid, active: 'yes' })).toMatchObject({ ok: false, field: 'active' });
  });

  it('turns empty optional captions into null', () => {
    const r = parseMachineCreativeInput({ ...valid, captions: { en: 'x', es: '  ' } });
    expect(r).toMatchObject({ ok: true, value: { captions: { en: 'x', es: null, pt: null } } });
  });
});

describe('resolveMimeType', () => {
  it('uses an accepted Content-Type, ignoring parameters', () => {
    expect(resolveMimeType('video/mp4; charset=binary', 'x')).toBe('video/mp4');
  });

  it('falls back to the extension for octet-stream or missing types', () => {
    expect(resolveMimeType('application/octet-stream', 'clip.MOV')).toBe('video/quicktime');
    expect(resolveMimeType(null, 'clip.webm')).toBe('video/webm');
  });

  it('rejects other types', () => {
    expect(resolveMimeType('text/html', 'clip.mp4')).toBeNull();
    expect(resolveMimeType(null, 'clip.avi')).toBeNull();
  });
});

describe('deriveFileName', () => {
  const url = new URL('https://x.example/files/My%20Clip%20(final).mp4');

  it('sanitizes the URL file name', () => {
    expect(deriveFileName(url, null, 'video/mp4')).toBe('My-Clip-final-.mp4');
  });

  it('prefers the requested name and appends a matching extension', () => {
    expect(deriveFileName(url, 'tue-recruit', 'video/mp4')).toBe('tue-recruit.mp4');
    expect(deriveFileName(url, 'tue.mov', 'video/mp4')).toBe('tue.mov.mp4');
  });

  it('falls back to a generic name', () => {
    expect(deriveFileName(new URL('https://x.example/'), null, 'video/webm')).toBe('creative.webm');
  });
});
