import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateToYYYYMMDD(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateString: string): string {
  try {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function getYesterdayYYYYMMDD(todayStr?: string): string {
  const date = todayStr ? new Date(todayStr) : new Date();
  date.setDate(date.getDate() - 1);
  return formatDateToYYYYMMDD(date);
}

export function formatResultNumber(num: string | number | null | undefined): string {
  if (num === null || num === undefined || num === "") return "--";
  const str = String(num).trim();
  if (str.length === 1 && !isNaN(Number(str))) {
    return `0${str}`;
  }
  return str;
}

export type GameLiveStatus = 'RESULT' | 'LIVE' | 'PENDING' | 'UPCOMING';

export function calculateGameStatus(
  resultTimeStr: string,
  hasPublishedResult: boolean,
  isToday: boolean = true
): GameLiveStatus {
  if (hasPublishedResult) {
    return 'RESULT';
  }

  if (!isToday) {
    return 'PENDING';
  }

  try {
    const match = resultTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 'PENDING';

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    const istTimeStr = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const [currH, currM] = istTimeStr.split(':').map(Number);
    const currentMinutes = currH * 60 + currM;
    const targetMinutes = hours * 60 + minutes;

    const diff = currentMinutes - targetMinutes;

    if (diff >= -10 && diff <= 25) {
      return 'LIVE';
    }

    if (diff > 25) {
      return 'PENDING';
    }

    return 'UPCOMING';
  } catch {
    return 'PENDING';
  }
}

