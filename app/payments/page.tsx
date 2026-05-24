"use client";

import { useState } from "react";
import { Search, CheckCircle, Clock, AlertCircle, Edit2, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import { usePayments, useSchemes } from "@/lib/hooks/useData";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getTodayISO } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type Payment = Database["public"]["Tables"]["payments"]["Row"];
type Scheme = Database["public"]["Tables"]["schemes"]["Row"];

export default function PaymentsPage() {
  const { payments, loading, addPayment, updatePayment } = usePayments();
  const { schemes } = useSchemes();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    scheme_id: "",
    due_date: getTodayISO(),
    amount: "",
    status: "pending" as Payment["status"],
    payment_method: "",
    receipt_number: "",
    notes: "",
  });

  const filteredPayments = payments.filter((payment) => {
    const customerName = payment.scheme?.customer?.name?.toLowerCase() || "";
    const matchesSearch = customerName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        scheme_id: payment.scheme_id,
        due_date: payment.due_date,
        amount: payment.amount.toString(),
        status: payment.status,
        payment_method: payment.payment_method || "",
        receipt_number: payment.receipt_number || "",
        notes: payment.notes || "",
      });
    } else {
      setEditingPayment(null);
      setFormData({
        scheme_id: "",
        due_date: getTodayISO(),
        amount: "",
        status: "pending",
        payment_method: "",
        receipt_number: "",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPayment(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const paymentData = {
        scheme_id: formData.scheme_id,
        due_date: formData.due_date,
        amount: parseFloat(formData.amount),
        status: formData.status,
        paid_date: formData.status === "paid" ? getTodayISO() : null,
        payment_method: formData.payment_method,
        receipt_number: formData.receipt_number,
        notes: formData.notes,
      };

      if (editingPayment) {
        await updatePayment(editingPayment.id, paymentData);
      } else {
        await addPayment(paymentData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving payment:", error);
    }
  };

  const markAsPaid = async (payment: Payment) => {
    try {
      await updatePayment(payment.id, {
        status: "paid",
        paid_date: getTodayISO(),
      });
    } catch (error) {
      console.error("Error marking payment as paid:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      default:
        return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const getSchemeForPayment = (schemeId: string) => {
    return schemes.find((s) => s.id === schemeId);
  };

  const stats = {
    total: filteredPayments.length,
    paid: filteredPayments.filter((p) => p.status === "paid").length,
    pending: filteredPayments.filter((p) => p.status === "pending").length,
    overdue: filteredPayments.filter((p) => p.status === "overdue").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-silver-100">Payments</h1>
            <p className="text-silver-500 mt-1">Track and manage payments</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            Record Payment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-silver-500">Total</p>
            <p className="text-2xl font-bold text-silver-100">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-emerald-500">Paid</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.paid}</p>
          </div>
          <div className="card">
            <p className="text-sm text-amber-500">Pending</p>
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          </div>
          <div className="card">
            <p className="text-sm text-rose-500">Overdue</p>
            <p className="text-2xl font-bold text-rose-400">{stats.overdue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver-500" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Payments Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-silver-500">Loading...</div>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-th">Customer</th>
                    <th className="table-th">Due Date</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Payment Method</th>
                    <th className="table-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="table-tr">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-silver-500/20 flex items-center justify-center">
                            <span className="text-xs font-medium text-silver-300">
                              {payment.scheme?.customer?.name?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-silver-200">
                              {payment.scheme?.customer?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-silver-500">
                              {payment.scheme?.customer?.phone || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">{formatDate(payment.due_date)}</td>
                      <td className="table-td">
                        <span className="font-semibold text-silver-200">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <span className={`badge ${getStatusColor(payment.status)}`}>
                            {getStatusLabel(payment.status)}
                          </span>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="text-silver-400">
                          {payment.payment_method || "-"}
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          {payment.status !== "paid" && (
                            <button
                              onClick={() => markAsPaid(payment)}
                              className="text-emerald-500 hover:text-emerald-400 transition-colors"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(payment)}
                            className="text-silver-500 hover:text-silver-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredPayments.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-silver-500">No payments found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPayment ? "Edit Payment" : "Record Payment"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Scheme *</label>
            <select
              name="scheme_id"
              value={formData.scheme_id}
              onChange={handleInputChange}
              className="input"
              required
            >
              <option value="">Select a scheme</option>
              {schemes.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.customer?.name} - ₹{scheme.monthly_amount}/month
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Due Date *</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="input-label">Amount (₹) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="input"
                required
                min="0"
                step="100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="input-label">Payment Method</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">Select method</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Receipt Number</label>
            <input
              type="text"
              name="receipt_number"
              value={formData.receipt_number}
              onChange={handleInputChange}
              className="input"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="input-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="input"
              rows={2}
              placeholder="Optional"
            />
          </div>
          <div className="modal-footer px-0 pb-0">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingPayment ? "Update" : "Record"} Payment
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}