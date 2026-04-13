import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  FileText,
  Users,
  AlertCircle,
} from "lucide-react";
import { formatDateIndo, CATEGORY_COLORS, formatRupiah } from "@/lib/utils";

interface EventDetail {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  status: string;
  coverImage?: string | null;
  maxParticipants?: number | null;
  currentParticipants?: number;
  fee?: number | null;
  documents?: EventDocument[];
  relatedEvents?: RelatedEvent[];
}

interface EventDocument {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
}

interface RelatedEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
}

const staticEvent: EventDetail = {
  id: "1",
  slug: "workshop-terapi-bermain",
  title: "Workshop Terapi Bermain untuk Anak ABK",
  category: "workshop",
  date: "2026-05-15",
  location: "Aula Komunitas SahabatABK, Jl. Merdeka No. 45",
  description: `<p>Workshop ini dirancang khusus untuk para orang tua dan pengasuh anak berkebutuhan khusus yang ingin memahami dan menerapkan terapi bermain di rumah.</p>
<h3>Apa yang Akan Dipelajari?</h3>
<ul>
<li>Teknik-teknik terapi bermain yang efektif untuk berbagai jenis kebutuhan khusus</li>
<li>Cara memilih alat bermain yang tepat dan aman</li>
<li>Membuat jadwal bermain yang terstruktur</li>
<li>Mengukur progres perkembangan anak melalui aktivitas bermain</li>
</ul>
<h3>Pemateri</h3>
<p>Workshop ini akan dibawakan oleh <strong>Dr. Sari Dewi, M.Psi</strong>, seorang psikolog anak yang berpengalaman dalam menangani anak-anak berkebutuhan khusus selama lebih dari 10 tahun.</p>
<h3>Siapa yang Bisa Mengikuti?</h3>
<p>Workshop ini terbuka untuk seluruh anggota aktif SahabatABK. Non-anggota dapat mendaftar dengan menghubungi panitia.</p>`,
  status: "PUBLISHED",
  maxParticipants: 50,
  currentParticipants: 32,
  fee: 50000,
  documents: [
    {
      id: "d1",
      title: "Panduan Workshop Terapi Bermain",
      fileUrl: "#",
      fileType: "PDF",
    },
    {
      id: "d2",
      title: "Formulir Pendaftaran Peserta",
      fileUrl: "#",
      fileType: "PDF",
    },
  ],
};

async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/events?slug=${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.event as EventDetail;
  } catch {
    return null;
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await getEventBySlug(params.slug);
  const eventData = event || staticEvent;

  if (!event && params.slug !== staticEvent.slug) {
    notFound();
  }

  const categoryLabel = eventData.category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const categoryColor =
    CATEGORY_COLORS[eventData.category] || "bg-gray-100 text-gray-800";

  const isPublished = eventData.status === "PUBLISHED";
  const isCompleted = eventData.status === "COMPLETED";

  return (
    <div>
      {/* Cover Image Hero */}
      <section className="relative h-64 md:h-80 bg-gradient-to-br from-primary-100 to-primary-300 overflow-hidden">
        {eventData.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={eventData.coverImage}
            alt={eventData.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-20 w-20 text-primary-400" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link href="/event">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white border-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2">
              {/* Title & Category */}
              <div className="mb-6">
                <Badge className={`mb-3 ${categoryColor}`}>
                  {categoryLabel}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {eventData.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    <span>{formatDateIndo(eventData.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary-500" />
                    <span>
                      {isCompleted
                        ? "Selesai"
                        : isPublished
                          ? "Akan Datang"
                          : eventData.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary-500" />
                    <span>{eventData.location}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div
                className="prose prose-lg max-w-none text-gray-700 mb-8"
                dangerouslySetInnerHTML={{ __html: eventData.description }}
              />

              {/* Related Documents */}
              {eventData.documents && eventData.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary-500" />
                      <CardTitle className="text-lg text-gray-900">
                        Dokumen Terkait
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {eventData.documents.map((doc) => (
                        <li key={doc.id}>
                          <Link
                            href={doc.fileUrl}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                          >
                            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 text-xs font-bold">
                                {doc.fileType}
                              </span>
                            </div>
                            <span className="text-gray-700 font-medium">
                              {doc.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Right Column */}
            <div className="space-y-6">
              {/* RSVP / Registration Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">
                    Pendaftaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Participants Info */}
                  {eventData.maxParticipants && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {eventData.currentParticipants || 0} /{" "}
                        {eventData.maxParticipants} peserta
                      </span>
                    </div>
                  )}

                  {/* Fee */}
                  {eventData.fee !== null && eventData.fee !== undefined && (
                    <div className="text-sm">
                      <span className="text-gray-500">Biaya: </span>
                      <span className="font-semibold text-gray-900">
                        {formatRupiah(eventData.fee)}
                      </span>
                    </div>
                  )}

                  {/* RSVP Button */}
                  {isPublished && !isCompleted ? (
                    <Link href="/daftar">
                      <Button fullWidth>
                        Daftar / RSVP Sekarang
                      </Button>
                    </Link>
                  ) : isCompleted ? (
                    <Button fullWidth disabled variant="secondary">
                      Kegiatan Selesai
                    </Button>
                  ) : (
                    <Button fullWidth disabled>
                      Pendaftaran Belum Dibuka
                    </Button>
                  )}

                  {/* Member-only notice */}
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700">
                      Kegiatan ini prioritas untuk anggota aktif SahabatABK. Jika
                      Anda belum menjadi anggota,{" "}
                      <Link
                        href="/daftar"
                        className="underline font-medium hover:text-yellow-800"
                      >
                        daftar di sini
                      </Link>{" "}
                      terlebih dahulu.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Share Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">
                    Bagikan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Facebook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
