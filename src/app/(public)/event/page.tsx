"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EventCard } from "@/components/event/EventCard";
import { Button } from "@/components/ui/Button";
import { Loader2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface Event {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  location: string;
  status: string;
  coverImage?: string | null;
}

interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type FilterType = "all" | "upcoming" | "completed";

const ITEMS_PER_PAGE = 9;

export default function EventListPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const statusParam =
          filter === "all" ? "all" : filter === "upcoming" ? "published" : "completed";
        const res = await fetch(
          `${baseUrl}/api/events?status=${statusParam}&page=${page}&limit=${ITEMS_PER_PAGE}`,
          { cache: "no-store" }
        );

        if (res.ok) {
          const data: EventsResponse = await res.json();
          setEvents(data.events);
          setPagination(data.pagination);
        } else {
          // Fallback to static data
          setEvents(staticEvents);
          setPagination({
            page: 1,
            limit: ITEMS_PER_PAGE,
            total: staticEvents.length,
            totalPages: 1,
          });
        }
      } catch {
        setEvents(staticEvents);
        setPagination({
          page: 1,
          limit: ITEMS_PER_PAGE,
          total: staticEvents.length,
          totalPages: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filter, page]);

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "upcoming", label: "Mendatang" },
    { key: "completed", label: "Selesai" },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Kegiatan Paguyuban
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Jelajahi berbagai kegiatan yang telah dan akan dilaksanakan oleh
            paguyuban SahabatABK
          </p>
        </div>
      </section>

      {/* Event List */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setFilter(tab.key);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-primary-500 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <span className="ml-3 text-gray-600">Memuat kegiatan...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tidak Ada Kegiatan
              </h3>
              <p className="text-gray-600">
                Belum ada kegiatan untuk filter yang dipilih.
              </p>
            </div>
          ) : (
            <>
              {/* Event Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    slug={event.slug}
                    title={event.title}
                    category={event.category}
                    date={event.date}
                    location={event.location}
                    status={event.status}
                    coverImage={event.coverImage}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Sebelumnya
                  </Button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      if (pagination.totalPages <= 7) return true;
                      if (pageNum === 1 || pageNum === pagination.totalPages)
                        return true;
                      if (Math.abs(pageNum - page) <= 1) return true;
                      return false;
                    })
                    .map((pageNum, idx, arr) => (
                      <div key={pageNum} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setPage(pageNum)}
                          className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
                              ? "bg-primary-500 text-white"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      </div>
                    ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// Static fallback data
const staticEvents: Event[] = [
  {
    id: "1",
    slug: "workshop-terapi-bermain",
    title: "Workshop Terapi Bermain untuk Anak ABK",
    category: "workshop",
    date: "2026-05-15",
    location: "Aula Komunitas SahabatABK",
    status: "PUBLISHED",
  },
  {
    id: "2",
    slug: "webinar-perkembangan-sensorik",
    title: "Webinar: Memahami Perkembangan Sensorik Anak",
    category: "webinar",
    date: "2026-05-22",
    location: "Online via Zoom",
    status: "PUBLISHED",
  },
  {
    id: "3",
    slug: "outing-taman-edukasi",
    title: "Outing Keluarga: Taman Edukasi Anak",
    category: "outing",
    date: "2026-06-01",
    location: "Taman Kota Edukasi",
    status: "PUBLISHED",
  },
  {
    id: "4",
    slug: "pertemuan-rutin-bulanan",
    title: "Pertemuan Rutin Bulanan Mei 2026",
    category: "pertemuan-rutin",
    date: "2026-05-10",
    location: "Secretariat SahabatABK",
    status: "COMPLETED",
  },
  {
    id: "5",
    slug: "bakti-sosial-ramadhan",
    title: "Bakti Sosial Bersama di Bulan Ramadhan",
    category: "bakti-sosial",
    date: "2026-03-20",
    location: "Panti Asuhan Kasih Ibu",
    status: "COMPLETED",
  },
  {
    id: "6",
    slug: "workshop-sensory-integration",
    title: "Workshop Sensory Integration untuk Orang Tua",
    category: "workshop",
    date: "2026-06-15",
    location: "Ruang Seminar RS Harapan",
    status: "PUBLISHED",
  },
];
