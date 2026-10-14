import { describe, expect, it } from 'vitest';
import {
  normalizeInstagram,
  parseUgcListQuery,
  parseUgcReviewInput,
  parseUgcSubmissionInput,
} from '../ugc-input';

const customer = { name: 'Ana Souza', email: ' Ana@Example.com ', rightsAccepted: true };

describe('parseUgcSubmissionInput', () => {
  it('normalizes a valid customer submission', () => {
    const r = parseUgcSubmissionInput({ ...customer, instagram: '@ana.doces', orderEmail: 'Pedido@Example.com', locale: 'pt' });
    expect(r).toEqual({
      ok: true,
      value: {
        name: 'Ana Souza',
        email: 'ana@example.com',
        instagram: 'ana.doces',
        orderEmail: 'pedido@example.com',
        locale: 'pt',
        rightsAccepted: true,
      },
    });
  });

  it('defaults locale to en and optional fields to null', () => {
    const r = parseUgcSubmissionInput({ ...customer, instagram: '  ', orderEmail: '', locale: 'fr' });
    expect(r).toMatchObject({ ok: true, value: { locale: 'en', instagram: null, orderEmail: null } });
  });

  it('requires the content license to be accepted (strictly true)', () => {
    expect(parseUgcSubmissionInput({ ...customer, rightsAccepted: false }))
      .toMatchObject({ ok: false, field: 'rightsAccepted' });
    expect(parseUgcSubmissionInput({ ...customer, rightsAccepted: 'true' }))
      .toMatchObject({ ok: false, field: 'rightsAccepted' });
  });

  it('rejects bad name, email, handle and order email', () => {
    expect(parseUgcSubmissionInput({ ...customer, name: 'A' })).toMatchObject({ ok: false, field: 'name' });
    expect(parseUgcSubmissionInput({ ...customer, email: 'nope' })).toMatchObject({ ok: false, field: 'email' });
    expect(parseUgcSubmissionInput({ ...customer, instagram: 'ana doces!' })).toMatchObject({ ok: false, field: 'instagram' });
    expect(parseUgcSubmissionInput({ ...customer, orderEmail: 'x@' })).toMatchObject({ ok: false, field: 'orderEmail' });
  });
});

describe('normalizeInstagram', () => {
  it('strips leading @ and whitespace', () => {
    expect(normalizeInstagram(' @@dipswellness ')).toBe('dipswellness');
    expect(normalizeInstagram('@')).toBeNull();
  });
});

describe('parseUgcReviewInput', () => {
  it('maps machine verdicts to the enum', () => {
    expect(parseUgcReviewInput({ verdict: 'repost_edit', score: 72.5, reasons: [' good hook ', 'trim intro'] }))
      .toEqual({ ok: true, value: { verdict: 'REPOST_EDIT', score: 72.5, reasons: ['good hook', 'trim intro'] } });
    expect(parseUgcReviewInput({ verdict: 'reject', score: 0, reasons: [] }))
      .toMatchObject({ ok: true, value: { verdict: 'REJECT' } });
  });

  it('rejects unknown verdicts, including prototype keys', () => {
    expect(parseUgcReviewInput({ verdict: 'REPOST', score: 1, reasons: [] })).toMatchObject({ ok: false, field: 'verdict' });
    expect(parseUgcReviewInput({ verdict: 'toString', score: 1, reasons: [] })).toMatchObject({ ok: false, field: 'verdict' });
  });

  it('bounds the score to 0-100', () => {
    for (const score of [-1, 101, Number.NaN, '50', null]) {
      expect(parseUgcReviewInput({ verdict: 'repost', score, reasons: [] })).toMatchObject({ ok: false, field: 'score' });
    }
  });

  it('validates reasons', () => {
    expect(parseUgcReviewInput({ verdict: 'repost', score: 1 })).toMatchObject({ ok: false, field: 'reasons' });
    expect(parseUgcReviewInput({ verdict: 'repost', score: 1, reasons: [''] })).toMatchObject({ ok: false, field: 'reasons' });
    expect(parseUgcReviewInput({ verdict: 'repost', score: 1, reasons: ['x'.repeat(501)] }))
      .toMatchObject({ ok: false, field: 'reasons' });
    expect(parseUgcReviewInput({ verdict: 'repost', score: 1, reasons: Array(21).fill('x') }))
      .toMatchObject({ ok: false, field: 'reasons' });
  });
});

describe('parseUgcListQuery', () => {
  const q = (s: string) => parseUgcListQuery(new URLSearchParams(s));

  it('defaults to status=new, limit=50', () => {
    expect(q('')).toEqual({ ok: true, value: { status: 'NEW', limit: 50, cursor: null } });
  });

  it('accepts reviewed and all', () => {
    expect(q('status=reviewed&limit=10&cursor=abc')).toEqual({ ok: true, value: { status: 'REVIEWED', limit: 10, cursor: 'abc' } });
    expect(q('status=all')).toMatchObject({ ok: true, value: { status: null } });
  });

  it('rejects other statuses and bad limits', () => {
    expect(q('status=pending_upload')).toMatchObject({ ok: false, field: 'status' });
    expect(q('limit=0')).toMatchObject({ ok: false, field: 'limit' });
    expect(q('limit=101')).toMatchObject({ ok: false, field: 'limit' });
    expect(q('limit=2.5')).toMatchObject({ ok: false, field: 'limit' });
  });
});
