import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users } from "lucide-react";

interface BoardMember {
  id: string;
  name: string;
  position: string;
  period: string;
  photoUrl?: string | null;
}

const staticMembers: BoardMember[] = [
  {
    id: "1",
    name: "Dr. Sari Dewi, M.Psi",
    position: "Ketua Umum",
    period: "2024-2026",
    photoUrl: null,
  },
  {
    id: "2",
    name: "Budi Santoso, S.Pd",
    position: "Wakil Ketua",
    period: "2024-2026",
    photoUrl: null,
  },
  {
    id: "3",
    name: "Rina Marlina, S.Pd",
    position: "Sekretaris",
    period: "2024-2026",
    photoUrl: null,
  },
  {
    id: "4",
    name: "Ahmad Hidayat, S.E",
    position: "Bendahara",
    period: "2024-2026",
    photoUrl: null,
  },
  {
    id: "5",
    name: "Dewi Lestari, M.Pd",
    position: "Koordinator Pendidikan",
    period: "2024-2026",
    photoUrl: null,
  },
  {
    id: "6",
    name: "Andi Pratama, S.Sos",
    position: "Koordinator Humas",
    period: "2024-2026",
    photoUrl: null,
  },
  {
    id: "7",
    name: "Nuraini, S.Pd",
    position: "Koordinator Kegiatan",
    period: "2024-2026",
    photoUrl: null,
  },
  {
    id: "8",
    name: "Hendra Wijaya, M.Psi",
    position: "Koordinator Pendampingan",
    period: "2024-2026",
    photoUrl: null,
  },
];

async function getBoardMembers(): Promise<BoardMember[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/board-members`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch board members");
    }
    const data = await res.json();
    return data.data as BoardMember[];
  } catch {
    return staticMembers;
  }
}

export default async function KepengurusanPage() {
  const members = await getBoardMembers();

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Struktur Kepengurusan
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Para pengurus yang berdedikasi untuk memajukan paguyuban dan
            memberikan pelayanan terbaik bagi seluruh anggota
          </p>
        </div>
      </section>

      {/* Board Members Grid */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member, idx) => (
              <Card
                key={member.id}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="pt-6 text-center">
                  {/* Photo Placeholder */}
                  <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center mb-4">
                    {member.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="h-28 w-28 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-600 text-3xl font-bold">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>

                  {/* Position Badge */}
                  <Badge
                    variant={idx === 0 ? "default" : idx === 1 ? "secondary" : "outline"}
                    className="mb-2"
                  >
                    {member.position}
                  </Badge>

                  {/* Period */}
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {member.period}
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
