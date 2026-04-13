"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const createThreadSchema = z.object({
  title: z.string().min(10, "Judul minimal 10 karakter").max(150, "Judul maksimal 150 karakter"),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  content: z.string().min(20, "Konten minimal 20 karakter"),
});

type CreateThreadData = z.infer<typeof createThreadSchema>;

interface Category {
  id: string;
  name: string;
}

function insertText(
  textarea: HTMLTextAreaElement | null,
  before: string,
  after: string = ""
) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = before + selected + after;
  const newValue =
    textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.value = newValue;
  textarea.focus();
  textarea.selectionStart = start + before.length;
  textarea.selectionEnd = start + before.length + selected.length;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export default function CreateThreadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateThreadData>({
    resolver: zodResolver(createThreadSchema),
    defaultValues: { title: "", categoryId: "", content: "" },
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/forum/categories");
        if (res.ok) {
          const json = await res.json();
          setCategories(json.data || []);
        }
      } catch {
        // Ignore
      }
    }
    fetchCategories();
  }, []);

  const handleBold = () => insertText(contentRef.current, "**", "**");
  const handleItalic = () => insertText(contentRef.current, "_", "_");
  const handleBullet = () => insertText(contentRef.current, "\n- ", "");
  const handleLink = () => {
    if (contentRef.current) {
      const selected =
        contentRef.current.value.substring(
          contentRef.current.selectionStart,
          contentRef.current.selectionEnd
        ) || "teks";
      insertText(contentRef.current, `[${selected}](url)`);
    }
  };

  const onSubmit = async (data: CreateThreadData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        toast({ title: "Berhasil", description: "Thread berhasil dibuat", variant: "success" });
        router.push(`/forum/thread/${json.data.id}`);
      } else {
        const json = await res.json();
        toast({
          title: "Gagal",
          description: json.error?.message || "Gagal membuat thread",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan. Coba lagi nanti.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/forum" className="hover:text-primary-600">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Buat Thread Baru</span>
      </nav>

      <h1 className="text-2xl font-bold">Buat Thread Baru</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Judul
          </label>
          <Input
            id="title"
            placeholder="Tulis judul thread..."
            className={cn(errors.title && "border-red-300")}
            {...register("title")}
          />
          {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className={cn(
              "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              errors.categoryId && "border-red-300"
            )}
          >
            <option value="">Pilih kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Konten
          </label>
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200 mb-2">
            <button
              type="button"
              onClick={handleBold}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 font-bold text-sm"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={handleItalic}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 italic text-sm"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={handleBullet}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 text-sm"
              title="Bullet List"
            >
              &#8226;
            </button>
            <button
              type="button"
              onClick={handleLink}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-600 text-sm"
              title="Link"
            >
              🔗
            </button>
          </div>
          <textarea
            ref={contentRef}
            id="content"
            rows={10}
            placeholder="Tulis konten thread..."
            onChange={(e) => {
              register("content").onChange(e);
            }}
            onBlur={register("content").onBlur}
            name={register("content").name}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y",
              errors.content && "border-red-300"
            )}
          />
          {errors.content && (
            <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/forum">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Membuat..." : "Buat Thread"}
          </Button>
        </div>
      </form>
    </div>
  );
}
