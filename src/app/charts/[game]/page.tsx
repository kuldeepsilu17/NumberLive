import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import SimpleGameChart from '@/components/charts/SimpleGameChart';
import { constructMetadata } from '@/lib/seo';

interface PageProps {
  params: {
    game: string;
  };
  searchParams: {
    year?: string;
    month?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const game = await prisma.game.findUnique({
      where: { slug: params.game },
    });

    if (!game) {
      return { title: 'Game Record Chart Not Found | NumberLive' };
    }

    return constructMetadata({
      title: `${game.name} Monthly & Yearly Record Chart - NumberLive`,
      description: `Official historical record chart and monthly number archive for ${game.name}. Daily announcement time: ${game.resultTime}.`,
      path: `/charts/${game.slug}`,
    });
  } catch (err) {
    return constructMetadata({
      title: 'Game Record Chart - NumberLive',
      description: 'Historical record chart and monthly number archive.',
      path: `/charts/${params.game}`,
    });
  }
}

export const revalidate = 10;

export default async function GameChartPage({ params, searchParams }: PageProps) {
  let game = null;
  try {
    game = await prisma.game.findUnique({
      where: { slug: params.game },
      include: { category: true },
    });
  } catch (err) {
    console.warn('Prisma query warning on /charts/[game]:', err);
  }

  if (!game) {
    notFound();
  }

  const initialYear = searchParams?.year ? parseInt(searchParams.year) : 2026;
  const initialMonth = searchParams?.month ? parseInt(searchParams.month) : 9;

  return (
    <SimpleGameChart
      game={{
        id: game.id,
        name: game.name,
        slug: game.slug,
        resultTime: game.resultTime,
        description: game.description,
      }}
      initialYear={initialYear}
      initialMonth={initialMonth}
    />
  );
}
