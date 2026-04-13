"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatRupiah,
  formatDateShort,
  TRANSACTION_CATEGORY_LABELS,
} from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Filter,
  FileText,
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: number;
  attachmentUrl: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BudgetSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const TRANSACTION_TYPES = [
  { value: "ALL", label: "Semua" },
  { value: "INCOME", label: "Pemasukan" },
  { value: "EXPENSE", label: "Pengeluaran" },
];

const TRANSACTION_CATEGORIES = [
  { value: "", label: "Semua Kategori" },
  { value: "MEMBERSHIP_FEE", label: "Iuran Anggota" },
  { value: "DONATION", label: "Donasi" },
  { value: "EVENT_INCOME", label: "Pemasukan Event" },
  { value: "EVENT_EXPENSE", label: "Pengeluaran Event" },
  { value: "OPERATIONAL", label: "Operasional" },
  { value: "SOCIAL_PROGRAM", label: "Program Sosial" },
  { value: "OTHER", label: "Lainnya" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function KeuanganPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [filterType, setFilterType] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchBudgetSummary = async (month: string, year: string) => {
    try {
      const res = await fetch(`/api/budget/summary?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setBudgetSummary(data);
      }
    } catch (error) {
      console.error("Error fetching budget summary:", error);
    }
  };

  const fetchTransactions = async (
    page: number,
    type: string,
    category: string,
    month: string,
    year: string
  ) => {
    setLoading(true);
    try {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month.padStart(2, "0")}-${lastDay}`;

      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        type,
        startDate,
        endDate,
      });

      if (category) {
        params.set("category", category);
      }

      const res = await fetch(`/api/budget?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetSummary(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTransactions(
      pagination.page,
      filterType,
      filterCategory,
      selectedMonth,
      selectedYear
    );
  }, [pagination.page, filterType, filterCategory, selectedMonth, selectedYear]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterReset = () => {
    setFilterType("ALL");
    setFilterCategory("");
    setShowFilters(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transparansi Keuangan</h1>
        <p className="text-gray-500 mt-1">
          Informasi pemasukan dan pengeluaran paguyuban SahabatABK
        </p>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Periode:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-auto flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filter Lanjutan
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {TRANSACTION_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFilterReset}
              >
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pemasukan</p>
                <p className="text-xl font-bold text-green-600">
                  {formatRupiah(budgetSummary.totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50">
                <ArrowDownRight className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Pengeluaran</p>
                <p className="text-xl font-bold text-red-600">
                  {formatRupiah(budgetSummary.totalExpense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Saldo</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatRupiah(budgetSummary.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Memuat transaksi...</p>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Tidak ada transaksi pada periode ini</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Tanggal
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Deskripsi
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Kategori
                      </th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Jumlah
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Status
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                        Lampiran
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                          {formatDateShort(tx.date)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="text-xs">
                            {TRANSACTION_CATEGORY_LABELS[tx.category] || tx.category}
                          </Badge>
                        </td>
                        <td
                          className={`py-3 px-4 text-sm font-semibold text-right whitespace-nowrap ${
                            tx.type === "INCOME" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatRupiah(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {tx.isVerified ? (
                            <Badge variant="success" className="text-xs">
                              Terverifikasi
                            </Badge>
                          ) : (
                            <Badge variant="warning" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {tx.attachmentUrl ? (
                            <Link
                              href={tx.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Lihat lampiran"
                            >
                              <Download className="h-4 w-4 text-gray-500" />
                            </Link>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDateShort(tx.date)}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          tx.type === "INCOME" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatRupiah(tx.amount)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {tx.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {TRANSACTION_CATEGORY_LABELS[tx.category] || tx.category}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {tx.isVerified ? (
                          <Badge variant="success" className="text-xs">
                            Terverifikasi
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-xs">
                            Pending
                          </Badge>
                        )}
                        {tx.attachmentUrl && (
                          <Link
                            href={tx.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-gray-100"
                            title="Lihat lampiran"
                          >
                            <Download className="h-4 w-4 text-gray-500" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Menampilkan {((pagination.page - 1) * pagination.limit) + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)} dari{" "}
                    {pagination.total} transaksi
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 5) },
                      (_, i) => {
                        let pageNum: number;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className="min-w-[2.5rem]"
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
