"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "@/types";
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

type EventFormData = {
  title: string;
  description: string;
  location?: string;
  locationUrl?: string;
  startDate: string;
  endDate?: string;
  status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
  category?: string;
  maxParticipants?: number | null;
};

export default function AdminEventBaruPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      locationUrl: "",
      startDate: "",
      endDate: "",
      status: "DRAFT",
      category: "",
      maxParticipants: undefined,
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "events");

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

  const onSubmit = async (data: EventFormData) => {
    setLoading(true);
    try {
      let coverImageUrl: string | null = null;

      if (coverImageFile) {
        coverImageUrl = await uploadFile(coverImageFile);
        if (!coverImageUrl) {
          toast({
            title: "Gagal",
            description: "Gagal mengupload gambar cover.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location || undefined,
        locationUrl: data.locationUrl || undefined,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        status: data.status,
        category: data.category || undefined,
        maxParticipants: data.maxParticipants || null,
        coverImageUrl,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        toast({
          title: "Berhasil",
          description: "Event baru telah dibuat.",
          variant: "success",
        });
        router.push("/admin/event");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast({
          title: "Gagal",
          description: errorData.error || "Gagal membuat event.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat event.",
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
        <Link href="/admin/event">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buat Event Baru</h1>
          <p className="text-gray-500 mt-1">
            Isi informasi event yang akan dibuat
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Event <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("title")}
                placeholder="Contoh: Workshop Sensor Integrasi"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                placeholder="Deskripsi lengkap tentang event..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gambar Cover
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="coverImage"
                    className="flex items-center justify-center gap-2 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Pilih gambar...
                    </span>
                  </label>
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {coverImageFile && (
                    <p className="mt-1 text-sm text-gray-500 truncate">
                      {coverImageFile.name}
                    </p>
                  )}
                </div>
                {coverImagePreview && (
                  <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img
                      src={coverImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location & Location URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi
                </label>
                <Input
                  {...register("location")}
                  placeholder="Contoh: Aula Serbaguna XYZ"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.location.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Lokasi (Google Maps)
                </label>
                <Input
                  {...register("locationUrl")}
                  placeholder="https://maps.google.com/..."
                />
                {errors.locationUrl && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.locationUrl.message}
                  </p>
                )}
              </div>
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("startDate")}
                  type="datetime-local"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai (Opsional)
                </label>
                <Input
                  {...register("endDate")}
                  type="datetime-local"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Status & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Dipublikasikan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <Input
                  {...register("category")}
                  placeholder="Contoh: Workshop"
                />
              </div>
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maksimal Peserta (Opsional)
              </label>
              <Input
                {...register("maxParticipants", { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="Kosongkan jika tidak ada batasan"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link href="/admin/event">
                <Button variant="outline" type="button">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={loading || uploadingFile}>
                {loading ? "Menyimpan..." : "Simpan Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
