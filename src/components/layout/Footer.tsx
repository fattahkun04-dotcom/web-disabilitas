import Link from "next/link";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="font-bold text-lg text-gray-900">SahabatABK</span>
            </div>
            <p className="text-gray-600 text-sm max-w-md">
              Platform digital terpadu untuk Paguyuban Keluarga Anak Berkebutuhan Khusus.
              Bersama lebih kuat, tumbuh lebih jauh.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Navigasi</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tentang" className="text-sm text-gray-600 hover:text-primary-500">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/kepengurusan" className="text-sm text-gray-600 hover:text-primary-500">
                  Kepengurusan
                </Link>
              </li>
              <li>
                <Link href="/event" className="text-sm text-gray-600 hover:text-primary-500">
                  Kegiatan
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-sm text-gray-600 hover:text-primary-500">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Hubungi Kami</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                info@sahabatabk.org
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +62 812-3456-7890
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Jl. Contoh No. 123, Kota, Provinsi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} SahabatABK Platform. Dibuat dengan{" "}
            <Heart className="h-3.5 w-3.5 inline text-red-500" /> untuk komunitas.
          </p>
        </div>
      </div>
    </footer>
  );
}
