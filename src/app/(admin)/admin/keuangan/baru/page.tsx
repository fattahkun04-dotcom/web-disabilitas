"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { TRANSACTION_CATEGORY_LABELS } from "@/lib/utils";

type BudgetFormData = {
  date: string;
  type: "INCOME" | "EXPENSE";
  category:
    | "MEMBERSHIP_FEE"
    | "DONATION"
    | "EVENT_INCOME"
    | "EVENT_EXPENSE"
    | "OPERATIONAL"
    | "SOCIAL_PROGRAM"
    | "OTHER";
  description: string;
  amount: number;
};

const TRANSACTION_CATEGORIES = [
  { value: "MEMBERSHIP_FEE", label: TRANSACTION_CATEGORY_LABELS["MEMBERSHIP_FEE"] },
  { value: "DONATION", label: TRANSACTION_CATEGORY_LABELS["DONATION"] },
  { value: "EVENT_INCOME", label: TRANSACTION_CATEGORY_LABELS["EVENT_INCOME"] },
  { value: "EVENT_EXPENSE", label: TRANSACTION_CATEGORY_LABELS["EVENT_EXPENSE"] },
  { value: "OPERATIONAL", label: TRANSACTION_CATEGORY_LABELS["OPERATIONAL"] },
  { value: "SOCIAL_PROGRAM", label: TRANSACTION_CATEGORY_LABELS["SOCIAL_PROGRAM"] },
  { value: "OTHER", label: TRANSACTION_CATEGORY_LABELS["OTHER"] },
];

export default function AdminKeuanganBaruPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 16),
      type: "EXPENSE",
      category: "OTHER",
      description: "",
      amount: 0,
    },
  });

  const watchedType = watch("type");

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "budget");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const onSubmit = async (data: BudgetFormData) => {
    setLoading(true);
    try {
      let attachmentUrl: string | null = null;

      if (attachmentFile) {
        attachmentUrl = await uploadFile(attachmentFile);
        if (!attachmentUrl) {
          toast({
            title: "Gagal",
            description: "Gagal mengupload lampiran.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const budgetData = {
        date: new Date(data.date).toISOString(),
        type: data.type,
        category: data.category,
        description: data.description,
        amount: data.amount,
        attachmentUrl,
      };

      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetData),
      });

      if (res.ok) {
        toast({
          title: "Berhasil",
          description: "Transaksi baru telah ditambahkan.",
          variant: "success",
        });
        router.push("/admin/keuangan");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast({
          title: "Gagal",
          description: errorData.error || "Gagal menambahkan transaksi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan transaksi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/keuangan">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Transaksi Baru</h1>
          <p className="text-gray-500 mt-1">
            Catat pemasukan atau pengeluaran paguyuban
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Transaksi <span className="text-red-500">*</span>
              </label>
              <select
                {...register("type")}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="INCOME">Pemasukan</option>
                <option value="EXPENSE">Pengeluaran</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                {...register("category")}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                {TRANSACTION_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                placeholder="Deskripsi transaksi..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah (Rp) <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("amount", { valueAsNumber: true })}
                type="number"
                min={0}
                step={1000}
                placeholder="0"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <Input {...register("date")} type="datetime-local" />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lampiran (Opsional)
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="attachment"
                    className="flex items-center justify-center gap-2 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Pilih file...
                    </span>
                  </label>
                  <input
                    id="attachment"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {attachmentFile && (
                    <p className="mt-1 text-sm text-gray-500 truncate">
                      {attachmentFile.name}
                    </p>
                  )}
                </div>
                {attachmentPreview && attachmentFile?.type.startsWith("image") && (
                  <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img
                      src={attachmentPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link href="/admin/keuangan">
                <Button variant="outline" type="button">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={loading || uploadingFile}>
                {loading ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
