"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { timeAgoId } from "@/lib/timeAgo";

interface SearchResult {
  id: string;
  title: string;
  category: string;
  author: string | null;
  createdAt: string;
  contentSnippet: string;
}

export function ForumSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/forum/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
          setIsOpen(true);
        }
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <Input
        type="text"
        placeholder="Cari thread..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 3 && setIsOpen(true)}
        className="pr-10"
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}
      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto shadow-lg">
          <ul className="divide-y divide-gray-100">
            {results.map((result) => (
              <li key={result.id}>
                <Link
                  href={`/forum/thread/${result.id}`}
                  className="block p-3 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <p className="font-medium text-sm text-gray-900 line-clamp-1">{result.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{result.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{timeAgoId(result.createdAt)}</span>
                  </div>
                  {result.contentSnippet && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.contentSnippet}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {isOpen && query.length >= 3 && results.length === 0 && !isLoading && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <div className="p-4 text-center text-sm text-gray-500">
            Tidak ada hasil untuk &quot;{query}&quot;
          </div>
        </Card>
      )}
    </div>
  );
}
