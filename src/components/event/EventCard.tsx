"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { formatDateIndo, CATEGORY_COLORS, EVENT_STATUS_LABELS } from "@/lib/utils";

interface EventCardProps {
  slug: string;
  title: string;
  category: string;
  date: string | Date;
  location: string;
  status: string;
  coverImage?: string | null;
}

export function EventCard({
  slug,
  title,
  category,
  date,
  location,
  status,
  coverImage,
}: EventCardProps) {
  const categoryLabel = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const categoryColor = CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800";
  const isCompleted = status === "COMPLETED";
  const isPublished = status === "PUBLISHED";

  return (
    <Link href={`/event/${slug}`} className="block group">
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {/* Cover Image */}
        <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-12 w-12 text-primary-400" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {isCompleted ? (
              <Badge variant="secondary">Selesai</Badge>
            ) : isPublished ? (
              <Badge variant="success">Dipublikasikan</Badge>
            ) : (
              <Badge variant="outline">{EVENT_STATUS_LABELS[status] || status}</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardHeader className="pb-2">
          <Badge className={`w-fit capitalize mb-2 ${categoryColor}`}>
            {categoryLabel}
          </Badge>
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary-500 flex-shrink-0" />
              <span>{formatDateIndo(date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
