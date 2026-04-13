"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CommentTree } from "@/components/forum/CommentTree";
import { CommentForm } from "@/components/forum/CommentForm";
import { timeAgoId } from "@/lib/timeAgo";
import { useToast } from "@/components/ui/toast";

interface ThreadAuthor {
  name: string | null;
  avatarUrl: string | null;
}

interface ThreadCategory {
  id: string;
  name: string;
  slug: string;
}

interface Comment {
  id: string;
  content: string;
  author: { name: string | null; avatarUrl: string | null };
  createdAt: string;
  parentId: string | null;
  isDeleted: boolean;
  replies: Comment[];
}

interface ThreadDetail {
  id: string;
  title: string;
  content: string;
  author: ThreadAuthor;
  category: ThreadCategory;
  viewCount: number;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  reactionCount: number;
  userReaction: boolean;
  commentCount: number;
}

export default function ThreadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReacting, setIsReacting] = useState(false);
  const [sanitizedHtml, setSanitizedHtml] = useState("");

  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/forum/threads/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setThread(json.data);
      } else {
        toast({
          title: "Error",
          description: "Thread tidak ditemukan",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Gagal memuat thread",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    if (thread?.content) {
      const clean = DOMPurify.sanitize(thread.content, {
        ALLOWED_TAGS: [
          "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
          "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "code", "pre",
          "img", "table", "thead", "tbody", "tr", "th", "td", "div", "span",
        ],
        ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
      });
      setSanitizedHtml(clean);
    }
  }, [thread?.content]);

  const handleReact = async () => {
    if (!thread) return;
    setIsReacting(true);
    try {
      const res = await fetch(`/api/forum/threads/${params.id}/react`, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setThread((prev) =>
          prev
            ? {
                ...prev,
                reactionCount: json.count,
                userReaction: json.reacted,
              }
            : prev
        );
      }
    } catch {
      // Ignore
    } finally {
      setIsReacting(false);
    }
  };

  const handleAdminAction = async (action: "pin" | "close" | "delete") => {
    if (!thread) return;
    if (action === "delete" && !confirm("Yakin ingin menghapus thread ini?")) return;

    try {
      const res = await fetch(`/api/forum/threads/${params.id}/${action}`, { method: "POST" });
      if (res.ok) {
        if (action === "delete") {
          toast({ title: "Berhasil", description: "Thread dihapus", variant: "success" });
          router.push("/forum");
        } else {
          fetchThread();
          toast({
            title: "Berhasil",
            description: `Thread berhasil di-${action === "pin" ? "sematkan" : "tutup"}`,
            variant: "success",
          });
        }
      }
    } catch {
      toast({
        title: "Gagal",
        description: `Gagal melakukan aksi ${action}`,
        variant: "destructive",
      });
    }
  };

  const handleCommentSubmit = async (content: string) => {
    try {
      const res = await fetch(`/api/forum/threads/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        fetchThread();
        toast({ title: "Berhasil", description: "Komentar ditambahkan", variant: "success" });
      } else {
        const json = await res.json();
        toast({
          title: "Gagal",
          description: json.error?.message || "Gagal menambahkan komentar",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan. Coba lagi nanti.",
        variant: "destructive",
      });
    }
  };

  const handleReply = async (parentId: string) => {
    // This is handled inline in CommentTree via CommentForm
    return;
  };

  const handleNestedCommentSubmit = async (content: string, parentId?: string) => {
    try {
      const res = await fetch(`/api/forum/threads/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      if (res.ok) {
        fetchThread();
        toast({ title: "Berhasil", description: "Balasan ditambahkan", variant: "success" });
      } else {
        const json = await res.json();
        toast({
          title: "Gagal",
          description: json.error?.message || "Gagal menambahkan balasan",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan. Coba lagi nanti.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-100 rounded w-48 animate-pulse" />
        <div className="h-10 bg-gray-100 rounded w-3/4 animate-pulse" />
        <div className="h-40 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-400">Thread tidak ditemukan</p>
        <Link href="/forum">
          <Button className="mt-4">Kembali ke Forum</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/forum" className="hover:text-primary-600">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/forum/${thread.category?.slug}`}
          className="hover:text-primary-600"
        >
          {thread.category?.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 truncate max-w-xs inline-block align-bottom">
          {thread.title}
        </span>
      </nav>

      <div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {thread.isPinned && <Badge variant="success">📌 Disematkan</Badge>}
          {thread.isClosed && <Badge variant="secondary">🔒 Ditutup</Badge>}
          {thread.category && (
            <Badge variant="outline">{thread.category.name}</Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">{thread.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{thread.author?.name || "Anonim"}</span>
          <span>{timeAgoId(thread.createdAt)}</span>
          <span>👁 {thread.viewCount} dilihat</span>
        </div>
      </div>

      <div className="prose prose-sm max-w-none bg-white rounded-xl border border-gray-200 p-6">
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={thread.userReaction ? "default" : "outline"}
          size="sm"
          onClick={handleReact}
          disabled={isReacting}
        >
          👍 {thread.reactionCount} {thread.userReaction ? "(Anda)" : ""}
        </Button>
      </div>

      {session && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400 mr-2">Admin:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAdminAction("pin")}
          >
            {thread.isPinned ? "Unpin" : "Pin"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAdminAction("close")}
          >
            {thread.isClosed ? "Buka" : "Tutup"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleAdminAction("delete")}
          >
            Hapus
          </Button>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <h2 className="text-lg font-semibold mb-4">
          {thread.commentCount || 0} Komentar
        </h2>
        <CommentTree
          comments={thread.comments || []}
          threadId={thread.id}
          isClosed={thread.isClosed}
          onReply={handleReply}
        />
      </div>

      {!thread.isClosed && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-base font-semibold mb-3">Tulis Komentar</h3>
          <CommentForm
            onSubmit={handleNestedCommentSubmit}
            placeholder="Tulis komentar Anda..."
          />
        </div>
      )}
    </div>
  );
}
