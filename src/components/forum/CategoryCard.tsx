import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  threadCount: number;
}

export function CategoryCard({ id, name, slug, description, icon, threadCount }: CategoryCardProps) {
  return (
    <Link href={`/forum/${slug}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary-200 cursor-pointer group">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform" role="img" aria-label={name}>
              {icon || "#"}
            </span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg group-hover:text-primary-600 transition-colors truncate">
                {name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {description && (
            <CardDescription className="mb-3 line-clamp-2">{description}</CardDescription>
          )}
          <Badge variant="secondary" className="text-xs">
            {threadCount} thread
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
