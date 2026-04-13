"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRupiah, formatDateShort } from "@/lib/utils";
import { UserCheck, Wallet } from "lucide-react";

interface PendingMember {
  id: string;
  user: {
    name: string;
    email: string;
  };
  joinedAt: string;
}

interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number | string;
  type: "INCOME" | "EXPENSE";
}

interface RecentActivityFeedProps {
  pendingMembers: PendingMember[];
  recentTransactions: RecentTransaction[];
}

export function RecentActivityFeed({ pendingMembers, recentTransactions }: RecentActivityFeedProps) {
  const displayMembers = pendingMembers.slice(0, 5);
  const displayTransactions = recentTransactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Pending Verification Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-amber-500" />
            Menunggu Verifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayMembers.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Tidak ada anggota yang menunggu verifikasi
            </p>
          ) : (
            <div className="space-y-3">
              {displayMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {member.user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {member.user.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateShort(member.joinedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <Badge variant="warning">Pending</Badge>
                    <Button variant="outline" size="sm">
                      Verifikasi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-500" />
            Transaksi Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Belum ada transaksi
            </p>
          ) : (
            <div className="space-y-3">
              {displayTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {tx.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateShort(tx.date)}
                    </p>
                  </div>
                  <div className="ml-3 text-right flex-shrink-0">
                    <p
                      className={`font-semibold ${
                        tx.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatRupiah(tx.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
