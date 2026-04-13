"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateShort, EVENT_STATUS_LABELS, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  category: string | null;
  maxParticipants: number | null;
  _count?: { rsvps: number };
}

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "success" | "destructive" | "warning" {
  switch (status) {
    case "DRAFT":
      return "secondary";
    case "PUBLISHED":
      return "success";
    case "COMPLETED":
      return "default";
    case "CANCELLED":
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
            <Button variant="destructive" size="sm" onClick={onConfirm}>
              Hapus
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminEventPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    eventId: string;
    eventTitle: string;
  }>({ isOpen: false, eventId: "", eventTitle: "" });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events?status=all&limit=100");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = (eventId: string, eventTitle: string) => {
    setDeleteModal({ isOpen: true, eventId, eventTitle });
  };

  const confirmDelete = async () => {
    const { eventId, eventTitle } = deleteModal;
    setDeleteModal((prev) => ({ ...prev, isOpen: false }));
    setActionLoading(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Berhasil",
          description: `Event "${eventTitle}" telah dihapus.`,
          variant: "success",
        });
        fetchEvents();
      } else {
        toast({
          title: "Gagal",
          description: "Gagal menghapus event.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus event.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Event</h1>
          <p className="text-gray-500 mt-1">
            Kelola kegiatan dan acara paguyuban
          </p>
        </div>
        <Link href="/admin/event/baru">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Event Baru
          </Button>
        </Link>
      </div>

      {/* Event List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Memuat data event...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada event</p>
              <Link href="/admin/event/baru" className="mt-4 inline-block">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Event Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Judul
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Tanggal
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Kategori
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        RSVP
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {events.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {event.title}
                            </p>
                            {event.location && (
                              <p className="text-xs text-gray-500 truncate">
                                {event.location}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDateShort(event.startDate)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={getStatusBadgeVariant(event.status)}
                            className="text-xs"
                          >
                            {EVENT_STATUS_LABELS[event.status] || event.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {event.category || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 text-center">
                          {event._count?.rsvps || 0}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/event/${event.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDelete(event.id, event.title)
                              }
                              disabled={actionLoading === event.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate flex-1">
                        {event.title}
                      </p>
                      <Badge
                        variant={getStatusBadgeVariant(event.status)}
                        className="text-xs ml-2 flex-shrink-0"
                      >
                        {EVENT_STATUS_LABELS[event.status] || event.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDateShort(event.startDate)}</span>
                      <span>RSVP: {event._count?.rsvps || 0}</span>
                    </div>
                    {event.category && (
                      <p className="text-sm text-gray-500">
                        Kategori: {event.category}
                      </p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Link href={`/admin/event/${event.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(event.id, event.title)}
                        disabled={actionLoading === event.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Hapus Event"
        message={`Yakin ingin menghapus event "${deleteModal.eventTitle}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={confirmDelete}
        onCancel={() =>
          setDeleteModal((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
