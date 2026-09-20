import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NumberLive production database seeding...');

  // Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.siteSetting.deleteMany({});
  await prisma.pageContent.deleteMany({});
  await prisma.sEOSetting.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.game.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.adminUser.deleteMany({});

  // 1. Create Default Admin User
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@numberlive.in',
      username: 'admin',
      name: 'Chief Editorial Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Created Admin user:', admin.email);

  // 2. Create Categories
  const categoriesData = [
    {
      name: 'Main Games',
      slug: 'main-games',
      description: 'Core daily public results and long-standing regional number records.',
      sortOrder: 1,
    },
    {
      name: 'Regional Games',
      slug: 'regional-games',
      description: 'Territorial and state-specific published number records.',
      sortOrder: 2,
    },
    {
      name: 'Day Games',
      slug: 'day-games',
      description: 'Daytime results published between 01:00 PM and 05:00 PM.',
      sortOrder: 3,
    },
    {
      name: 'Night Games',
      slug: 'night-games',
      description: 'Evening and late-night published public records.',
      sortOrder: 4,
    },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`✅ Created ${Object.keys(categoryMap).length} categories`);

  // 3. Create Games
  const gamesData = [
    {
      name: 'Delhi',
      slug: 'delhi',
      categoryId: categoryMap['main-games'],
      resultTime: '03:00 PM',
      description: 'Official daytime public number result and archive for Delhi region.',
      sortOrder: 1,
      seoTitle: 'Delhi Live Result & Monthly Record Chart - NumberLive',
      seoDescription: 'Check daily published Delhi number result at 03:00 PM, timetable schedule, and multi-year historical record chart.',
    },
    {
      name: 'Faridabad',
      slug: 'faridabad',
      categoryId: categoryMap['main-games'],
      resultTime: '06:15 PM',
      description: 'Daily evening published number record for Faridabad region.',
      sortOrder: 2,
      seoTitle: 'Faridabad Live Result & Record Chart - NumberLive',
      seoDescription: 'Daily 06:15 PM Faridabad published number record and monthly historical chart archive.',
    },
    {
      name: 'Ghaziabad',
      slug: 'ghaziabad',
      categoryId: categoryMap['main-games'],
      resultTime: '08:30 PM',
      description: 'Night published number record and historical chart for Ghaziabad.',
      sortOrder: 3,
      seoTitle: 'Ghaziabad Live Number Result & Chart - NumberLive',
      seoDescription: 'Official Ghaziabad night result archive released daily at 08:30 PM.',
    },
    {
      name: 'Gali',
      slug: 'gali',
      categoryId: categoryMap['main-games'],
      resultTime: '11:15 PM',
      description: 'Late night published number record and complete monthly archives.',
      sortOrder: 4,
      seoTitle: 'Gali Live Result & Record Archive - NumberLive',
      seoDescription: 'Late-night Gali public record published daily at 11:15 PM with yearly charts.',
    },
    {
      name: 'Desawar',
      slug: 'desawar',
      categoryId: categoryMap['main-games'],
      resultTime: '05:00 AM',
      description: 'Early morning published number record and multi-year chart archive.',
      sortOrder: 5,
      seoTitle: 'Desawar Live Morning Result & Historical Chart - NumberLive',
      seoDescription: 'Daily early morning 05:00 AM Desawar number record and full yearly chart.',
    },
    {
      name: 'Noida',
      slug: 'noida',
      categoryId: categoryMap['regional-games'],
      resultTime: '02:00 PM',
      description: 'Afternoon scheduled public record and historical statistics for Noida.',
      sortOrder: 6,
      seoTitle: 'Noida Result & Chart Record - NumberLive',
      seoDescription: 'Afternoon 02:00 PM Noida regional public number archive.',
    },
    {
      name: 'Aligarh',
      slug: 'aligarh',
      categoryId: categoryMap['regional-games'],
      resultTime: '04:30 PM',
      description: 'Daily afternoon public number archive and monthly chart.',
      sortOrder: 7,
      seoTitle: 'Aligarh Public Record & Timetable - NumberLive',
      seoDescription: 'Aligarh 04:30 PM daily published number results and historical chart.',
    },
    {
      name: 'Delhi Night',
      slug: 'delhi-night',
      categoryId: categoryMap['night-games'],
      resultTime: '10:00 PM',
      description: 'Nighttime regional number record and historical timetable.',
      sortOrder: 8,
      seoTitle: 'Delhi Night Result & Chart Record - NumberLive',
      seoDescription: 'Nighttime Delhi regional public record published at 10:00 PM.',
    },
    {
      name: 'Haridwar',
      slug: 'haridwar',
      categoryId: categoryMap['day-games'],
      resultTime: '01:30 PM',
      description: 'Midday public number result record and annual chart.',
      sortOrder: 9,
      seoTitle: 'Haridwar Midday Result & Chart - NumberLive',
      seoDescription: 'Haridwar 01:30 PM midday published number records and charts.',
    },
    {
      name: 'Meerut',
      slug: 'meerut',
      categoryId: categoryMap['regional-games'],
      resultTime: '07:00 PM',
      description: 'Evening regional public number archive and statistics.',
      sortOrder: 10,
      seoTitle: 'Meerut Evening Result & Chart - NumberLive',
      seoDescription: 'Meerut regional public records published daily at 07:00 PM.',
    },
    {
      name: 'Punjab Day',
      slug: 'punjab-day',
      categoryId: categoryMap['day-games'],
      resultTime: '02:30 PM',
      description: 'Daytime regional public record archive for Punjab region.',
      sortOrder: 11,
      seoTitle: 'Punjab Day Live Result & Record Chart - NumberLive',
      seoDescription: 'Punjab Day 02:30 PM public number result and monthly chart.',
    },
    {
      name: 'UP Super',
      slug: 'up-super',
      categoryId: categoryMap['night-games'],
      resultTime: '09:15 PM',
      description: 'Uttar Pradesh regional night record and historical chart archive.',
      sortOrder: 12,
      seoTitle: 'UP Super Night Result & Chart - NumberLive',
      seoDescription: 'UP Super 09:15 PM night number records and yearly chart.',
    },
  ];

  const createdGames: Record<string, any> = {};
  for (const g of gamesData) {
    const game = await prisma.game.create({ data: g });
    createdGames[g.slug] = game;
  }
  console.log(`✅ Created ${Object.keys(createdGames).length} games`);

  // Helper to generate deterministic 2-digit numbers
  function getNumber(seedStr: string): string {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const num = Math.abs(hash) % 100;
    return num < 10 ? `0${num}` : `${num}`;
  }

  // 4. Seed Results (2026 last 100 days + complete 2025 for key games)
  const resultsToInsert: any[] = [];
  const currentDate = new Date('2026-09-17T00:00:00Z');

  // Last 100 days (June - Sept 2026)
  for (let d = 0; d <= 100; d++) {
    const targetDate = new Date(currentDate);
    targetDate.setDate(targetDate.getDate() - d);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    for (const g of gamesData) {
      const gameObj = createdGames[g.slug];
      const val = getNumber(`${dateStr}-${g.slug}`);

      let status = 'PUBLISHED';
      let publishedAt: Date | null = new Date(`${dateStr}T12:00:00Z`);

      if (dateStr === '2026-09-17') {
        // Morning & early afternoon are published, late afternoon are draft/scheduled
        if (['desawar', 'haridwar', 'noida', 'punjab-day', 'delhi'].includes(g.slug)) {
          status = 'PUBLISHED';
        } else if (['aligarh', 'faridabad'].includes(g.slug)) {
          status = 'DRAFT';
          publishedAt = null;
        } else {
          status = 'DRAFT';
          publishedAt = null;
        }
      }

      resultsToInsert.push({
        gameId: gameObj.id,
        resultDate: dateStr,
        resultValue: val,
        resultTime: g.resultTime,
        status,
        publishedAt,
        createdAt: new Date(`${dateStr}T06:00:00Z`),
      });
    }
  }

  // Seed 2025 multi-year archives for main games (Jan to Dec 2025, 1st to 28th of each month)
  const mainGames = ['delhi', 'faridabad', 'ghaziabad', 'gali', 'desawar'];
  for (let m = 1; m <= 12; m++) {
    const monthStr = String(m).padStart(2, '0');
    for (let day = 1; day <= 28; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `2025-${monthStr}-${dayStr}`;

      for (const slug of mainGames) {
        const gameObj = createdGames[slug];
        const val = getNumber(`${dateStr}-${slug}`);
        resultsToInsert.push({
          gameId: gameObj.id,
          resultDate: dateStr,
          resultValue: val,
          resultTime: gameObj.resultTime,
          status: 'PUBLISHED',
          publishedAt: new Date(`${dateStr}T12:00:00Z`),
          createdAt: new Date(`${dateStr}T06:00:00Z`),
        });
      }
    }
  }

  // Batch insert all results instantly
  await prisma.result.createMany({ data: resultsToInsert });
  console.log(`✅ Seeded ${resultsToInsert.length} total results across 2025 and 2026`);

  // 5. Seed Site Settings
  await prisma.siteSetting.createMany({
    data: [
      {
        key: 'notice_board',
        title: 'Editorial Notice Board',
        value: 'NOTICE: NumberLive is an open, independent statistical records archive. We do not promote, conduct, or facilitate wagering. All published numbers are aggregated from public regional announcements.',
      },
      {
        key: 'alert_banner',
        title: 'System Timetable Status',
        value: 'Live timetable sync active. Real-time record publishing verified for September 2026.',
      },
      {
        key: 'site_title',
        title: 'Portal Header Title',
        value: 'NumberLive - Official Public Number Records & Historical Archives',
      },
      {
        key: 'contact_email',
        title: 'Official Editorial Contact',
        value: 'editorial@numberlive.in',
      },
    ],
  });
  console.log('✅ Created Site Settings');

  // 6. Seed FAQs
  await prisma.fAQ.createMany({
    data: [
      {
        question: 'What is NumberLive?',
        answer: 'NumberLive is an independent, open-access public records repository and historical chart archive. We systematically record, organize, and archive published numerical outcomes from various regional informational release boards across India.',
        category: 'General',
        sortOrder: 1,
        isActive: true,
      },
      {
        question: 'Is NumberLive a gambling or betting platform?',
        answer: 'No. NumberLive is strictly an informational and statistical archive. We do not accept bets, provide predictions, sell lucky numbers, or operate any wagering or transactional services. All data is provided purely for archival and analytical research.',
        category: 'Legal',
        sortOrder: 2,
        isActive: true,
      },
      {
        question: 'How fast are results updated?',
        answer: 'Our editorial team updates published results in real-time according to official timetable schedules. Results marked as "Live" or "Published" have been verified against published regional records.',
        category: 'Results',
        sortOrder: 3,
        isActive: true,
      },
      {
        question: 'Can I download historical charts for statistical research?',
        answer: 'Yes! You can download full CSV dataset exports directly from any monthly or yearly chart page by clicking the "Export CSV" button.',
        category: 'Results',
        sortOrder: 4,
        isActive: true,
      },
      {
        question: 'What do the different result statuses mean?',
        answer: '"Published" indicates a verified public record. "Draft" represents a pending entry awaiting editorial confirmation. "Corrected" denotes an outcome amended to rectify a typographical discrepancy in accordance with official records.',
        category: 'Timetable',
        sortOrder: 5,
        isActive: true,
      },
      {
        question: 'How can I report a discrepancy in a historical chart?',
        answer: 'If you notice an error in any historical chart or timetable, please submit a report through our Contact page. Our editorial team will review the audit logs and official documentation.',
        category: 'General',
        sortOrder: 6,
        isActive: true,
      },
    ],
  });
  console.log('✅ Created FAQs');

  // 7. Seed Page Contents
  await prisma.pageContent.createMany({
    data: [
      {
        key: 'about',
        title: 'About NumberLive Data Portal',
        contentJson: JSON.stringify({
          headline: 'Independent Public Number Records & Statistical Archive',
          mission: 'NumberLive was founded to provide transparent, accurate, and immutable public number records. By compiling verified data into structured monthly matrices and multi-year historical charts, we empower researchers, statisticians, and the public with open access to historical information.',
          principles: [
            {
              title: 'Data Integrity & Real-Time Auditing',
              desc: 'Every outcome published on NumberLive is logged with an immutable audit trail, tracking time of publication, verification notes, and editorial reviews.',
            },
            {
              title: 'Zero Prediction / Zero Gambling',
              desc: 'We uphold a strict non-gambling editorial mandate. We never offer predictions, leak numbers, or facilitate monetary transactions of any kind.',
            },
            {
              title: 'Open Data Accessibility',
              desc: 'Our historical databases and monthly grids are freely accessible and exportable in open standard formats (CSV) for transparent analysis.',
            },
          ],
        }),
      },
      {
        key: 'disclaimer',
        title: 'Informational & Non-Gambling Disclaimer',
        contentJson: JSON.stringify({
          headline: 'Strict Informational Purpose Only',
          disclaimerBody: 'NumberLive operates solely as an independent historical records repository and public information aggregator. This platform is not associated with, sponsored by, or affiliated with any gambling, betting, or wagering syndicate.',
          points: [
            'No betting or transactional services are hosted or promoted on this platform.',
            'Numbers shown are collected from publicly available informational announcements.',
            'Users must comply with all regional and national laws regarding online activities.',
          ],
        }),
      },
      {
        key: 'privacy-policy',
        title: 'Privacy Policy',
        contentJson: JSON.stringify({
          headline: 'Our Commitment to Visitor Privacy',
          body: 'NumberLive respects user privacy. We do not track, profile, or sell visitor data. We do not collect banking, payment, or betting transaction data because our service is completely free and informational.',
        }),
      },
      {
        key: 'terms',
        title: 'Terms of Service',
        contentJson: JSON.stringify({
          headline: 'Platform Terms & Usage Guidelines',
          body: 'By accessing NumberLive, you agree that you are using this site strictly for informational, educational, and archival research purposes.',
        }),
      },
    ],
  });
  console.log('✅ Created Page Contents');

  // 8. Seed SEO Settings
  await prisma.sEOSetting.createMany({
    data: [
      {
        pagePath: '/',
        metaTitle: 'NumberLive - Live Public Number Results & Historical Records',
        metaDescription: 'Check official public number records, daily timetable schedules, and multi-year historical chart archives. Informational and non-gambling platform.',
        canonicalUrl: 'https://numberlive.in',
        ogTitle: 'NumberLive - Live Results & Historical Number Charts',
        ogDescription: 'India’s transparent public number archive with real-time audit logs and monthly matrices.',
        robots: 'index, follow',
      },
      {
        pagePath: '/results',
        metaTitle: "Today's Published Results & Timetable - NumberLive",
        metaDescription: "Live published scoreboard, daily schedule, and verified results for Delhi, Faridabad, Ghaziabad, Gali, Desawar, and regional games.",
        canonicalUrl: 'https://numberlive.in/results',
        ogTitle: "Today's Published Results & Timetable | NumberLive",
        ogDescription: 'Explore today’s published results and synchronized timetable.',
        robots: 'index, follow',
      },
      {
        pagePath: '/charts',
        metaTitle: 'Monthly & Yearly Number Charts Matrix - NumberLive',
        metaDescription: 'Explore comprehensive interactive monthly matrices and multi-year historical chart archives with CSV export.',
        canonicalUrl: 'https://numberlive.in/charts',
        ogTitle: 'NumberLive Monthly Number Charts Matrix',
        ogDescription: 'Explore month-by-month results matrix with instant CSV download and search.',
        robots: 'index, follow',
      },
      {
        pagePath: '/yearly-chart',
        metaTitle: 'Yearly Number Chart Archive (12-Month Matrix) - NumberLive',
        metaDescription: 'Interactive 12-month annual chart inspector across all days and regional games with instant verification.',
        canonicalUrl: 'https://numberlive.in/yearly-chart',
        ogTitle: 'Yearly Number Chart Archive | NumberLive',
        ogDescription: '12-Month yearly record chart viewer with day 1-31 matrix.',
        robots: 'index, follow',
      },
      {
        pagePath: '/games',
        metaTitle: 'All Games Directory & Regional Timetable - NumberLive',
        metaDescription: 'Browse all monitored regional games, daily announcement timings, categories, and direct record chart links.',
        canonicalUrl: 'https://numberlive.in/games',
        ogTitle: 'NumberLive Games Directory & Timetables',
        ogDescription: 'Complete listing of all monitored games and daily release times.',
        robots: 'index, follow',
      },
      {
        pagePath: '/history',
        metaTitle: 'Historical Results Database & Search Archive - NumberLive',
        metaDescription: 'Search and filter historical results by game, date, month, and year with full pagination.',
        canonicalUrl: 'https://numberlive.in/history',
        ogTitle: 'Historical Results Database | NumberLive',
        ogDescription: 'Filter and export complete historical published number databases.',
        robots: 'index, follow',
      },
    ],
  });
  console.log('✅ Created SEO Settings');

  // 9. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        adminId: admin.id,
        adminUsername: 'admin',
        action: 'PUBLISH_RESULT',
        gameId: createdGames['delhi'].id,
        gameName: 'Delhi',
        targetDate: '2026-09-17',
        oldResult: null,
        newResult: '67',
        reasonNote: 'Official daytime result confirmed from verified public board',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Editorial-Portal/1.0',
        createdAt: new Date('2026-09-17T09:30:00Z'),
      },
      {
        adminId: admin.id,
        adminUsername: 'admin',
        action: 'PUBLISH_RESULT',
        gameId: createdGames['desawar'].id,
        gameName: 'Desawar',
        targetDate: '2026-09-17',
        oldResult: null,
        newResult: '89',
        reasonNote: 'Morning published record registered',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Editorial-Portal/1.0',
        createdAt: new Date('2026-09-17T05:05:00Z'),
      },
      {
        adminId: admin.id,
        adminUsername: 'admin',
        action: 'CORRECT_RESULT',
        gameId: createdGames['faridabad'].id,
        gameName: 'Faridabad',
        targetDate: '2026-09-16',
        oldResult: '34',
        newResult: '39',
        reasonNote: 'Corrected typo according to official announcement ledger',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Editorial-Portal/1.0',
        createdAt: new Date('2026-09-16T18:45:00Z'),
      },
    ],
  });
  console.log('✅ Created Audit Logs');

  console.log('🎉 Production database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
