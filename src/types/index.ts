export interface Game {
  id: string;
  name: string;
  slug: string;
  resultTime: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Result {
  id: string;
  gameId: string;
  game?: Game;
  resultDate: string; // YYYY-MM-DD
  resultValue: string; // "00" - "99"
  resultTime: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  publishedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TodayGameResult {
  game: Game;
  yesterdayResult: string | null;
  todayResult: string | null;
  status: 'PUBLISHED' | 'PENDING' | 'DRAFT';
  resultTime: string;
  updatedAt?: string | Date;
}

export interface AuditLogItem {
  id: string;
  adminId?: string | null;
  adminUsername: string;
  action: string;
  gameId?: string | null;
  gameName?: string | null;
  targetDate?: string | null;
  oldResult?: string | null;
  newResult?: string | null;
  reasonNote?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
}

export interface DashboardStats {
  totalGames: number;
  activeGames: number;
  todayPublished: number;
  todayPending: number;
  totalResults: number;
  totalLogs: number;
}

export interface MonthlyMatrixData {
  year: number;
  month: number;
  daysInMonth: number;
  games: Game[];
  matrix: {
    [day: number]: {
      [gameSlug: string]: string; // Result value
    };
  };
}
