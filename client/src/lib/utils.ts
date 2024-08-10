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

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const dateYear = date.getFullYear();
  const formattedDate = format(date, "MMM d");

  const diffInHours = differenceInHours(currentDate, date);

  if (date.toDateString() === currentDate.toDateString()) {
    if (diffInHours < 1) {
      const diffInMinutes = differenceInMinutes(currentDate, date);
      return `${diffInMinutes} minutes ago`;
    }
    return `${diffInHours} hours ago`;
  } else {
    const startYesterday = startOfYesterday();
    const endYesterday = endOfYesterday();

    if (date >= startYesterday && date <= endYesterday) {
      return `${formattedDate} (Yesterday)`;
    }

    const diffInDays = differenceInDays(currentDate, date);
    if (diffInDays >= 1 && diffInDays <= 31) {
      return `${formattedDate} (${diffInDays + 1} days ago)`;
    } else if (dateYear !== currentYear) {
      return `${formattedDate} ${dateYear}`;
    } else {
      return formattedDate;
    }
  }
}
