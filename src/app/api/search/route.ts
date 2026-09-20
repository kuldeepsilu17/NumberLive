import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q || q.length < 1) {
      return NextResponse.json({ success: true, games: [], results: [] });
    }

    // 1. Match games
    const matchedGames = await prisma.game.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q.toLowerCase() } },
          { description: { contains: q } },
        ],
      },
      take: 5,
    });

    // 2. Match results by date or number
    let resultWhere: any = {};
    const isNumberQuery = /^\d{1,2}$/.test(q);

    if (isNumberQuery) {
      const padded = q.padStart(2, '0');
      resultWhere = {
        resultValue: padded,
        status: 'PUBLISHED',
      };
    } else {
      resultWhere = {
        OR: [
          { resultDate: { contains: q } },
          { game: { name: { contains: q } } },
        ],
        status: 'PUBLISHED',
      };
    }

    const matchedResults = await prisma.result.findMany({
      where: resultWhere,
      orderBy: { resultDate: 'desc' },
      take: 20,
      include: {
        game: true,
      },
    });

    return NextResponse.json({
      success: true,
      query: q,
      games: matchedGames,
      results: matchedResults,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
