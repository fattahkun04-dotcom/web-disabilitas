import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { timeAgoId } from "@/lib/timeAgo";

interface ThreadCardProps {
  id: string;
  title: string;
  authorName: string | null;
  authorAvatar: string | null;
  categoryName: string;
  commentCount: number;
  reactionCount: number;
  viewCount: number;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: Date | string;
}

export function ThreadCard({
  id,
  title,
  authorName,
  authorAvatar,
  categoryName,
  commentCount,
  reactionCount,
  viewCount,
  isPinned,
  isClosed,
  createdAt,
}: ThreadCardProps) {
  const initial = authorName?.charAt(0).toUpperCase() || "?";
  const truncatedTitle = title.length > 80 ? title.slice(0, 80) + "..." : title;

  return (
    <Link href={`/forum/thread/${id}`}>
      <Card
        className={`transition-all hover:shadow-md cursor-pointer group ${
          isPinned ? "bg-green-50 border-green-200" : ""
        } ${isClosed ? "opacity-70 bg-gray-50" : ""}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {isPinned && (
                  <span className="text-sm" title="Disematkan">
                    📌
                  </span>
                )}
                {isClosed && (
                  <span className="text-sm" title="Ditutup">
                    🔒
                  </span>
                )}
                <h3
                  className={`font-semibold text-base group-hover:text-primary-600 transition-colors truncate ${
                    isClosed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {truncatedTitle}
                </h3>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {authorName || "Anonim"} di{" "}
                <Badge variant="outline" className="text-xs font-normal">
                  {categoryName}
                </Badge>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              💬 {commentCount}
            </span>
            <span className="flex items-center gap-1">
              👍 {reactionCount}
            </span>
            <span className="flex items-center gap-1">
              👁 {viewCount}
            </span>
            <span className="ml-auto">{timeAgoId(createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
