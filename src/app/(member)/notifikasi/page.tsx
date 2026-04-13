"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { timeAgoId } from "@/lib/timeAgo";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

const NOTIFICATION_ICONS: Record<string, string> = {
  NEW_REPLY: "💬",
  THREAD_PINNED: "📌",
  MEMBER_VERIFIED: "✅",
  EVENT_REMINDER: "📅",
};

export default function NotificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
        setUnreadCount(json.meta?.unreadCount || 0);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast({ title: "Berhasil", description: "Semua notifikasi telah ditandai dibaca", variant: "success" });
      }
    } catch {
      toast({
        title: "Gagal",
        description: "Gagal menandai semua notifikasi",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, { method: "PUT" });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Ignore
      }
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifikasi</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} notifikasi belum dibaca
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Tidak ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`w-full text-left p-4 rounded-xl border transition-colors hover:bg-gray-50 ${
                notif.isRead
                  ? "bg-white border-gray-100"
                  : "bg-blue-50/50 border-blue-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">
                  {NOTIFICATION_ICONS[notif.type] || "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                    <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgoId(notif.createdAt)}</p>
                </div>
                {notif.linkUrl && (
                  <span className="text-xs text-primary-600 flex-shrink-0">Lihat →</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
