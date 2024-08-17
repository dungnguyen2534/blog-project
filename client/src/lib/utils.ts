import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  endOfYesterday,
  format,
  startOfYesterday,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, showTimeDiff: boolean = true) {
  const date = new Date(dateString);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const dateYear = date.getFullYear();
  const formattedDate = format(date, "MMM d");

  if (!showTimeDiff) {
    return formattedDate + ", " + dateYear;
  }

  const diffInHours = differenceInHours(currentDate, date);

  if (date.toDateString() === currentDate.toDateString()) {
    if (diffInHours < 1) {
      const diffInMinutes = differenceInMinutes(currentDate, date);
      if (diffInMinutes < 1) {
        return `${formattedDate} (Just now)`;
      } else {
        return `${formattedDate} (${diffInMinutes + 1} minutes ago)`;
      }
    } else {
      if (diffInHours === 1) {
        return `${formattedDate} (An hour ago)`;
      } else {
        return `${formattedDate} (${diffInHours + 1} hours ago)`;
      }
    }
  } else {
    const startYesterday = startOfYesterday();
    const endYesterday = endOfYesterday();

    if (date >= startYesterday && date <= endYesterday) {
      return `${formattedDate} (1 day ago)`;
    }

    const diffInDays = differenceInDays(currentDate, date);
    if (diffInDays >= 1 && diffInDays <= 7) {
      return `${formattedDate} (${diffInDays + 1} days ago)`;
    } else if (dateYear !== currentYear) {
      return `${formattedDate} ${dateYear}`;
    } else {
      return formattedDate;
    }
  }
}

export const extractImageUrls = (markdown: string): string[] => {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};
