import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Heart,
  Users,
  BookOpen,
  Megaphone,
  HandHeart,
  Target,
  Globe,
} from "lucide-react";

const nilaiOrganisasi = [
  {
    icon: HandHeart,
    title: "Kebersamaan",
    description:
      "Kami percaya bahwa kekuatan komunitas terletak pada kebersamaan. Setiap keluarga yang bergabung menjadi bagian dari jaringan dukungan yang saling menguatkan. Kami berbagi suka dan duka, merayakan setiap pencapaian kecil, dan saling menguatkan di masa-masa sulit.",
  },
  {
    icon: Globe,
    title: "Keberagaman",
    description:
      "Setiap anak itu unik, dan setiap keluarga memiliki perjalanan yang berbeda. Kami menghargai keberagaman kebutuhan, kemampuan, dan latar belakang. Dalam perbedaan, kami menemukan kekuatan dan pembelajaran yang berharga.",
  },
  {
    icon: Target,
    title: "Keberlanjutan",
    description:
      "Kami berkomitmen untuk terus tumbuh dan berkembang sebagai organisasi yang relevan dan bermanfaat. Program-program kami dirancang untuk dampak jangka panjang, memastikan setiap keluarga merasakan manfaat yang berkelanjutan.",
  },
];

export default function TentangPage() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tentang Kami
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Mengenal lebih dekat SahabatABK, paguyuban keluarga anak berkebutuhan
            khusus yang hadir untuk saling mendukung dan berbagi.
          </p>
        </div>
      </section>

      {/* Sejarah */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Sejarah
              </h2>
            </div>
            <div className="prose prose-lg text-gray-600 leading-relaxed">
              <p className="mb-4">
                SahabatABK didirikan pada tahun 2021 oleh sekelompok orang tua
                dari anak berkebutuhan khusus di kota kami. Semuanya bermula
                dari pertemuan informal beberapa keluarga yang kebetulan memiliki
                anak dengan kebutuhan khusus serupa. Dalam pertemuan-pertemuan
                tersebut, kami menyadari betapa pentingnya memiliki komunitas
                yang memahami perjuangan sehari-hari dalam mendampingi anak ABK.
              </p>
              <p className="mb-4">
                Awalnya, kami hanya berkumpul secara rutin setiap bulan di rumah
                salah satu anggota untuk berbagi cerita dan pengalaman. Dari
                sinilah muncul ide untuk membentuk paguyuban yang lebih terorganisir
                sehingga manfaatnya bisa dirasakan oleh lebih banyak keluarga.
              </p>
              <p className="mb-4">
                Seiring berjalannya waktu, SahabatABK terus berkembang. Dari
                hanya 10 keluarga di awal, kini kami telah memiliki lebih dari
                150 anggota aktif. Kami telah menyelenggarakan lebih dari 50
                kegiatan berupa workshop, webinar, outing keluarga, dan bakti
                sosial. Kami juga mulai membangun kerjasama dengan berbagai
                profesional dan institusi yang peduli terhadap pendidikan anak
                berkebutuhan khusus.
              </p>
              <p>
                Hingga saat ini, SahabatABK terus berkomitmen untuk menjadi
                rumah kedua bagi setiap keluarga ABK yang membutuhkan tempat
                untuk berbagi, belajar, dan bertumbuh bersama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visi */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-secondary-100 flex items-center justify-center">
                    <Target className="h-5 w-5 text-secondary-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Visi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed italic">
                  &ldquo;Menjadi komunitas inklusif yang memberdayakan setiap
                  keluarga ABK untuk tumbuh bersama dan meraih potensi terbaik
                  bagi anak-anak mereka.&rdquo;
                </p>
              </CardContent>
            </Card>

            {/* Misi */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-accent-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-accent-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Misi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-xs font-bold">1</span>
                    </div>
                    <span className="text-gray-600">
                      Menyediakan ruang aman bagi keluarga ABK untuk berbagi
                      pengalaman, keluh kesah, dan solusi dalam mendampingi anak.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-xs font-bold">2</span>
                    </div>
                    <span className="text-gray-600">
                      Menyelenggarakan kegiatan edukasi seperti workshop, webinar,
                      dan pelatihan untuk meningkatkan pemahaman dan keterampilan
                      orang tua.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-xs font-bold">3</span>
                    </div>
                    <span className="text-gray-600">
                      Melakukan advokasi dan sosialisasi kepada masyarakat tentang
                      pentingnya inklusi dan hak-hak anak berkebutuhan khusus.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-xs font-bold">4</span>
                    </div>
                    <span className="text-gray-600">
                      Membangun jaringan komunitas yang solid dan saling mendukung
                      antar keluarga ABK di berbagai wilayah.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nilai-nilai Organisasi */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Nilai-nilai Organisasi
            </h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Prinsip-prinsip yang menjadi fondasi dan panduan kami dalam
              menjalankan setiap kegiatan dan program
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {nilaiOrganisasi.map((nilai, idx) => (
              <Card
                key={idx}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                    <nilai.icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">
                    {nilai.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {nilai.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
