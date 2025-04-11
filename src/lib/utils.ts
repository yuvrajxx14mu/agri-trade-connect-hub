import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export const responsiveText = {
  xs: "text-xs sm:text-sm",
  sm: "text-sm sm:text-base",
  base: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl md:text-2xl",
  xl: "text-xl sm:text-2xl md:text-3xl",
  "2xl": "text-2xl sm:text-3xl md:text-4xl",
  "3xl": "text-3xl sm:text-4xl md:text-5xl",
  "4xl": "text-4xl sm:text-5xl md:text-6xl",
};

export const responsivePadding = {
  xs: "p-1 sm:p-2",
  sm: "p-2 sm:p-3 md:p-4",
  md: "p-3 sm:p-4 md:p-6",
  lg: "p-4 sm:p-6 md:p-8",
  xl: "p-6 sm:p-8 md:p-10",
};
