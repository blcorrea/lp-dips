import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated, getAdminUser } from '@/lib/admin-auth';

// ── DELETE /api/admin/users/[id] — deactivate an admin user ──────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const me = await getAdminUser();

  if (me?.id === id) {
    return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 });
  }

  try {
    await prisma.adminUser.update({
      where: { id },
      data:  { active: false },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
}
