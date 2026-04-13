"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ChevronLeft, ChevronRight, X, ImageOff } from "lucide-react";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
}

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  uploadedAt: string;
}

export default function EventGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Resolve slug to event
        const eventsRes = await fetch(`/api/events?status=all&limit=200`);
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const found = (data.events || []).find((e: Event) => e.slug === slug);
          if (!found) {
            setLoading(false);
            return;
          }
          setEvent(found);

          // Fetch event documents (gallery images)
          const docsRes = await fetch(`/api/events/${found.id}/documents`);
          if (docsRes.ok) {
            const docsData = await docsRes.json();
            const galleryImages = (docsData.documents || []).filter(
              (d: any) => d.type === "gallery_image"
            );
            setImages(galleryImages);
          }
        }
      } catch (error) {
        console.error("Error fetching event gallery:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (lightboxIndex === null) return;
    if (direction === "prev") {
      setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    } else {
      setLightboxIndex(lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "ArrowRight") navigateLightbox("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, images.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat galeri...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">Event tidak ditemukan</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-500 mt-1">Galeri Foto</p>
        </div>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ImageOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada foto untuk event ini</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer"
            >
              <img
                src={image.url}
                alt={image.caption || `Foto ${index + 1}`}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                  <p className="text-white text-sm truncate">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox("prev");
              }}
              className="absolute left-4 z-50 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption || `Foto ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
            {images[lightboxIndex].caption && (
              <p className="text-white text-center mt-3 text-sm">
                {images[lightboxIndex].caption}
              </p>
            )}
            <p className="text-white/60 text-center text-xs mt-1">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox("next");
              }}
              className="absolute right-4 z-50 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
