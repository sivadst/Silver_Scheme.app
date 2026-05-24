"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSettings } from "@/lib/hooks/useData";

export default function SettingsPage() {
  const { settings, updateSetting, getSetting } = useSettings();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    business_name: getSetting("business_name") || "Silver Savings Scheme",
    contact_phone: getSetting("contact_phone") || "",
    contact_email: getSetting("contact_email") || "",
    address: getSetting("address") || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateSetting("business_name", formData.business_name),
        updateSetting("contact_phone", formData.contact_phone),
        updateSetting("contact_email", formData.contact_email),
        updateSetting("address", formData.address),
      ]);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-silver-100">Settings</h1>
          <p className="text-silver-500 mt-1">Configure your business information</p>
        </div>

        {/* Business Information */}
        <div className="card max-w-2xl">
          <h2 className="text-lg font-semibold text-silver-100 mb-6">Business Information</h2>
          <div className="space-y-4">
            <div>
              <label className="input-label">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                className="input"
                placeholder="Your business name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className="input-label">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label className="input-label">Business Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input"
                rows={3}
                placeholder="Your business address"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="card max-w-2xl">
          <h2 className="text-lg font-semibold text-silver-100 mb-6">System Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-navy-700/50">
              <span className="text-silver-400">Application Version</span>
              <span className="text-silver-200 font-mono">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-navy-700/50">
              <span className="text-silver-400">Database</span>
              <span className="text-silver-200">Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-navy-700/50">
              <span className="text-silver-400">Framework</span>
              <span className="text-silver-200">Next.js 14</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-navy-700/50">
              <span className="text-silver-400">Styling</span>
              <span className="text-silver-200">Tailwind CSS</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-silver-400">Status</span>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="card max-w-2xl bg-navy-900/30 border-silver-500/20">
          <h2 className="text-lg font-semibold text-silver-100 mb-4">Need Help?</h2>
          <p className="text-sm text-silver-400 mb-4">
            If you encounter any issues or have questions about using the Silver Savings Scheme
            application, please refer to the documentation or contact support.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-sm text-silver-300 hover:text-silver-100 transition-colors"
            >
              📖 Documentation
            </a>
            <a
              href="#"
              className="text-sm text-silver-300 hover:text-silver-100 transition-colors"
            >
              📧 Contact Support
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}