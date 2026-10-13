import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSessionAdmin } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';
import { formatDateToYYYYMMDD, getYesterdayYYYYMMDD } from '@/lib/utils';
import {
  validateResultDate,
  validateResultValue,
  validateResultStatus,
  sanitizeText,
} from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = await getSessionAdmin();
    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view');
    const date = searchParams.get('date');
    const gameSlug = searchParams.get('game');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 1. View: Today Summary Scoreboard (Yesterday vs Today for all active games)
    if (view === 'today_summary') {
      const todayStr = date || formatDateToYYYYMMDD();
      const yesterdayStr = getYesterdayYYYYMMDD(todayStr);

      const games = await prisma.game.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { category: true },
      });

      const todayResults = await prisma.result.findMany({
        where: {
          resultDate: todayStr,
        },
      });

      const yesterdayResults = await prisma.result.findMany({
        where: {
          resultDate: yesterdayStr,
          status: 'PUBLISHED',
        },
      });

      const resultMap: Record<string, { today: any; yesterday: any }> = {};
      games.forEach((g) => {
        resultMap[g.id] = { today: null, yesterday: null };
      });

      todayResults.forEach((r) => {
        if (resultMap[r.gameId]) {
          resultMap[r.gameId].today = r;
        }
      });

      yesterdayResults.forEach((r) => {
        if (resultMap[r.gameId]) {
          resultMap[r.gameId].yesterday = r;
        }
      });

      const summary = games.map((game) => {
        const t = resultMap[game.id]?.today;
        const y = resultMap[game.id]?.yesterday;
        const isTodayPublished = t && t.status === 'PUBLISHED';

        return {
          game,
          yesterdayResult: y ? y.resultValue : null,
          todayResult: isTodayPublished ? t.resultValue : null,
          // Admin can inspect draft if authenticated, but public user only gets published
          todayDraftResult: admin && t ? t.resultValue : null,
          status: isTodayPublished ? 'PUBLISHED' : (admin && t ? t.status : 'PENDING'),
          resultTime: game.resultTime,
          updatedAt: isTodayPublished ? t.updatedAt : null,
        };
      });

      return NextResponse.json({
        success: true,
        date: todayStr,
        yesterdayDate: yesterdayStr,
        summary,
      });
    }

    // 2. View: Monthly Matrix (Cross-game matrix for a specific month/year - strictly PUBLISHED)
    if (view === 'monthly_matrix') {
      const targetYear = parseInt(year || String(new Date().getFullYear()));
      const targetMonth = parseInt(month || String(new Date().getMonth() + 1));
      const monthPadded = String(targetMonth).padStart(2, '0');
      const datePrefix = `${targetYear}-${monthPadded}`;

      const games = await prisma.game.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { category: true },
      });

      const results = await prisma.result.findMany({
        where: {
          resultDate: {
            startsWith: datePrefix,
          },
          status: 'PUBLISHED',
        },
        include: {
          game: true,
        },
      });

      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      const matrix: Record<number, Record<string, string>> = {};

      for (let day = 1; day <= daysInMonth; day++) {
        matrix[day] = {};
        games.forEach((g) => {
          matrix[day][g.slug] = '--';
        });
      }

      results.forEach((r) => {
        const day = parseInt(r.resultDate.split('-')[2]);
        if (matrix[day] && r.game) {
          matrix[day][r.game.slug] = r.resultValue;
        }
      });

      return NextResponse.json({
        success: true,
        year: targetYear,
        month: targetMonth,
        daysInMonth,
        games,
        matrix,
      });
    }

    // 3. View: Yearly Matrix (Single Game × 12 Months × 31 Days - strictly PUBLISHED)
    if (view === 'yearly_matrix') {
      const targetYear = parseInt(year || String(new Date().getFullYear()));
      if (!gameSlug) {
        return NextResponse.json({ error: 'Game parameter is required for yearly matrix' }, { status: 400 });
      }

      const game = await prisma.game.findUnique({
        where: { slug: gameSlug },
        include: { category: true },
      });

      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }

      const results = await prisma.result.findMany({
        where: {
          gameId: game.id,
          resultDate: {
            startsWith: `${targetYear}-`,
          },
          status: 'PUBLISHED',
        },
        orderBy: { resultDate: 'asc' },
      });

      const matrix: Record<number, Record<number, string>> = {};
      for (let day = 1; day <= 31; day++) {
        matrix[day] = {};
        for (let m = 1; m <= 12; m++) {
          matrix[day][m] = '--';
        }
      }

      const monthlyCounts: Record<number, number> = {};
      for (let m = 1; m <= 12; m++) monthlyCounts[m] = 0;

      results.forEach((r) => {
        const parts = r.resultDate.split('-');
        const m = parseInt(parts[1]);
        const d = parseInt(parts[2]);
        if (matrix[d] && m >= 1 && m <= 12) {
          matrix[d][m] = r.resultValue;
          monthlyCounts[m]++;
        }
      });

      return NextResponse.json({
        success: true,
        year: targetYear,
        game,
        matrix,
        monthlyCounts,
        totalEntries: results.length,
      });
    }

    // 4. View: Game Chart (Game-specific detailed dataset with stats - strictly PUBLISHED)
    if (view === 'game_chart') {
      if (!gameSlug) {
        return NextResponse.json({ error: 'Game slug is required' }, { status: 400 });
      }

      const game = await prisma.game.findUnique({
        where: { slug: gameSlug },
        include: { category: true },
      });

      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }

      const targetYear = year ? parseInt(year) : new Date().getFullYear();
      const whereClause: any = {
        gameId: game.id,
        status: 'PUBLISHED',
      };

      if (year && month) {
        const monthPadded = String(month).padStart(2, '0');
        whereClause.resultDate = { startsWith: `${targetYear}-${monthPadded}` };
      } else if (year) {
        whereClause.resultDate = { startsWith: `${targetYear}-` };
      }

      const results = await prisma.result.findMany({
        where: whereClause,
        orderBy: { resultDate: 'desc' },
      });

      const frequencyMap: Record<string, number> = {};
      results.forEach((r) => {
        frequencyMap[r.resultValue] = (frequencyMap[r.resultValue] || 0) + 1;
      });

      let mostFrequent = '--';
      let maxCount = 0;
      Object.entries(frequencyMap).forEach(([val, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostFrequent = val;
        }
      });

      return NextResponse.json({
        success: true,
        game,
        year: targetYear,
        month: month ? parseInt(month) : null,
        results,
        stats: {
          total: results.length,
          mostFrequent,
          mostFrequentCount: maxCount,
          latestResult: results[0] ? results[0].resultValue : '--',
          latestDate: results[0] ? results[0].resultDate : null,
        },
      });
    }

    // 5. General Query / History View
    const where: any = {};
    if (date) where.resultDate = date;

    // Security check: Unauthenticated public queries ONLY get PUBLISHED results
    if (!admin) {
      where.status = 'PUBLISHED';
    } else if (statusParam) {
      where.status = statusParam;
    }

    if (year && month) {
      const monthPadded = String(month).padStart(2, '0');
      where.resultDate = { startsWith: `${year}-${monthPadded}` };
    } else if (year) {
      where.resultDate = { startsWith: `${year}-` };
    }

    if (gameSlug) {
      const game = await prisma.game.findUnique({ where: { slug: gameSlug } });
      if (game) {
        where.gameId = game.id;
      }
    }

    const total = await prisma.result.count({ where });
    const results = await prisma.result.findMany({
      where,
      orderBy: [{ resultDate: 'desc' }, { game: { sortOrder: 'asc' } }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        game: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in results GET:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { gameId, resultDate, resultValue, resultTime, status, reasonNote } = body;

    // 1. Server-side validation
    if (!gameId) {
      return NextResponse.json({ error: 'Game selection is required.' }, { status: 400 });
    }

    const dateVal = validateResultDate(resultDate);
    if (!dateVal.isValid || !dateVal.value) {
      return NextResponse.json({ error: dateVal.error }, { status: 400 });
    }

    const numVal = validateResultValue(resultValue);
    if (!numVal.isValid || !numVal.value) {
      return NextResponse.json({ error: numVal.error }, { status: 400 });
    }

    const statusVal = validateResultStatus(status);
    if (!statusVal.isValid || !statusVal.value) {
      return NextResponse.json({ error: statusVal.error }, { status: 400 });
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: 'Game not found.' }, { status: 404 });
    }

    const sanitizedNote = sanitizeText(reasonNote);
    const finalDate = dateVal.value;
    const finalNumber = numVal.value;
    const finalStatus = statusVal.value;
    const finalTime = resultTime || game.resultTime;

    const existing = await prisma.result.findUnique({
      where: {
        gameId_resultDate: {
          gameId,
          resultDate: finalDate,
        },
      },
    });

    let result;
    if (existing) {
      const oldVal = existing.resultValue;
      const oldStatus = existing.status;

      result = await prisma.result.update({
        where: { id: existing.id },
        data: {
          resultValue: finalNumber,
          resultTime: finalTime,
          status: finalStatus,
          publishedAt:
            finalStatus === 'PUBLISHED' && !existing.publishedAt
              ? new Date()
              : existing.publishedAt,
        },
        include: { game: true },
      });

      const action =
        oldStatus === 'DRAFT' && finalStatus === 'PUBLISHED'
          ? 'PUBLISH_RESULT'
          : finalStatus === 'ARCHIVED'
          ? 'ARCHIVE_RESULT'
          : oldVal !== finalNumber
          ? 'CORRECT_RESULT'
          : 'UPDATE_RESULT';

      await recordAuditLog({
        adminId: admin.id,
        adminUsername: admin.username,
        action,
        gameId: game.id,
        gameName: game.name,
        targetDate: finalDate,
        oldResult: oldVal,
        newResult: finalNumber,
        reasonNote: sanitizedNote || `Updated ${game.name} result for ${finalDate} (${oldStatus} -> ${finalStatus})`,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Browser',
      });
    } else {
      result = await prisma.result.create({
        data: {
          gameId,
          resultDate: finalDate,
          resultValue: finalNumber,
          resultTime: finalTime,
          status: finalStatus,
          publishedAt: finalStatus === 'PUBLISHED' ? new Date() : null,
        },
        include: { game: true },
      });

      await recordAuditLog({
        adminId: admin.id,
        adminUsername: admin.username,
        action: finalStatus === 'PUBLISHED' ? 'PUBLISH_RESULT' : 'CREATE_RESULT',
        gameId: game.id,
        gameName: game.name,
        targetDate: finalDate,
        oldResult: null,
        newResult: finalNumber,
        reasonNote: sanitizedNote || `Created ${finalStatus.toLowerCase()} result for ${game.name}`,
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: req.headers.get('user-agent') || 'Browser',
      });
    }

    // Instant cache revalidation across key public pages
    try {
      revalidatePath('/');
      revalidatePath('/results');
      revalidatePath('/today-results');
      revalidatePath('/charts');
      revalidatePath('/monthly-chart');
      revalidatePath('/yearly-chart');
      revalidatePath(`/games/${game.slug}`);
      revalidatePath(`/charts/${game.slug}`);
      revalidatePath('/history');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error creating/updating result:', error);
    return NextResponse.json({ error: 'Failed to process result' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, resultValue, status, reasonNote } = body;

    if (!id) {
      return NextResponse.json({ error: 'Result ID is required.' }, { status: 400 });
    }

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
      reasonNote: sanitizedNote || `Updated result status to ${finalStatus}`,
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
    console.error('Error updating result:', error);
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getSessionAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Result ID is required.' }, { status: 400 });
    }

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
    console.error('Error deleting result:', error);
    return NextResponse.json({ error: 'Failed to delete result' }, { status: 500 });
  }
}
