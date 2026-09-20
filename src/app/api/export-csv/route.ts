import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameSlug = searchParams.get('game');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    const where: any = { status: 'PUBLISHED' };

    if (gameSlug) {
      const game = await prisma.game.findUnique({ where: { slug: gameSlug } });
      if (game) where.gameId = game.id;
    }

    if (year && month) {
      const monthPadded = String(month).padStart(2, '0');
      where.resultDate = { startsWith: `${year}-${monthPadded}` };
    } else if (year) {
      where.resultDate = { startsWith: `${year}-` };
    }

    const results = await prisma.result.findMany({
      where,
      orderBy: [{ resultDate: 'desc' }, { game: { sortOrder: 'asc' } }],
      include: { game: true },
      take: 2000,
    });

    const data = results.map((r) => ({
      Date: r.resultDate,
      Game: r.game.name,
      Result: r.resultValue,
      Time: r.resultTime,
      Status: r.status,
      PublishedAt: r.publishedAt ? new Date(r.publishedAt).toISOString() : '',
    }));

    const csv = Papa.unparse(data);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="NumberLive_Results_${year || 'All'}_${month || 'All'}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export CSV error:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
