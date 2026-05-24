"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Users, FileText as FileIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCustomers, useSchemes, usePayments } from "@/lib/hooks/useData";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ExportPage() {
  const { customers } = useCustomers();
  const { schemes } = useSchemes();
  const { payments } = usePayments();
  const [exporting, setExporting] = useState<string | null>(null);

  // Convert data to CSV format
  const convertToCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header] || "";
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(",") ? `"${escaped}"` : escaped;
        }).join(",")
      ),
    ].join("\n");
    return csvContent;
  };

  // Download file
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export customers to CSV
  const exportCustomersCSV = async () => {
    setExporting("customers");
    try {
      const headers = ["Name", "Phone", "Email", "Address", "Aadhaar", "Status", "Created At"];
      const data = customers.map((c) => ({
        Name: c.name,
        Phone: c.phone || "",
        Email: c.email || "",
        Address: c.address || "",
        Aadhaar: c.aadhaar || "",
        Status: c.status,
        "Created At": formatDate(c.created_at),
      }));
      const csv = convertToCSV(data, headers);
      downloadFile(csv, `customers_${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
    } finally {
      setExporting(null);
    }
  };

  // Export schemes to CSV
  const exportSchemesCSV = async () => {
    setExporting("schemes");
    try {
      const headers = [
        "Customer",
        "Monthly Amount",
        "Total Months",
        "Months Paid",
        "Start Date",
        "Maturity Date",
        "Silver Rate",
        "Total Grams",
        "Status",
      ];
      const data = schemes.map((s) => ({
        Customer: s.customer?.name || "Unknown",
        "Monthly Amount": s.monthly_amount,
        "Total Months": s.total_months,
        "Months Paid": s.months_paid,
        "Start Date": formatDate(s.start_date),
        "Maturity Date": formatDate(s.maturity_date),
        "Silver Rate": s.silver_rate_at_start,
        "Total Grams": s.total_silver_grams,
        Status: s.status,
      }));
      const csv = convertToCSV(data, headers);
      downloadFile(csv, `schemes_${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
    } finally {
      setExporting(null);
    }
  };

  // Export payments to CSV
  const exportPaymentsCSV = async () => {
    setExporting("payments");
    try {
      const headers = [
        "Customer",
        "Due Date",
        "Amount",
        "Status",
        "Paid Date",
        "Payment Method",
        "Receipt Number",
      ];
      const data = payments.map((p) => ({
        Customer: p.scheme?.customer?.name || "Unknown",
        "Due Date": formatDate(p.due_date),
        Amount: p.amount,
        Status: p.status,
        "Paid Date": p.paid_date ? formatDate(p.paid_date) : "",
        "Payment Method": p.payment_method || "",
        "Receipt Number": p.receipt_number || "",
      }));
      const csv = convertToCSV(data, headers);
      downloadFile(csv, `payments_${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
    } finally {
      setExporting(null);
    }
  };

  // Export all data
  const exportAllCSV = async () => {
    await Promise.all([exportCustomersCSV(), exportSchemesCSV(), exportPaymentsCSV()]);
  };

  // Generate simple PDF report
  const generatePDFReport = async () => {
    setExporting("report");
    try {
      // Create a simple HTML report that can be printed as PDF
      const totalCustomers = customers.length;
      const activeSchemesCount = schemes.filter((s) => s.status === "active").length;
      const totalCollected = payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const pendingPayments = payments.filter((p) => p.status === "pending").length;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Silver Savings Scheme - Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #102a43; border-bottom: 2px solid #102a43; padding-bottom: 10px; }
            h2 { color: #243b53; margin-top: 30px; }
            .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { background: #f0f4f8; padding: 20px; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #102a43; }
            .stat-label { font-size: 12px; color: #627d98; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f7fafc; font-weight: 600; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #627d98; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Silver Savings Scheme Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
          
          <h2>Summary</h2>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${totalCustomers}</div>
              <div class="stat-label">Total Customers</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${activeSchemesCount}</div>
              <div class="stat-label">Active Schemes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">₹${totalCollected.toLocaleString("en-IN")}</div>
              <div class="stat-label">Total Collected</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${pendingPayments}</div>
              <div class="stat-label">Pending Payments</div>
            </div>
          </div>

          <h2>Active Schemes</h2>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Monthly</th>
                <th>Progress</th>
                <th>Maturity</th>
              </tr>
            </thead>
            <tbody>
              ${schemes
                .filter((s) => s.status === "active")
                .slice(0, 10)
                .map(
                  (s) => `
                <tr>
                  <td>${s.customer?.name || "Unknown"}</td>
                  <td>₹${s.monthly_amount.toLocaleString("en-IN")}</td>
                  <td>${s.months_paid}/${s.total_months}</td>
                  <td>${formatDate(s.maturity_date)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by Silver Savings Scheme Application</p>
          </div>
        </body>
        </html>
      `;

      // Open in new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      name: "Customers",
      description: `${customers.length} records`,
      icon: Users,
      action: exportCustomersCSV,
      loading: exporting === "customers",
    },
    {
      name: "Schemes",
      description: `${schemes.length} records`,
      icon: FileIcon,
      action: exportSchemesCSV,
      loading: exporting === "schemes",
    },
    {
      name: "Payments",
      description: `${payments.length} records`,
      icon: FileSpreadsheet,
      action: exportPaymentsCSV,
      loading: exporting === "payments",
    },
    {
      name: "PDF Report",
      description: "Summary report with statistics",
      icon: FileText,
      action: generatePDFReport,
      loading: exporting === "report",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-silver-100">Export</h1>
          <p className="text-silver-500 mt-1">Export your data to CSV or generate reports</p>
        </div>

        {/* Export All Button */}
        <button
          onClick={exportAllCSV}
          disabled={!!exporting}
          className="w-full btn-primary flex items-center justify-center gap-3 py-4"
        >
          <Download className="w-5 h-5" />
          {exporting ? "Exporting..." : "Export All Data (CSV)"}
        </button>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exportOptions.map((option) => (
            <div key={option.name} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-800 flex items-center justify-center">
                    <option.icon className="w-6 h-6 text-silver-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-silver-100">{option.name}</h3>
                    <p className="text-sm text-silver-500">{option.description}</p>
                  </div>
                </div>
                <button
                  onClick={option.action}
                  disabled={option.loading}
                  className="btn-secondary btn-sm"
                >
                  {option.loading ? "Exporting..." : "Export"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="card bg-navy-900/30 border-silver-500/20">
          <h3 className="font-semibold text-silver-100 mb-2">Export Information</h3>
          <ul className="text-sm text-silver-400 space-y-1">
            <li>• CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</li>
            <li>• PDF reports are generated for printing and sharing</li>
            <li>• All exports include current data from your database</li>
            <li>• Files are downloaded to your default downloads folder</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}