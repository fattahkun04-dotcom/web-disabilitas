export function timeAgoId(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(seconds / 86400);
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(seconds / 604800);
  if (weeks < 4) return `${weeks} minggu lalu`;
  const months = Math.floor(seconds / 2592000);
  if (months < 12) return `${months} bulan lalu`;
  const years = Math.floor(seconds / 31536000);
  return `${years} tahun lalu`;
}
