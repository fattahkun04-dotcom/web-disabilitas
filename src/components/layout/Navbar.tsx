"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import type { ComponentType } from "react";
import { Menu, X, User, LogOut, LayoutDashboard, Calendar, DollarSign, Users, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavLink {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

const publicNavLinks: NavLink[] = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kepengurusan", label: "Kepengurusan" },
  { href: "/event", label: "Kegiatan" },
  { href: "/kontak", label: "Kontak" },
];

const memberNavLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/keuangan", label: "Keuangan", icon: DollarSign },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/event", label: "Kegiatan", icon: Calendar },
  { href: "/profil", label: "Profil", icon: User },
];

const adminNavLinks: NavLink[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/anggota", label: "Anggota", icon: Users },
  { href: "/admin/event", label: "Event", icon: Calendar },
  { href: "/admin/keuangan", label: "Keuangan", icon: DollarSign },
  { href: "/admin/statistik", label: "Statistik", icon: Settings },
  { href: "/admin/profil-organisasi", label: "Profil Org.", icon: Settings },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const isLoggedIn = !!session;

  const navLinks = isAdmin ? adminNavLinks : isLoggedIn ? memberNavLinks : publicNavLinks;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:inline">SahabatABK</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href || pathname?.startsWith(link.href + "/")
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-600">
                  Halo, {session?.user?.name?.split(" ")[0]}
                </span>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">Masuk</Button>
                </Link>
                <Link href="/daftar">
                  <Button size="sm">Daftar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
                pathname === link.href || pathname?.startsWith(link.href + "/")
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {link.icon ? <link.icon className="h-4 w-4" /> : null}
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-200 mt-2 pt-2 px-4">
            {isLoggedIn ? (
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  setMobileOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Keluar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" fullWidth>Masuk</Button>
                </Link>
                <Link href="/daftar" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" fullWidth>Daftar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
