"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/toast";
import { MEMBER_STATUS_LABELS } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Baby,
  Calendar,
  FileText,
  Loader2,
  Save,
  Shield,
} from "lucide-react";

const profileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  childName: z.string().optional(),
  childBirthYear: z.coerce.number().optional(),
  specialNeedType: z.string().optional(),
  specialNeedNotes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface MemberData {
  id: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  joinedAt: string;
  status: string;
  childName: string | null;
  childBirthYear: number | null;
  specialNeedType: string | null;
  specialNeedNotes: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
  };
}

export default function ProfilPage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState<MemberData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/member/profile");
        if (res.ok) {
          const data = await res.json();
          setMember(data.member);
          reset({
            phone: data.member.phone || "",
            address: data.member.address || "",
            city: data.member.city || "",
            province: data.member.province || "",
            childName: data.member.childName || "",
            childBirthYear: data.member.childBirthYear || undefined,
            specialNeedType: data.member.specialNeedType || "",
            specialNeedNotes: data.member.specialNeedNotes || "",
          });
        } else if (res.status === 404) {
          toast({
            title: "Profil belum dibuat",
            description: "Silakan hubungi admin untuk aktivasi keanggotaan.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Gagal memuat profil",
          description: "Terjadi kesalahan saat memuat data profil.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [reset, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setMember(result.member);
        toast({
          title: "Profil berhasil diperbarui",
          description: "Data profil Anda telah disimpan.",
          variant: "success",
        });
      } else {
        const errorData = await res.json().catch(() => null);
        toast({
          title: "Gagal memperbarui profil",
          description: errorData?.error || "Terjadi kesalahan saat menyimpan data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Gagal memperbarui profil",
        description: "Terjadi kesalahan jaringan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Profil Tidak Ditemukan
            </h2>
            <p className="text-gray-500">
              Silakan hubungi admin untuk aktivasi keanggotaan Anda.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-500 mt-1">
            Kelola data diri dan informasi anak Anda
          </p>
        </div>
        <Badge
          variant={member.status === "ACTIVE" ? "success" : "warning"}
          className="text-sm px-3 py-1"
        >
          {MEMBER_STATUS_LABELS[member.status] || member.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Read-only User Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Akun</CardTitle>
            <CardDescription>Data akun yang tidak dapat diubah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <User className="h-4 w-4" />
                Nama Lengkap
              </label>
              <p className="mt-1 text-gray-900 font-medium">{member.user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="mt-1 text-gray-900">{member.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </label>
              <p className="mt-1 text-gray-900 capitalize">{member.user.role.toLowerCase()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bergabung Sejak
              </label>
              <p className="mt-1 text-gray-900">
                {new Date(member.joinedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Editable Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Data Profil</CardTitle>
            <CardDescription>
              Lengkapi informasi kontak dan data anak Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Informasi Kontak
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <Input
                      type="tel"
                      placeholder="0812xxxxxxxxx"
                      className={errors.phone ? "border-red-500 focus:ring-red-500" : ""}
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kota
                    </label>
                    <Input
                      placeholder="Kota/Kabupaten"
                      className={errors.city ? "border-red-500 focus:ring-red-500" : ""}
                      {...register("city")}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provinsi
                  </label>
                  <Input
                    placeholder="Provinsi"
                    className={errors.province ? "border-red-500 focus:ring-red-500" : ""}
                    {...register("province")}
                  />
                  {errors.province && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.province.message}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Alamat
                  </label>
                  <textarea
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                    rows={3}
                    placeholder="Alamat lengkap"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Child Information */}
              <div className="pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  Data Anak
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Anak
                    </label>
                    <Input
                      placeholder="Nama anak"
                      className={errors.childName ? "border-red-500 focus:ring-red-500" : ""}
                      {...register("childName")}
                    />
                    {errors.childName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.childName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tahun Lahir
                    </label>
                    <Input
                      type="number"
                      placeholder="2018"
                      min={2000}
                      max={new Date().getFullYear()}
                      className={errors.childBirthYear ? "border-red-500 focus:ring-red-500" : ""}
                      {...register("childBirthYear")}
                    />
                    {errors.childBirthYear && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.childBirthYear.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kebutuhan Khusus
                  </label>
                  <Input
                    placeholder="Contoh: Autisme, ADHD, Down Syndrome"
                    className={errors.specialNeedType ? "border-red-500 focus:ring-red-500" : ""}
                    {...register("specialNeedType")}
                  />
                  {errors.specialNeedType && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.specialNeedType.message}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Catatan Kebutuhan Khusus
                  </label>
                  <textarea
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                    rows={3}
                    placeholder="Catatan tambahan mengenai kebutuhan khusus anak"
                    {...register("specialNeedNotes")}
                  />
                  {errors.specialNeedNotes && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.specialNeedNotes.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-5 border-t border-gray-200 flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
