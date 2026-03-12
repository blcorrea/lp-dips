import { NextResponse } from 'next/server';
import { getDipsProduct } from '@/lib/shopify';

export async function GET() {
  try {
    const product = await getDipsProduct();
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Shopify error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}