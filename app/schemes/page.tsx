"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import { useSchemes, useCustomers } from "@/lib/hooks/useData";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getInitials, getTodayISO, addMonths } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type Scheme = Database["public"]["Tables"]["schemes"]["Row"];

export default function SchemesPage() {
  const { schemes, loading, addScheme, updateScheme, deleteScheme } = useSchemes();
  const { customers } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    monthly_amount: "",
    total_months: "",
    start_date: getTodayISO(),
    silver_rate: "",
    total_grams: "",
    notes: "",
    status: "active" as Scheme["status"],
  });

  const filteredSchemes = schemes.filter((scheme) => {
    const customerName = scheme.customer?.name?.toLowerCase() || "";
    return customerName.includes(searchQuery.toLowerCase());
  });

  const handleOpenModal = (scheme?: Scheme) => {
    if (scheme) {
      setEditingScheme(scheme);
      setFormData({
        customer_id: scheme.customer_id,
        monthly_amount: scheme.monthly_amount.toString(),
        total_months: scheme.total_months.toString(),
        start_date: scheme.start_date,
        silver_rate: scheme.silver_rate_at_start.toString(),
        total_grams: scheme.total_silver_grams.toString(),
        notes: scheme.notes || "",
        status: scheme.status,
      });
    } else {
      setEditingScheme(null);
      setFormData({
        customer_id: "",
        monthly_amount: "",
        total_months: "",
        start_date: getTodayISO(),
        silver_rate: "",
        total_grams: "",
        notes: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScheme(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateMaturityDate = () => {
    if (formData.start_date && formData.total_months) {
      return addMonths(formData.start_date, parseInt(formData.total_months));
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const schemeData = {
        customer_id: formData.customer_id,
        monthly_amount: parseFloat(formData.monthly_amount),
        total_months: parseInt(formData.total_months),
        months_paid: editingScheme?.months_paid || 0,
        start_date: formData.start_date,
        maturity_date: calculateMaturityDate(),
        silver_rate_at_start: parseFloat(formData.silver_rate),
        total_silver_grams: parseFloat(formData.total_grams),
        notes: formData.notes,
        status: formData.status,
      };

      if (editingScheme) {
        await updateScheme(editingScheme.id, schemeData);
      } else {
        await addScheme(schemeData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving scheme:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this scheme?")) {
      try {
        await deleteScheme(id);
      } catch (error) {
        console.error("Error deleting scheme:", error);
      }
    }
  };

  const getProgress = (scheme: Scheme) => {
    return (scheme.months_paid / scheme.total_months) * 100;
  };

  const getTotalCollected = (scheme: Scheme) => {
    return scheme.monthly_amount * scheme.months_paid;
  };

  const getRemainingAmount = (scheme: Scheme) => {
    return scheme.monthly_amount * (scheme.total_months - scheme.months_paid);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-silver-100">Schemes</h1>
            <p className="text-silver-500 mt-1">Manage silver savings schemes</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Scheme
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver-500" />
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
          />
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-silver-500">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => (
              <div key={scheme.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-silver-500 to-silver-700 flex items-center justify-center">
                      <span className="text-lg font-bold text-navy-950">
                        {getInitials(scheme.customer?.name || "U")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-silver-100">
                        {scheme.customer?.name || "Unknown Customer"}
                      </h3>
                      <span className={`badge ${getStatusColor(scheme.status)} text-xs`}>
                        {getStatusLabel(scheme.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(scheme)}
                      className="text-silver-500 hover:text-silver-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(scheme.id)}
                      className="text-silver-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-silver-400">Progress</span>
                      <span className="text-silver-300">
                        {scheme.months_paid}/{scheme.total_months} months
                      </span>
                    </div>
                    <div className="w-full bg-navy-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-silver-500 to-silver-400 h-2 rounded-full transition-all"
                        style={{ width: `${getProgress(scheme)}%` }}
                      />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-silver-500 uppercase">Monthly</p>
                      <p className="text-sm font-semibold text-silver-200">
                        {formatCurrency(scheme.monthly_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-silver-500 uppercase">Collected</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(getTotalCollected(scheme))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-silver-500 uppercase">Remaining</p>
                      <p className="text-sm font-semibold text-amber-400">
                        {formatCurrency(getRemainingAmount(scheme))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-silver-500 uppercase">Silver Rate</p>
                      <p className="text-sm font-semibold text-silver-200">
                        ₹{scheme.silver_rate_at_start}/g
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-silver-500 uppercase">Total Grams</p>
                      <p className="text-sm font-semibold text-silver-200">
                        {scheme.total_silver_grams}g
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-silver-500 uppercase">Maturity</p>
                      <p className="text-sm font-semibold text-silver-200">
                        {formatDate(scheme.maturity_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredSchemes.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-silver-500">No schemes found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Scheme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingScheme ? "Edit Scheme" : "New Scheme"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Customer *</label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleInputChange}
              className="input"
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Monthly Amount (₹) *</label>
              <input
                type="number"
                name="monthly_amount"
                value={formData.monthly_amount}
                onChange={handleInputChange}
                className="input"
                required
                min="0"
                step="100"
              />
            </div>
            <div>
              <label className="input-label">Duration (Months) *</label>
              <input
                type="number"
                name="total_months"
                value={formData.total_months}
                onChange={handleInputChange}
                className="input"
                required
                min="1"
                max="60"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="input-label">Maturity Date</label>
              <input
                type="text"
                value={calculateMaturityDate()}
                className="input bg-navy-800 text-silver-500"
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Silver Rate (₹/gram) *</label>
              <input
                type="number"
                name="silver_rate"
                value={formData.silver_rate}
                onChange={handleInputChange}
                className="input"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="input-label">Total Grams *</label>
              <input
                type="number"
                name="total_grams"
                value={formData.total_grams}
                onChange={handleInputChange}
                className="input"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="input"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="input-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="input"
              rows={2}
            />
          </div>
          <div className="modal-footer px-0 pb-0">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingScheme ? "Update" : "Create"} Scheme
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}