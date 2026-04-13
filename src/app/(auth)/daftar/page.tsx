"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/types";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      childName: "",
      specialNeedType: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone || undefined,
          childName: data.childName || undefined,
          specialNeedType: data.specialNeedType || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Pendaftaran gagal. Silakan coba lagi.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pendaftaran Berhasil!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800 font-medium">Akun Anda sedang menunggu verifikasi admin.</p>
            <p className="text-sm text-blue-700 mt-1">
              Anda akan menerima notifikasi setelah akun diverifikasi. Silakan periksa email Anda secara berkala.
            </p>
          </div>
          <Button onClick={() => router.push("/login")} fullWidth>
            Kembali ke Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Anggota Baru</CardTitle>
        <CardDescription>
          Isi formulir di bawah untuk mendaftar sebagai anggota paguyuban.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Nama lengkap Anda"
              {...register("name")}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              {...register("email")}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              {...register("password")}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              No. Telepon <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              {...register("phone")}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Anak <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <Input
              id="childName"
              type="text"
              placeholder="Nama anak Anda"
              {...register("childName")}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="specialNeedType" className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Kebutuhan Khusus <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <Input
              id="specialNeedType"
              type="text"
              placeholder="Contoh: Autisme, ADHD, dll."
              {...register("specialNeedType")}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? "Mendaftar..." : "Daftar"}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary-500 hover:underline font-medium">
              Masuk di sini
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
