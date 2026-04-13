"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  MapPin,
  Users,
  Award,
  Clock,
  Quote,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatDateIndo } from "@/lib/utils";

const upcomingEvents = [
  {
    title: "Workshop Terapi Bermain untuk Anak ABK",
    date: new Date("2026-05-15"),
    location: "Aula Komunitas SahabatABK",
    category: "workshop",
  },
  {
    title: "Webinar: Memahami Perkembangan Sensorik Anak",
    date: new Date("2026-05-22"),
    location: "Online via Zoom",
    category: "webinar",
  },
  {
    title: "Outing Keluarga: Taman Edukasi Anak",
    date: new Date("2026-06-01"),
    location: "Taman Kota Edukasi",
    category: "outing",
  },
];

const testimonials = [
  {
    name: "Ibu Sari Dewi",
    role: "Orang tua dari Rafa (8 tahun)",
    text: "SahabatABK menjadi tempat saya berbagi cerita dan belajar banyak tentang cara mendampingi anak ABK. Komunitas ini sangat suportif dan penuh kasih sayang.",
  },
  {
    name: "Bapak Andi Pratama",
    role: "Orang tua dari Aisyah (6 tahun)",
    text: "Bergabung dengan paguyuban ini membuka wawasan saya. Saya jadi tahu bahwa saya tidak sendirian dalam perjalanan mendampingi anak spesial kami.",
  },
  {
    name: "Ibu Rina Marlina",
    role: "Orang tua dari Dimas (10 tahun)",
    text: "Event-event yang diadakan sangat bermanfaat. Anak saya jadi lebih percaya diri dan punya teman bermain. Terima kasih SahabatABK!",
  },
];

function CounterAnimation({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 20);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-primary-600 mb-1">
        {count}+
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 to-primary-700 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Bersama Lebih Kuat,
            <br />
            Tumbuh Lebih Jauh
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Platform terpadu untuk Paguyuban Keluarga Anak Berkebutuhan Khusus.
            Bersama kita berbagi, belajar, dan bertumbuh sebagai komunitas yang
            kuat dan inklusif.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/daftar">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg"
              >
                Bergabung Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/event">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Lihat Kegiatan
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white shadow-md py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CounterAnimation target={150} label="Anggota Aktif" />
            <CounterAnimation target={50} label="Event Dilaksanakan" />
            <CounterAnimation target={5} label="Tahun Berdiri" />
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Kegiatan Mendatang
              </h2>
              <p className="text-gray-600 mt-2">
                Jangan lewatkan kegiatan-kegiatan menarik dari paguyuban
              </p>
            </div>
            <Link
              href="/event"
              className="hidden md:flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              Lihat Semua
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, idx) => (
              <Card
                key={idx}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-primary-500" />
                </div>
                <CardHeader className="pb-2">
                  <Badge
                    variant="default"
                    className="w-fit capitalize mb-2"
                  >
                    {event.category}
                  </Badge>
                  <CardTitle className="text-lg line-clamp-2">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary-500" />
                      <span>{formatDateIndo(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary-500" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Link href="/event">
              <Button variant="outline">
                Lihat Semua Kegiatan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Snippet */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Tentang SahabatABK
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                SahabatABK adalah paguyuban yang didirikan oleh sekelompok orang
                tua dari anak berkebutuhan khusus yang memiliki visi sama:
                menciptakan komunitas yang saling mendukung dan berbagi
                pengalaman dalam mendampingi tumbuh kembang anak-anak istimewa
                kita.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Berdiri sejak tahun 2021, kami telah menyelenggarakan berbagai
                kegiatan edukatif, workshop, webinar, dan outing keluarga yang
                bertujuan memperkuat jaringan dukungan antar keluarga ABK.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Kami percaya bahwa setiap anak berhak mendapatkan kesempatan
                yang sama untuk berkembang, dan setiap orang tua berhak
                mendapatkan dukungan yang mereka butuhkan.
              </p>
              <Link href="/tentang">
                <Button variant="outline">
                  Selengkapnya
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="h-80 bg-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Users className="h-16 w-16 mx-auto mb-3" />
                <p className="font-medium">Foto Komunitas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Cerita dari Keluarga
            </h2>
            <p className="text-gray-600 mt-2">
              Pengalaman nyata dari keluarga-keluarga yang bergabung dengan kami
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6">
                <Quote className="h-8 w-8 text-primary-300 mb-4" />
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {testimonial.name.charAt(5)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Bergabung?
          </h2>
          <p className="text-lg text-white/90 max-w-xl mx-auto mb-8">
            Bergabunglah dengan ratusan keluarga lainnya dan rasakan manfaat
            menjadi bagian dari komunitas yang peduli.
          </p>
          <Link href="/daftar">
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100 shadow-lg"
            >
              Daftar Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
