import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
  childName: z.string().optional(),
  specialNeedType: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter"),
  token: z.string(),
});

// ─── Event Schemas ────────────────────────────────────────

export const eventSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  location: z.string().optional(),
  locationUrl: z.string().url("URL lokasi tidak valid").optional().or(z.literal("")),
  startDate: z.string().datetime("Tanggal mulai tidak valid"),
  endDate: z.string().datetime().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"]).default("DRAFT"),
  category: z.string().optional(),
  maxParticipants: z.coerce.number().positive().optional().or(z.literal(null)),
});

// ─── Budget Schemas ───────────────────────────────────────

export const budgetSchema = z.object({
  date: z.string().datetime("Tanggal tidak valid"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.enum([
    "MEMBERSHIP_FEE",
    "DONATION",
    "EVENT_INCOME",
    "EVENT_EXPENSE",
    "OPERATIONAL",
    "SOCIAL_PROGRAM",
    "OTHER",
  ]),
  description: z.string().min(3, "Deskripsi minimal 3 karakter"),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
});

// ─── Member Schemas ───────────────────────────────────────

export const updateMemberSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  childName: z.string().optional(),
  childBirthYear: z.coerce.number().optional(),
  specialNeedType: z.string().optional(),
  specialNeedNotes: z.string().optional(),
});

export const verifyMemberSchema = z.object({
  adminId: z.string(),
});

// ─── Forum Schemas ────────────────────────────────────────

export const threadSchema = z.object({
  title: z.string().min(10, "Judul minimal 10 karakter").max(150, "Judul maksimal 150 karakter"),
  content: z.string().min(20, "Konten minimal 20 karakter"),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Komentar tidak boleh kosong"),
  parentId: z.string().optional(),
});

// ─── Organization Schemas ─────────────────────────────────

export const orgProfileSchema = z.object({
  name: z.string().min(1, "Nama organisasi wajib"),
  tagline: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  history: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  foundedYear: z.coerce.number().optional().or(z.literal(null)),
});

export const boardMemberSchema = z.object({
  name: z.string().min(1, "Nama wajib"),
  position: z.string().min(1, "Jabatan wajib"),
  period: z.string().optional(),
  order: z.coerce.number().default(0),
});
