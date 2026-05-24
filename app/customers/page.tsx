"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/Modal";
import { useCustomers } from "@/lib/hooks/useData";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getInitials } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];

export default function CustomersPage() {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    aadhaar: "",
    notes: "",
    status: "active" as Customer["status"],
  });

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        aadhaar: customer.aadhaar || "",
        notes: customer.notes || "",
        status: customer.status,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        aadhaar: "",
        notes: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await addCustomer(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteCustomer(id);
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-silver-100">Customers</h1>
            <p className="text-silver-500 mt-1">Manage your scheme customers</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver-500" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
          />
        </div>

        {/* Customers Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-silver-500">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="card card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-silver-500 to-silver-700 flex items-center justify-center">
                      <span className="text-lg font-bold text-navy-950">
                        {getInitials(customer.name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-silver-100">{customer.name}</h3>
                      <span className={`badge ${getStatusColor(customer.status)} text-xs`}>
                        {getStatusLabel(customer.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(customer)}
                      className="text-silver-500 hover:text-silver-300 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-silver-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {customer.phone && (
                    <p className="text-sm text-silver-400">📱 {customer.phone}</p>
                  )}
                  {customer.email && (
                    <p className="text-sm text-silver-400">✉️ {customer.email}</p>
                  )}
                  {customer.aadhaar && (
                    <p className="text-sm text-silver-400">ID: {customer.aadhaar}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCustomers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-silver-500">No customers found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="input-label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="input"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Aadhaar / ID</label>
              <input
                type="text"
                name="aadhaar"
                value={formData.aadhaar}
                onChange={handleInputChange}
                className="input"
              />
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
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="input"
              rows={3}
            />
          </div>
          <div className="modal-footer px-0 pb-0">
            <button type="button" onClick={handleCloseModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCustomer ? "Update" : "Add"} Customer
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}