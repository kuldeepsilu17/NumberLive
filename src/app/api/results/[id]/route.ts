import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import {
  validateResultValue,
  validateResultStatus,
  sanitizeText,
} from '@/lib/validation';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getSessionAdmin();
    const { id } = params;

    const result = await prisma.result.findUnique({
      where: { id },
      include: { game: true },
    });

    if (!result) {
      return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
    }

    // Public users can only see published results
    if (result.status !== 'PUBLISHED' && !admin) {
      return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error fetching result by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch result' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { resultValue, status, reasonNote } = body;

    const existing = await prisma.result.findUnique({
      where: { id },
      include: { game: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Result not found.' }, { status: 404 });
    }

    let finalNumber = existing.resultValue;
    if (resultValue !== undefined && resultValue !== '') {
      const numVal = validateResultValue(resultValue);
      if (!numVal.isValid || !numVal.value) {
        return NextResponse.json({ error: numVal.error }, { status: 400 });
      }
      finalNumber = numVal.value;
    }

    let finalStatus = existing.status;
    if (status) {
      const statusVal = validateResultStatus(status);
      if (!statusVal.isValid || !statusVal.value) {
        return NextResponse.json({ error: statusVal.error }, { status: 400 });
      }
      finalStatus = statusVal.value;
    }

    const sanitizedNote = sanitizeText(reasonNote);

    const updated = await prisma.result.update({
      where: { id },
      data: {
        resultValue: finalNumber,
        status: finalStatus,
        publishedAt:
          finalStatus === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
      include: { game: true },
    });

    const action =
      existing.status === 'DRAFT' && finalStatus === 'PUBLISHED'
        ? 'PUBLISH_RESULT'
        : existing.status === 'PUBLISHED' && finalStatus === 'ARCHIVED'
        ? 'ARCHIVE_RESULT'
        : existing.status === 'PUBLISHED' && finalStatus === 'DRAFT'
        ? 'UNPUBLISH_RESULT'
        : existing.resultValue !== finalNumber
        ? 'CORRECT_RESULT'
        : 'UPDATE_RESULT';

    await recordAuditLog({
      adminId: admin.id,
      adminUsername: admin.username,
      action,
      gameId: existing.gameId,
      gameName: existing.game.name,
      targetDate: existing.resultDate,
      oldResult: existing.resultValue,
      newResult: finalNumber,
      reasonNote: sanitizedNote || `Updated result to ${finalStatus}`,
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
    console.error('Error updating result by ID:', error);
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    await prisma.result.delete({ where: { id } });

    await recordAuditLog({
      adminId: admin.id,
      adminUsername: admin.username,
      action: 'DELETE_RESULT',
      gameId: existing.gameId,
      gameName: existing.game.name,
      targetDate: existing.resultDate,
      oldResult: existing.resultValue,
      newResult: null,
      reasonNote: `Deleted result record for ${existing.game.name} on ${existing.resultDate}`,
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

    return NextResponse.json({ success: true, message: 'Result deleted' });
  } catch (error: any) {
    console.error('Error deleting result by ID:', error);
    return NextResponse.json({ error: 'Failed to delete result' }, { status: 500 });
  }
}
