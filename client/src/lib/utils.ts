import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate reading time for a given text
 * @param text The text to calculate reading time for
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(text: string): number {
  if (!text) return 0;
  
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Format a date as a relative time (e.g., "2 days ago")
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) {
    return 'just now';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

/**
 * Extract domain from a URL
 * @param url The URL to extract the domain from
 * @returns Domain string
 */
export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  } catch (e) {
    return url;
  }
}

/**
 * Convert base64 to Blob
 * @param base64 Base64 string
 * @returns Blob object
 */
export function base64ToBlob(base64: string, mimeType: string = 'application/pdf'): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: mimeType });
  return blob;
}

/**
 * Create a URL for a Blob object
 * @param blob Blob object
 * @returns Object URL
 */
export function createBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Show a loading indicator on the page
 */
export function showScreenLoader() {
  const loader = document.getElementById('screen-loader');
  if (loader) {
    loader.style.display = 'flex';
  }
}

/**
 * Hide the loading indicator
 */
export function hideScreenLoader() {
  const loader = document.getElementById('screen-loader');
  if (loader) {
    loader.style.display = 'none';
  }
}
