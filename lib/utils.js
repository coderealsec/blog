import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Metni URL dostu slug'a dönüştürür
 * @param {string} text - Slug'a dönüştürülecek metin
 * @returns {string} URL dostu slug
 */
export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Tarihi biçimlendirir
 * @param {Date} date - Biçimlendirilecek tarih
 * @returns {string} Biçimlendirilmiş tarih
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Blog içeriğindeki metni kısaltır
 * @param {string} text - Kısaltılacak metin
 * @param {number} maxLength - Maksimum karakter sayısı
 * @returns {string} Kısaltılmış metin
 */
export function truncateText(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  // Maximul uzunluğa kadar olan metni al ve son kelimeyi kırpma
  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex === -1) return truncated + '...';
  return truncated.slice(0, lastSpaceIndex) + '...';
}

/**
 * Kelime sayısına göre tahmini okuma süresini hesaplar
 * @param {string} content - İçerik
 * @param {number} wordsPerMinute - Dakikada okunan kelime sayısı
 * @returns {string} Tahmini okuma süresi
 */
export function calculateReadTime(content, wordsPerMinute = 225) {
  if (!content) return '1 dk';
  
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return `${minutes} dk`;
}

/**
 * Bir nesneyi sınıflandırma
 * @param {Object} obj - Sınıflandırılacak nesne
 * @param {string} key - Sınıflandırma kriteri
 * @returns {Object} Sınıflandırılmış nesne
 */
export function groupBy(obj, key) {
  return obj.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
}

/**
 * Dosya uzantısına göre MIME türünü döndürür
 * @param {string} extension - Dosya uzantısı
 * @returns {string} MIME türü
 */
export function getMimeType(extension) {
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Yüklenen dosyanın geçerli bir görsel olup olmadığını kontrol eder
 * @param {File} file - Kontrol edilecek dosya
 * @returns {boolean} Geçerli görsel mi
 */
export function isValidImage(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Dosya boyutunu okunabilir formata dönüştürür
 * @param {number} bytes - Dosya boyutu (byte)
 * @returns {string} Okunabilir dosya boyutu
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Calculates estimated reading time based on word count
 * @param {string} content - The content to calculate reading time for
 * @param {number} wordsPerMinute - Reading speed in words per minute
 * @returns {number} Estimated reading time in minutes
 */
export function calculateReadingTime(content, wordsPerMinute = 225) {
  if (!content) return 0;
  
  // If HTML content, strip tags
  const text = content.replace(/<[^>]*>/g, '');
  
  // Count words
  const words = text.trim().split(/\s+/).length;
  
  // Calculate reading time
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Checks if a URL is valid
 * @param {string} url - The URL to validate
 * @returns {boolean} True if the URL is valid
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Parses and sanitizes an array of comma-separated tags or categories
 * @param {string} input - Comma-separated list
 * @returns {string[]} Array of trimmed, non-empty values
 */
export function parseCommaSeparatedValues(input) {
  if (!input) return [];
  
  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Strips HTML tags from content and returns plain text
 * @param {string} html - HTML content
 * @returns {string} Plain text without HTML tags
 */
export function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Generates an excerpt from content
 * @param {string} content - The content to generate an excerpt from
 * @param {number} maxLength - Maximum length of the excerpt
 * @returns {string} An excerpt of the content
 */
export function generateExcerpt(content, maxLength = 160) {
  if (!content) return '';
  
  // Strip HTML tags
  const plainText = stripHtml(content);
  
  return truncateText(plainText, maxLength);
}

/**
 * Dosya boyutunu formatlama (bytes -> KB, MB, vs.)
 * @param {number} bytes - Dosya boyutu (byte)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
