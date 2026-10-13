import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import SimpleHistoryPortal from '@/components/history/SimpleHistoryPortal';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Historical Number Records & Ledger Archive - NumberLive',
  description: 'Multi-year historical records and monthly number archives by Year, Month, and Game on NumberLive.',
  path: '/history',
});

export const revalidate = 10;

const DEFAULT_FALLBACK_GAMES = [
  { id: 'g-desawar', name: 'Desawar', slug: 'desawar', resultTime: '05:15 AM' },
  { id: 'g-delhibazar', name: 'Delhi Bazar', slug: 'delhi-bazar', resultTime: '03:15 PM' },
  { id: 'g-faridabad', name: 'Faridabad', slug: 'faridabad', resultTime: '06:15 PM' },
  { id: 'g-ghaziabad', name: 'Ghaziabad', slug: 'ghaziabad', resultTime: '08:30 PM' },
  { id: 'g-gali', name: 'Gali', slug: 'gali', resultTime: '11:15 PM' },
];

export default async function HistoryPage() {
  let games: any[] = [];
  try {
    games = await prisma.game.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch (err) {
    console.warn('Prisma query warning on /history, using default structure:', err);
  }

  const activeGames = games.length > 0 ? games : DEFAULT_FALLBACK_GAMES;

  const gamesFormatted = activeGames.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    resultTime: g.resultTime,
  }));

  return (
    <SimpleHistoryPortal
      games={gamesFormatted}
      initialYear={2026}
      initialMonth={9}
    />
  );
}
