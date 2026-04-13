"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CategoryCard } from "@/components/forum/CategoryCard";
import { ThreadCard } from "@/components/forum/ThreadCard";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  threadCount: number;
}

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

export default function ForumHomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, threadRes] = await Promise.all([
          fetch("/api/forum/categories"),
          fetch("/api/forum/threads?sort=latest&limit=5"),
        ]);
        if (catRes.ok) {
          const catJson = await catRes.json();
          setCategories(catJson.data || []);
        }
        if (threadRes.ok) {
          const threadJson = await threadRes.json();
          setThreads(threadJson.data || []);
        }
      } catch {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forum Diskusi</h1>
        <Link href="/forum/thread/baru">
          <Button>Buat Thread Baru</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            id={cat.id}
            name={cat.name}
            slug={cat.slug}
            description={cat.description}
            icon={cat.icon}
            threadCount={cat.threadCount}
          />
        ))}
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Thread Terbaru</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Belum ada thread</p>
            <p className="text-sm">Jadilah yang pertama membuat thread</p>
          </div>
        ) : (
          <div className="space-y-3">
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
      </section>
    </div>
  );
}
