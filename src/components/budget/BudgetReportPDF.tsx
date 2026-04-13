"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register default font (using Helvetica which is built-in)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: 2,
    borderBottomColor: "#1e40af",
  },
  orgName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 4,
  },
  periodTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  periodSub: {
    fontSize: 10,
    color: "#6b7280",
  },
  summarySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  summaryCardIncome: {
    borderColor: "#10b981",
    backgroundColor: "#ecfdf5",
  },
  summaryCardExpense: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  summaryCardBalance: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  summaryLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e40af",
    padding: 8,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRowEven: {
    backgroundColor: "#f9fafb",
  },
  tableColDate: {
    width: "18%",
    fontSize: 9,
  },
  tableColDesc: {
    width: "35%",
    fontSize: 9,
  },
  tableColCategory: {
    width: "22%",
    fontSize: 9,
  },
  tableColAmount: {
    width: "25%",
    fontSize: 9,
    textAlign: "right",
  },
  tableHeaderCol: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
  },
  incomeText: {
    color: "#10b981",
  },
  expenseText: {
    color: "#ef4444",
  },
  categorySection: {
    marginTop: 15,
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryLabel: {
    fontSize: 9,
    color: "#4b5563",
  },
  categoryValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

function formatRupiahPdf(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateIndoPdf(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface BudgetReportPDFProps {
  orgName: string;
  period: { label: string };
  summary: { totalIncome: number; totalExpense: number; balance: number };
  transactions: {
    id: string;
    date: string;
    type: "INCOME" | "EXPENSE";
    category: string;
    description: string;
    amount: number;
  }[];
  byCategory: {
    category: string;
    totalIncome: number;
    totalExpense: number;
  }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  MEMBERSHIP_FEE: "Iuran Anggota",
  DONATION: "Donasi",
  EVENT_INCOME: "Pemasukan Event",
  EVENT_EXPENSE: "Pengeluaran Event",
  OPERATIONAL: "Operasional",
  SOCIAL_PROGRAM: "Program Sosial",
  OTHER: "Lainnya",
};

export function BudgetReportPDFDocument({
  orgName,
  period,
  summary,
  transactions,
  byCategory,
}: BudgetReportPDFProps) {
  const printDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const incomeTransactions = transactions.filter((t) => t.type === "INCOME");
  const expenseTransactions = transactions.filter((t) => t.type === "EXPENSE");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.orgName}>{orgName}</Text>
          <Text style={styles.periodTitle}>Laporan Keuangan</Text>
          <Text style={styles.periodSub}>{period.label}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, styles.summaryCardIncome]}>
              <Text style={styles.summaryLabel}>Total Pemasukan</Text>
              <Text style={styles.summaryValue}>{formatRupiahPdf(summary.totalIncome)}</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardExpense]}>
              <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
              <Text style={styles.summaryValue}>{formatRupiahPdf(summary.totalExpense)}</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardBalance]}>
              <Text style={styles.summaryLabel}>Saldo</Text>
              <Text style={styles.summaryValue}>{formatRupiahPdf(summary.balance)}</Text>
            </View>
          </View>
        </View>

        {/* Income Transactions */}
        {incomeTransactions.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Pemasukan</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCol, styles.tableColDate]}>Tanggal</Text>
              <Text style={[styles.tableHeaderCol, styles.tableColDesc]}>Deskripsi</Text>
              <Text style={[styles.tableHeaderCol, styles.tableColCategory]}>Kategori</Text>
              <Text style={[styles.tableHeaderCol, styles.tableColAmount]}>Jumlah</Text>
            </View>
            {incomeTransactions.map((tx, idx) => (
              <View
                key={tx.id}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowEven : {},
                ]}
              >
                <Text style={styles.tableColDate}>{formatDateIndoPdf(tx.date)}</Text>
                <Text style={styles.tableColDesc}>{tx.description}</Text>
                <Text style={styles.tableColCategory}>
                  {CATEGORY_LABELS[tx.category] || tx.category}
                </Text>
                <Text style={[styles.tableColAmount, styles.incomeText]}>
                  {formatRupiahPdf(tx.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Expense Transactions */}
        {expenseTransactions.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Pengeluaran</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCol, styles.tableColDate]}>Tanggal</Text>
              <Text style={[styles.tableHeaderCol, styles.tableColDesc]}>Deskripsi</Text>
              <Text style={[styles.tableHeaderCol, styles.tableColCategory]}>Kategori</Text>
              <Text style={[styles.tableHeaderCol, styles.tableColAmount]}>Jumlah</Text>
            </View>
            {expenseTransactions.map((tx, idx) => (
              <View
                key={tx.id}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowEven : {},
                ]}
              >
                <Text style={styles.tableColDate}>{formatDateIndoPdf(tx.date)}</Text>
                <Text style={styles.tableColDesc}>{tx.description}</Text>
                <Text style={styles.tableColCategory}>
                  {CATEGORY_LABELS[tx.category] || tx.category}
                </Text>
                <Text style={[styles.tableColAmount, styles.expenseText]}>
                  {formatRupiahPdf(tx.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Category Breakdown */}
        {byCategory.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Rincian per Kategori</Text>
            {byCategory.map((cat) => (
              <View key={cat.category} style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>
                  {CATEGORY_LABELS[cat.category] || cat.category}
                </Text>
                <View style={{ flexDirection: "row", gap: 20 }}>
                  {cat.totalIncome > 0 && (
                    <Text style={[styles.categoryValue, styles.incomeText]}>
                      +{formatRupiahPdf(cat.totalIncome)}
                    </Text>
                  )}
                  {cat.totalExpense > 0 && (
                    <Text style={[styles.categoryValue, styles.expenseText]}>
                      -{formatRupiahPdf(cat.totalExpense)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Dicetak pada {printDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
