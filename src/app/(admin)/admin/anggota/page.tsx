"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  formatRupiah,
  formatDateShort,
  MEMBER_STATUS_LABELS,
  cn,
} from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

interface Member {
  id: string;
  status: string;
  joinedAt: string;
  city: string | null;
  phone: string | null;
  childName: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_TABS = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "INACTIVE", label: "Nonaktif" },
  { value: "SUSPENDED", label: "Ditangguhkan" },
];

function getStatusBadgeVariant(status: string): "warning" | "success" | "secondary" | "destructive" {
  switch (status) {
    case "PENDING":
      return "warning";
    case "ACTIVE":
      return "success";
    case "INACTIVE":
      return "secondary";
    case "SUSPENDED":
      return "destructive";
    default:
      return "secondary";
  }
}

function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{message}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Batal
            </Button>
            <Button size="sm" onClick={onConfirm}>
              Ya, Konfirmasi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminAnggotaPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMembers = useCallback(
    async (page: number, status: string, search: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
          status,
        });
        if (search) params.set("search", search);

        const res = await fetch(`/api/admin/members?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMembers(pagination.page, activeTab, searchQuery);
  }, [pagination.page, activeTab, searchQuery, fetchMembers]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleVerify = async (memberId: string, memberName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Verifikasi Anggota",
      message: `Yakin ingin memverifikasi "${memberName}"? Anggota akan berstatus Aktif.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setActionLoading(memberId);
        try {
          const res = await fetch(`/api/admin/members/${memberId}/verify`, {
            method: "POST",
          });
          if (res.ok) {
            toast({
              title: "Berhasil",
              description: `${memberName} telah diverifikasi.`,
              variant: "success",
            });
            fetchMembers(pagination.page, activeTab, searchQuery);
          } else {
            toast({
              title: "Gagal",
              description: "Gagal memverifikasi anggota.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Terjadi kesalahan saat memverifikasi.",
            variant: "destructive",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleToggleStatus = async (member: Member) => {
    const newStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const actionText = newStatus === "ACTIVE" ? "mengaktifkan" : "menonaktifkan";

    setConfirmModal({
      isOpen: true,
      title: newStatus === "ACTIVE" ? "Aktifkan Anggota" : "Nonaktifkan Anggota",
      message: `Yakin ingin ${actionText} "${member.user.name}"?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setActionLoading(member.id);
        try {
          const res = await fetch(`/api/admin/members/${member.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          });
          if (res.ok) {
            toast({
              title: "Berhasil",
              description: `Status ${member.user.name} telah diubah menjadi ${MEMBER_STATUS_LABELS[newStatus]}.`,
              variant: "success",
            });
            fetchMembers(pagination.page, activeTab, searchQuery);
          } else {
            toast({
              title: "Gagal",
              description: "Gagal mengubah status anggota.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Terjadi kesalahan saat mengubah status.",
            variant: "destructive",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Anggota</h1>
        <p className="text-gray-500 mt-1">
          Kelola verifikasi dan status anggota paguyuban
        </p>
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.value
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 sm:ml-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Cari nama atau email..."
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button size="sm" onClick={handleSearch}>
                Cari
              </Button>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Memuat data anggota...</p>
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada data anggota</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Nama
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Email
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Kota
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Tanggal Gabung
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900">
                            {member.user.name}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {member.user.email}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={getStatusBadgeVariant(member.status)}
                            className="text-xs"
                          >
                            {MEMBER_STATUS_LABELS[member.status] || member.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {member.city || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDateShort(member.joinedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            {member.status === "PENDING" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleVerify(member.id, member.user.name)
                                }
                                disabled={actionLoading === member.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Verifikasi
                              </Button>
                            )}
                            {member.status !== "PENDING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(member)}
                                disabled={actionLoading === member.id}
                              >
                                {member.status === "ACTIVE" ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-1" />
                                    Nonaktifkan
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Aktifkan
                                  </>
                                )}
                              </Button>
                            )}
                            <Link href={`/admin/anggota/${member.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        {member.user.name}
                      </p>
                      <Badge
                        variant={getStatusBadgeVariant(member.status)}
                        className="text-xs"
                      >
                        {MEMBER_STATUS_LABELS[member.status] || member.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{member.city || "-"}</span>
                      <span>{formatDateShort(member.joinedAt)}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {member.status === "PENDING" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleVerify(member.id, member.user.name)
                          }
                          disabled={actionLoading === member.id}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Verifikasi
                        </Button>
                      )}
                      {member.status !== "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(member)}
                          disabled={actionLoading === member.id}
                          className="flex-1"
                        >
                          {member.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 hidden sm:block">
                    Menampilkan{" "}
                    {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    dari {pagination.total} anggota
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 5) },
                      (_, i) => {
                        let pageNum: number;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pagination.page === pageNum ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="min-w-[2.5rem]"
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
