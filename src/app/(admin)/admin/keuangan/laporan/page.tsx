"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/toast";
import { formatRupiah, formatDateShort, TRANSACTION_CATEGORY_LABELS } from "@/lib/utils";
import { FileText, Download, Loader2, Eye, ChevronDown } from "lucide-react";

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

interface ReportData {
  period: { year: number; month: number; label: string };
  summary: { totalIncome: number; totalExpense: number; balance: number; openingBalance: number };
  transactions: {
    id: string;
    date: string;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string;
    amount: number;
    isVerified: boolean;
  }[];
  byCategory: { category: string; totalIncome: number; totalExpense: number }[];
}

export default function LaporanKeuanganPage() {
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [orgName, setOrgName] = useState("Sahabat ABK");
  const { toast } = useToast();

  useEffect(() => {
    async function fetchOrgName() {
      try {
        const res = await fetch("/api/admin/organization");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setOrgName(json.data.name || "Sahabat ABK");
          }
        }
      } catch {
        // Use default name
      }
    }
    fetchOrgName();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budget/reports/${selectedYear}/${selectedMonth}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setReportData(json.data);
        }
      } else {
        toast({ title: "Gagal", description: "Gagal memuat laporan keuangan.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Gagal", description: "Terjadi kesalahan.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!reportData) return;
    setGeneratingPdf(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { BudgetReportPDFDocument } = await import("@/components/budget/BudgetReportPDF");

      const pdfDoc = (
        <BudgetReportPDFDocument
          orgName={orgName}
          period={{ label: reportData.period.label }}
          summary={reportData.summary}
          transactions={reportData.transactions}
          byCategory={reportData.byCategory}
        />
      );

      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `Laporan_Keuangan_${reportData.period.label.replace(/\s/g, "_")}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Berhasil", description: "PDF berhasil diunduh." });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Gagal", description: "Gagal membuat PDF.", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
        <p className="text-gray-500 mt-1">Buat dan unduh laporan keuangan bulanan</p>
      </div>

      {/* Filter Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pilih Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="appearance-none h-10 rounded-lg border border-gray-300 bg-white px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="appearance-none h-10 rounded-lg border border-gray-300 bg-white px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memuat...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Tampilkan Laporan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">Memuat laporan...</p>
          </CardContent>
        </Card>
      )}

      {!loading && reportData && (
        <div className="space-y-6">
          {/* Period Title + Download Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {reportData.period.label}
            </h2>
            <Button onClick={handleGeneratePDF} disabled={generatingPdf}>
              {generatingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Membuat PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Unduh PDF
                </>
              )}
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Saldo Awal</p>
                <p className="text-xl font-bold text-gray-900">{formatRupiah(reportData.summary.openingBalance)}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Pemasukan</p>
                <p className="text-xl font-bold text-green-700">{formatRupiah(reportData.summary.totalIncome)}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Pengeluaran</p>
                <p className="text-xl font-bold text-red-700">{formatRupiah(reportData.summary.totalExpense)}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Saldo Akhir</p>
                <p className="text-xl font-bold text-blue-700">{formatRupiah(reportData.summary.balance)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          {reportData.transactions.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Tanggal</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Deskripsi</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Kategori</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-500">Jumlah</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2.5 px-3 text-gray-600">{formatDateShort(tx.date)}</td>
                          <td className="py-2.5 px-3 font-medium text-gray-900">{tx.description}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="secondary">
                              {TRANSACTION_CATEGORY_LABELS[tx.category] || tx.category}
                            </Badge>
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-semibold ${
                              tx.type === "INCOME" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {tx.type === "INCOME" ? "+" : "-"}{formatRupiah(tx.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {tx.isVerified ? (
                              <Badge variant="success">Terverifikasi</Badge>
                            ) : (
                              <Badge variant="warning">Pending</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Tidak ada transaksi pada periode ini
              </CardContent>
            </Card>
          )}

          {/* Category Breakdown */}
          {reportData.byCategory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Rincian per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.byCategory.map((cat) => (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm text-gray-600">
                        {TRANSACTION_CATEGORY_LABELS[cat.category] || cat.category}
                      </span>
                      <div className="flex items-center gap-4">
                        {cat.totalIncome > 0 && (
                          <span className="text-sm font-medium text-green-600">
                            +{formatRupiah(cat.totalIncome)}
                          </span>
                        )}
                        {cat.totalExpense > 0 && (
                          <span className="text-sm font-medium text-red-600">
                            -{formatRupiah(cat.totalExpense)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && !reportData && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Pilih periode dan klik &quot;Tampilkan Laporan&quot; untuk melihat laporan keuangan
          </CardContent>
        </Card>
      )}
    </div>
  );
}
