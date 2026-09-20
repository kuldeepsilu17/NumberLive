# NumberLive

**NumberLive** is a modern, high-performance web application and historical analytics portal designed for real-time statistical record tracking, timetable scheduling, dynamic matrix charts, and multi-year data archives. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**, the platform delivers a fast, mobile-first experience with a robust administrative control desk for publishing and auditing verified records.

---

## ✨ Features

### Public Portal
- **Live Scoreboards & Results**: Real-time scorecards showing today's results, yesterday's outcomes, and exact publication timestamps.
- **Synchronized Timetables**: Complete game schedules with open/close timings, time-remaining indicators, and status indicators (*Pending*, *Published*, *Upcoming*).
- **12-Month Yearly Chart Inspector (`/yearly-chart`)**: Interactive 365-day statistical grid (Jan–Dec × Days 1–31) with instant database lookup and CSV export.
- **Cross-Game Monthly Matrix (`/monthly-chart`)**: 31-day side-by-side comparison matrix across all active games for any selected month and year.
- **Single-Game Detailed Charts (`/charts/[game]`)**: Dedicated historical records page per game featuring statistical metrics (total entries, most frequent values, last updated) and CSV export.
- **Searchable Historical Archive (`/history`, `/history/[year]`)**: Multi-filter record lookup by game, status, year, month, or date with pagination.
- **Game Directory (`/games`, `/games/[slug]`)**: Categorized directory with category filtering (*Main*, *Regional*, *Day*, *Night*) and game profiles.
- **Content & Support Pages**: Built-in Notice Board, Informational FAQs (`/faq`), Contact Form (`/contact`), About (`/about`), Disclaimer (`/disclaimer`), Privacy Policy (`/privacy-policy`), and Terms (`/terms`).
- **Global Search Modal**: Keyboard-accessible (`Cmd/Ctrl + K`) real-time search across all games, categories, and schedules.

### Admin Control Desk (`/admin`)
- **Secure Authentication**: Protected dashboard using stateless JWT sessions (`jose`) and hashed credentials (`bcryptjs`).
- **Result Publishing Workflow**: Full editorial lifecycle supporting Draft, Preview, Publish, Edit, and Correct with mandatory audit notes.
- **Instant Cache Revalidation**: Publishing or updating results automatically revalidates relevant public pages via Next.js on-demand revalidation.
- **Game & Category Management**: CRUD operations for games, category assignments, and timetable schedules.
- **Historical Data Manager**: Filter, edit, correct, or remove past records.
- **Content & FAQ CMS**: Rich text and structured FAQ manager.
- **SEO & Metadata Control**: Per-route metadata configuration (Meta Title, Description, Canonical URL, OG tags, Robots directives).
- **Audit Logging**: Immutable event ledger tracking result creations, corrections, deletions, and administrative actions.

---

## 🎨 UI & Design

- **Theme Palette**: Premium bespoke dark/light theme featuring **Charcoal Black (`#111113`)**, **Warm Ivory (`#FAF8F5`)**, **Champagne Gold (`#C5A059`)**, and subtle border accents (`#EAE3D5` / `#2E2E33`).
- **Unified Navigation**: A single persistent header across desktop and mobile, with direct navigation links on large screens and a responsive slide-out drawer on mobile.
- **Typography & Cards**: High-legibility tabular figures, monospace result badges, subtle elevation shadows, and hover micro-interactions.
- **Matrix Tables**: Horizontal scroll-safe layouts with fixed headers for complex data grids on smaller viewports.

---

## 📱 Responsive Design

NumberLive is engineered from the ground up with a strict **mobile-first** approach:
- **Mobile Viewports (320px – 430px)**: 100% full-width cards, 44–48px touch targets, sticky bottom navigation bars, and swipeable tables.
- **Tablet (768px – 1024px)**: Responsive 2-to-3 column grids and adaptive control bars.
- **Desktop (1280px – 1440px+)**: Multi-column dashboard layouts with sidebar widgets and data inspectors.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS variables |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) (Configured for SQLite in development; PostgreSQL-ready) |
| **Authentication** | [Jose](https://github.com/panva/jose) (JWT) & [BcryptJS](https://github.com/dcodeIO/bcrypt.js) |
| **Data Export** | [PapaParse](https://www.papaparse.com/) (CSV generation) |
| **Linting & Quality** | ESLint (`next/core-web-vitals`) |

---

## 📂 Project Structure

```
NumberLive/
├── prisma/
│   ├── schema.prisma       # Database schema & models
│   └── seed.ts             # Database seed script (games, results, settings, admin)
├── public/                 # Static assets & icons
├── src/
│   ├── app/                # Next.js 14 App Router routes
│   │   ├── about/          # About page
│   │   ├── admin/          # Admin control desk (dashboard, results, games, SEO, CMS)
│   │   ├── api/            # REST API endpoints (results, games, categories, auth, export)
│   │   ├── charts/         # Single-game charts & charts hub
│   │   ├── contact/        # Contact form with database persistence
│   │   ├── disclaimer/     # Legal disclaimer
│   │   ├── faq/            # FAQ accordion
│   │   ├── games/          # Games directory & game detail profiles
│   │   ├── history/        # Historical archive with yearly filters
│   │   ├── monthly-chart/  # 31-day cross-game matrix
│   │   ├── privacy-policy/ # Privacy policy page
│   │   ├── results/        # Results scoreboard & timetable
│   │   ├── terms/          # Terms of service
│   │   ├── today-results/  # Dedicated today's results view
│   │   ├── yearly-chart/   # 12-month annual matrix inspector
│   │   ├── layout.tsx      # Root layout & theme providers
│   │   ├── page.tsx        # Homepage (Scoreboard, Schedule, Notices, Matrix)
│   │   ├── robots.ts       # Dynamic robots.txt
│   │   └── sitemap.ts      # Dynamic sitemap.xml
│   ├── components/         # Reusable React components
│   │   ├── charts/         # YearlyMatrix, MonthlyMatrix, SingleGameChart, HistoricalTable
│   │   ├── games/          # GameHeader, GameFaq
│   │   ├── home/           # TodayResultsGrid, GameScheduleTable, NoticeBoard, LiveTicker
│   │   ├── layout/         # Header, Footer, DisclaimerBanner, NoticeBar
│   │   └── search/         # SearchModal
│   ├── lib/                # Utility libraries
│   │   ├── audit.ts        # Audit logging service
│   │   ├── auth.ts         # JWT session management & verification
│   │   ├── prisma.ts       # Global Prisma client singleton
│   │   ├── seo.ts          # SEO metadata helper
│   │   └── utils.ts        # Date formatting & helper functions
│   ├── middleware.ts       # Route protection middleware for /admin routes
│   └── types/              # TypeScript interface definitions
├── .env.example            # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── next.config.mjs         # Next.js configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind styling tokens & theme colors
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Getting Started

Follow these steps to set up and run NumberLive locally.

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** or **yarn** / **pnpm**

### 2. Clone the Repository
```bash
git clone https://github.com/kuldeepsilu17/NumberLive.git
cd NumberLive
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```bash
cp .env.example .env
```

### 5. Setup Database & Seed Initial Data
Generate the Prisma Client, push the schema to your local database, and run the seed script:
```bash
# Generate Prisma Client
npx prisma generate

# Synchronize database schema
npx prisma db push

# Seed initial games, results, categories, settings, and default admin
npm run seed
```

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔐 Environment Variables

The project uses the following environment variables (defined in `.env`):

| Variable | Description | Example / Default |
|---|---|---|
| `DATABASE_URL` | SQLite / PostgreSQL connection string | `"file:./dev.db"` |
| `JWT_SECRET` | Secret key for signing admin authentication JWTs | `"your-secure-jwt-secret-key"` |
| `NEXT_PUBLIC_APP_URL` | Canonical URL of the application | `"http://localhost:3000"` |
| `NEXT_PUBLIC_SITE_NAME` | Global site display name | `"NumberLive"` |

> **Note**: Never commit your `.env` file or sensitive credentials to version control.

---

## 🏗️ Build & Production

To test and compile the production bundle:

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

To run linting and type checks:
```bash
# Typecheck
npx tsc --noEmit

# Lint
npm run lint
```

---

## 🌐 Deployment

### Deploying to Vercel
1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Configure the environment variables (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_NAME`).
4. For cloud deployments, switch `DATABASE_URL` to a hosted PostgreSQL provider (e.g., Supabase, Neon, Railway) and update the datasource provider in `prisma/schema.prisma` to `postgresql`.
5. Set the build command to: `prisma generate && next build`.

---

## 📊 Project Status

- **Status**: Production-Ready / Fully Implemented.
- **Database Coverage**: Multi-year result models, categories, game profiles, FAQs, contact submissions, CMS page content, SEO metadata, and audit logs.
- **Route Validation**: All 36 static and dynamic routes compile with zero TypeScript errors and zero ESLint warnings.

---

## 🔮 Future Improvements

- [ ] Real-time WebSocket push notifications for instant result broadcasts.
- [ ] Multi-language localization (Hindi / English toggle).
- [ ] Progressive Web App (PWA) offline chart caching.
- [ ] Automated SMS/Telegram notification webhook integrations for administrators.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is currently distributed as proprietary software. All rights reserved. Please contact the author for licensing inquiries or commercial use permissions.

---

## 📸 Screenshots

> *Screenshots of the desktop and mobile interfaces can be placed in a `/docs/screenshots/` folder.*

| Scoreboard & Timetable | 12-Month Yearly Chart |
|---|---|
| *(Screenshot Placeholder)* | *(Screenshot Placeholder)* |

---

## 🔗 Links

- **GitHub Repository**: [https://github.com/kuldeepsilu17/NumberLive.git](https://github.com/kuldeepsilu17/NumberLive.git)

---

## 🧑‍💻 Author

**Kuldeep Silu**
- GitHub: [@kuldeepsilu17](https://github.com/kuldeepsilu17)
