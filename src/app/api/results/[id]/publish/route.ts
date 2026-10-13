import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.result.findUnique({
      where: { id },
      include: { game: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
    }

    const updated = await prisma.result.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: { game: true },
    });

    await recordAuditLog({
      adminId: admin.id,
      adminUsername: admin.username,
      action: 'PUBLISH_RESULT',
      gameId: existing.gameId,
      gameName: existing.game.name,
      targetDate: existing.resultDate,
      oldResult: existing.resultValue,
      newResult: existing.resultValue,
      reasonNote: `Published official result (${existing.resultValue}) for ${existing.game.name} on ${existing.resultDate}`,
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Browser',
    });

    try {
      revalidatePath('/');
      revalidatePath('/results');
      revalidatePath('/today-results');
      revalidatePath('/charts');
      revalidatePath('/monthly-chart');
      revalidatePath('/yearly-chart');
      revalidatePath(`/games/${existing.game.slug}`);
      revalidatePath(`/charts/${existing.game.slug}`);
      revalidatePath('/history');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, result: updated });
  } catch (error: any) {
    console.error('Error publishing result:', error);
    return NextResponse.json({ error: 'Failed to publish result' }, { status: 500 });
  }
}
