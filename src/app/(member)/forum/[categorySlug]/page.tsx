"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThreadCard } from "@/components/forum/ThreadCard";
import { ForumSearchBar } from "@/components/forum/ForumSearchBar";

interface Thread {
  id: string;
  title: string;
  author: { name: string | null; avatarUrl: string | null };
  category: { name: string };
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: string;
}

const SORT_LABELS: Record<string, string> = {
  latest: "Terbaru",
  popular: "Terpopuler",
  unanswered: "Belum Dijawab",
};

export default function CategoryThreadPage({ params }: { params: { categorySlug: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sort = searchParams.get("sort") || "latest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [category, setCategory] = useState<{ name: string; slug: string } | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [pinnedThreads, setPinnedThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/forum/threads?categorySlug=${params.categorySlug}&sort=${sort}&page=${page}&limit=20`
        );
        if (res.ok) {
          const json = await res.json();
          const allThreads = json.data || [];
          const pinned = allThreads.filter((t: Thread) => t.isPinned);
          const normal = allThreads.filter((t: Thread) => !t.isPinned);
          setPinnedThreads(pinned);
          setThreads(normal);
          setTotalPages(json.meta?.totalPages || 1);
          if (allThreads.length > 0 && allThreads[0].category) {
            setCategory(allThreads[0].category);
          }
        }
      } catch {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.categorySlug, sort, page]);

  const handleSortChange = (newSort: string) => {
    router.push(`/forum/${params.categorySlug}?sort=${newSort}&page=1`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/forum/${params.categorySlug}?sort=${sort}&page=${newPage}`);
  };

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/forum" className="hover:text-primary-600">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{category?.name || params.categorySlug}</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{category?.name || params.categorySlug}</h1>
        <ForumSearchBar />
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {Object.entries(SORT_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleSortChange(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              sort === key
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : pinnedThreads.length === 0 && threads.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">Belum ada thread di kategori ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pinnedThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              id={thread.id}
              title={thread.title}
              authorName={thread.author?.name || null}
              authorAvatar={thread.author?.avatarUrl || null}
              categoryName={thread.category?.name || ""}
              commentCount={thread.commentCount}
              reactionCount={thread.reactionCount}
              viewCount={thread.viewCount}
              isPinned={thread.isPinned}
              isClosed={thread.isClosed}
              createdAt={thread.createdAt}
            />
          ))}
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              id={thread.id}
              title={thread.title}
              authorName={thread.author?.name || null}
              authorAvatar={thread.author?.avatarUrl || null}
              categoryName={thread.category?.name || ""}
              commentCount={thread.commentCount}
              reactionCount={thread.reactionCount}
              viewCount={thread.viewCount}
              isPinned={thread.isPinned}
              isClosed={thread.isClosed}
              createdAt={thread.createdAt}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Sebelumnya
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary-500 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
