"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { Users, Plus, Trash2, Edit2, Save, X, Upload } from "lucide-react";

const orgProfileSchema = z.object({
  name: z.string().min(1, "Nama organisasi wajib"),
  tagline: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  history: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  foundedYear: z.coerce.number().optional().nullable(),
});

const boardMemberSchema = z.object({
  name: z.string().min(1, "Nama wajib"),
  position: z.string().min(1, "Jabatan wajib"),
  period: z.string().optional(),
  order: z.coerce.number().default(0),
});

type OrgProfileForm = z.infer<typeof orgProfileSchema>;
type BoardMemberForm = z.infer<typeof boardMemberSchema>;

interface BoardMember {
  id: string;
  name: string;
  position: string;
  period: string | null;
  photoUrl: string | null;
  order: number;
}

type TabType = "profile" | "board";

export default function AdminOrganizationProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(false);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const { toast } = useToast();

  const orgForm = useForm<OrgProfileForm>({
    resolver: zodResolver(orgProfileSchema),
    defaultValues: {
      name: "",
      tagline: "",
      vision: "",
      mission: "",
      history: "",
      address: "",
      email: "",
      phone: "",
      foundedYear: null,
    },
  });

  const boardForm = useForm<BoardMemberForm>({
    resolver: zodResolver(boardMemberSchema),
    defaultValues: {
      name: "",
      position: "",
      period: "",
      order: 0,
    },
  });

  const editBoardForm = useForm<BoardMemberForm>({
    resolver: zodResolver(boardMemberSchema),
    defaultValues: {
      name: "",
      position: "",
      period: "",
      order: 0,
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [orgRes, boardRes] = await Promise.allSettled([
          fetch("/api/admin/organization"),
          fetch("/api/admin/board-members"),
        ]);

        if (orgRes.status === "fulfilled" && orgRes.value.ok) {
          const json = await orgRes.value.json();
          if (json.success && json.data) {
            const d = json.data;
            orgForm.reset({
              name: d.name || "",
              tagline: d.tagline || "",
              vision: d.vision || "",
              mission: d.mission || "",
              history: d.history || "",
              address: d.address || "",
              email: d.email || "",
              phone: d.phone || "",
              foundedYear: d.foundedYear || null,
            });
          }
        }

        if (boardRes.status === "fulfilled" && boardRes.value.ok) {
          const json = await boardRes.value.json();
          if (json.success && json.data) {
            setBoardMembers(json.data);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    }

    fetchData();
  }, [orgForm]);

  const handleOrgSubmit = async (data: OrgProfileForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "Berhasil", description: "Profil organisasi berhasil diperbarui." });
      } else {
        toast({ title: "Gagal", description: json.error?.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat menyimpan.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "board-members");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.url) return data.url;
    return null;
  };

  const handleBoardSubmit = async (data: BoardMemberForm) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("position", data.position);
      if (data.period) formData.append("period", data.period);
      formData.append("order", data.order.toString());

      const res = await fetch("/api/admin/board-members", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setBoardMembers((prev) => [...prev, json.data]);
        setShowAddBoard(false);
        boardForm.reset();
        toast({ title: "Berhasil", description: "Pengurus berhasil ditambahkan." });
      } else {
        toast({ title: "Gagal", description: json.error?.message || "Terjadi kesalahan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan saat menyimpan.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBoardDelete = async (id: string) => {
    if (!confirm("Hapus pengurus ini?")) return;
    try {
      const res = await fetch(`/api/admin/board-members/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setBoardMembers((prev) => prev.filter((m) => m.id !== id));
        toast({ title: "Berhasil", description: "Pengurus berhasil dihapus." });
      }
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan.", variant: "destructive" });
    }
  };

  const handleBoardEdit = async (id: string, data: BoardMemberForm) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("position", data.position);
      if (data.period) formData.append("period", data.period);
      formData.append("order", data.order.toString());

      const res = await fetch(`/api/admin/board-members/${id}`, {
        method: "PUT",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setBoardMembers((prev) =>
          prev.map((m) => (m.id === id ? json.data : m))
        );
        setEditingBoardId(null);
        toast({ title: "Berhasil", description: "Data pengurus berhasil diperbarui." });
      }
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBoardPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    boardId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handlePhotoUpload(file);
    if (url) {
      const res = await fetch(`/api/admin/board-members/${boardId}/photo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: url }),
      });
      const json = await res.json();
      if (json.success) {
        setBoardMembers((prev) =>
          prev.map((m) => (m.id === boardId ? { ...m, photoUrl: url } : m))
        );
        toast({ title: "Berhasil", description: "Foto pengurus berhasil diperbarui." });
      }
    }
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profil Umum", icon: <Users className="h-4 w-4" /> },
    { key: "board", label: "Pengurus", icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profil Organisasi</h1>
        <p className="text-gray-500 mt-1">Kelola informasi dan struktur organisasi paguyuban</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.key
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Data Organisasi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={orgForm.handleSubmit(handleOrgSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Organisasi *
                  </label>
                  <Input {...orgForm.register("name")} />
                  {orgForm.formState.errors.name && (
                    <p className="text-red-500 text-xs mt-1">{orgForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <Input {...orgForm.register("tagline")} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visi
                </label>
                <textarea
                  {...orgForm.register("vision")}
                  rows={3}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Misi
                </label>
                <textarea
                  {...orgForm.register("mission")}
                  rows={3}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sejarah
                </label>
                <textarea
                  {...orgForm.register("history")}
                  rows={4}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input {...orgForm.register("email")} type="email" />
                  {orgForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1">{orgForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telepon
                  </label>
                  <Input {...orgForm.register("phone")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tahun Berdiri
                  </label>
                  <Input {...orgForm.register("foundedYear")} type="number" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat
                </label>
                <textarea
                  {...orgForm.register("address")}
                  rows={2}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>

              <Button type="submit" disabled={loading} fullWidth={false}>
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Board Members Tab */}
      {activeTab === "board" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Daftar Pengurus</h2>
            <Button onClick={() => setShowAddBoard(!showAddBoard)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Tambah Pengurus
            </Button>
          </div>

          {/* Add Board Member Form */}
          {showAddBoard && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tambah Pengurus Baru</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={boardForm.handleSubmit(handleBoardSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama *
                      </label>
                      <Input {...boardForm.register("name")} />
                      {boardForm.formState.errors.name && (
                        <p className="text-red-500 text-xs mt-1">{boardForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jabatan *
                      </label>
                      <Input {...boardForm.register("position")} />
                      {boardForm.formState.errors.position && (
                        <p className="text-red-500 text-xs mt-1">{boardForm.formState.errors.position.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Periode
                      </label>
                      <Input {...boardForm.register("period")} placeholder="cth: 2024-2026" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Urutan
                      </label>
                      <Input {...boardForm.register("order")} type="number" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Simpan
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddBoard(false)}>
                      <X className="h-4 w-4 mr-1" />
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Board Members List */}
          {boardMembers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Belum ada pengurus terdaftar
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {boardMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    {editingBoardId === member.id ? (
                      <form
                        onSubmit={editBoardForm.handleSubmit((data) => handleBoardEdit(member.id, data))}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                            <Input {...editBoardForm.register("name")} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                            <Input {...editBoardForm.register("position")} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
                            <Input {...editBoardForm.register("period")} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                            <Input {...editBoardForm.register("order")} type="number" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={loading} size="sm">
                            <Save className="h-4 w-4 mr-1" />
                            Simpan
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingBoardId(null)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Batal
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.position}</p>
                            {member.period && (
                              <Badge variant="secondary" className="mt-1">
                                {member.period}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer" title="Ganti foto">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleBoardPhotoChange(e, member.id)}
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingBoardId(member.id);
                              editBoardForm.reset({
                                name: member.name,
                                position: member.position,
                                period: member.period || "",
                                order: member.order,
                              });
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleBoardDelete(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
