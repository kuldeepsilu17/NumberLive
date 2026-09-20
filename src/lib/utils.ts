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
