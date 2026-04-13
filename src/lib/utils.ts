import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatRupiah(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDateIndo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "Baru saja";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} minggu lalu`;
  return formatDateShort(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export const CATEGORY_COLORS: Record<string, string> = {
  webinar: "bg-blue-100 text-blue-800",
  workshop: "bg-purple-100 text-purple-800",
  "pertemuan-rutin": "bg-green-100 text-green-800",
  outing: "bg-yellow-100 text-yellow-800",
  "bakti-sosial": "bg-red-100 text-red-800",
};

export const TRANSACTION_CATEGORY_LABELS: Record<string, string> = {
  MEMBERSHIP_FEE: "Iuran Anggota",
  DONATION: "Donasi",
  EVENT_INCOME: "Pemasukan Event",
  EVENT_EXPENSE: "Pengeluaran Event",
  OPERATIONAL: "Operasional",
  SOCIAL_PROGRAM: "Program Sosial",
  OTHER: "Lainnya",
};

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
  SUSPENDED: "Ditangguhkan",
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Dipublikasikan",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};
