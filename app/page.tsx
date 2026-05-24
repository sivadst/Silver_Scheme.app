"use client";

import { Users, FileText, CreditCard, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { useDashboardStats } from "@/lib/hooks/useData";
import { usePayments } from "@/lib/hooks/useData";
import { useSchemes } from "@/lib/hooks/useData";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sample chart data - in production, this would come from the database
const chartData = [
  { name: "Jan", collection: 45000 },
  { name: "Feb", collection: 52000 },
  { name: "Mar", collection: 48000 },
  { name: "Apr", collection: 61000 },
  { name: "May", collection: 55000 },
  { name: "Jun", collection: 67000 },
];

export default function Dashboard() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { payments } = usePayments();
  const { schemes } = useSchemes();

  const recentPayments = payments.slice(0, 5);

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-silver-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-silver-100">Dashboard</h1>
          <p className="text-silver-500 mt-1">Overview of your silver savings scheme</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<Users className="w-6 h-6 text-white" />}
            color="silver"
          />
          <StatCard
            title="Active Schemes"
            value={stats.activeSchemes}
            icon={<FileText className="w-6 h-6 text-white" />}
            color="blue"
          />
          <StatCard
            title="Monthly Collection"
            value={formatCurrency(stats.monthlyCollection)}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color="emerald"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={<CreditCard className="w-6 h-6 text-white" />}
            color="gold"
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collection Chart */}
          <div className="lg:col-span-2 card">
            <h2 className="text-lg font-semibold text-silver-100 mb-6">
              Monthly Collection Trend
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243b53" />
                  <XAxis dataKey="name" stroke="#718096" />
                  <YAxis stroke="#718096" tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#102a43",
                      border: "1px solid #243b53",
                      borderRadius: "8px",
                      color: "#edf2f7",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Collection"]}
                  />
                  <Bar
                    dataKey="collection"
                    fill="url(#colorGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#718096" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4a5568" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="card">
            <h2 className="text-lg font-semibold text-silver-100 mb-6">
              Recent Payments
            </h2>
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <p className="text-silver-500 text-sm">No recent payments</p>
              ) : (
                recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-navy-800/50 hover:bg-navy-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-silver-500/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-silver-300">
                          {payment.scheme?.customer?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-silver-200">
                          {payment.scheme?.customer?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-silver-500">
                          {formatDate(payment.due_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-silver-200">
                        {formatCurrency(payment.amount)}
                      </p>
                      <span className={`badge ${getStatusColor(payment.status)} text-xs`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Active Schemes Table */}
        <div className="card">
          <h2 className="text-lg font-semibold text-silver-100 mb-6">
            Active Schemes
          </h2>
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Monthly Amount</th>
                  <th className="table-th">Progress</th>
                  <th className="table-th">Maturity Date</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {schemes.filter(s => s.status === "active").slice(0, 5).map((scheme) => (
                  <tr key={scheme.id} className="table-tr">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-silver-500/20 flex items-center justify-center">
                          <span className="text-xs font-medium text-silver-300">
                            {scheme.customer?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <span className="text-silver-200">
                          {scheme.customer?.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="table-td">{formatCurrency(scheme.monthly_amount)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-navy-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-silver-500 to-silver-400 h-2 rounded-full"
                            style={{
                              width: `${(scheme.months_paid / scheme.total_months) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-silver-500">
                          {scheme.months_paid}/{scheme.total_months}
                        </span>
                      </div>
                    </td>
                    <td className="table-td">{formatDate(scheme.maturity_date)}</td>
                    <td className="table-td">
                      <span className={`badge ${getStatusColor(scheme.status)}`}>
                        {getStatusLabel(scheme.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}