"use client";

import { useState, useEffect } from "react";
import { Save, TrendingUp, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSettings, useSchemes } from "@/lib/hooks/useData";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const { settings, updateSetting, getSetting } = useSettings();
  const { schemes } = useSchemes();
  const [currentRate, setCurrentRate] = useState(getSetting("current_silver_rate") || "90");
  const [saving, setSaving] = useState(false);

  const activeSchemes = schemes.filter((s) => s.status === "active");

  // Calculate total liability
  const totalSilverGrams = activeSchemes.reduce((sum, scheme) => sum + Number(scheme.total_silver_grams), 0);
  const totalCollected = activeSchemes.reduce(
    (sum, scheme) => sum + Number(scheme.monthly_amount) * scheme.months_paid,
    0
  );
  const estimatedLiability = totalSilverGrams * parseFloat(currentRate || "0");
  const difference = estimatedLiability - totalCollected;

  const handleSaveRate = async () => {
    setSaving(true);
    try {
      await updateSetting("current_silver_rate", currentRate);
    } catch (error) {
      console.error("Error updating silver rate:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-silver-100">Inventory</h1>
          <p className="text-silver-500 mt-1">Silver rate management and liability tracking</p>
        </div>

        {/* Silver Rate Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-silver-100">Current Silver Rate</h2>
              <p className="text-sm text-silver-500">Update the current market rate per gram</p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-silver-500" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="input-label">Rate (₹/gram)</label>
              <input
                type="number"
                value={currentRate}
                onChange={(e) => setCurrentRate(e.target.value)}
                className="input text-2xl font-bold"
                step="0.01"
                min="0"
              />
            </div>
            <button
              onClick={handleSaveRate}
              disabled={saving}
              className="btn-primary flex items-center gap-2 self-end h-12"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Rate"}
            </button>
          </div>
        </div>

        {/* Liability Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <p className="text-sm text-silver-500 uppercase tracking-wider">Total Silver (Grams)</p>
            <p className="text-3xl font-bold text-silver-100 mt-2">{totalSilverGrams.toFixed(2)}g</p>
            <p className="text-xs text-silver-500 mt-2">Across {activeSchemes.length} active schemes</p>
          </div>
          <div className="card">
            <p className="text-sm text-silver-500 uppercase tracking-wider">Total Collected</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">{formatCurrency(totalCollected)}</p>
            <p className="text-xs text-silver-500 mt-2">From all active schemes</p>
          </div>
          <div className="card">
            <p className="text-sm text-silver-500 uppercase tracking-wider">Estimated Liability</p>
            <p className="text-3xl font-bold text-amber-400 mt-2">{formatCurrency(estimatedLiability)}</p>
            <p className="text-xs text-silver-500 mt-2">At current rate of ₹{currentRate}/g</p>
          </div>
        </div>

        {/* Difference Alert */}
        {difference > 0 && (
          <div className="card border-rose-500/30 bg-rose-500/5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-rose-400">Liability Alert</h3>
                <p className="text-sm text-rose-300 mt-1">
                  Your estimated liability ({formatCurrency(estimatedLiability)}) is higher than
                  the total amount collected ({formatCurrency(totalCollected)}).
                </p>
                <p className="text-sm text-rose-400 font-semibold mt-2">
                  Difference: {formatCurrency(difference)}
                </p>
              </div>
            </div>
          </div>
        )}

        {difference < 0 && (
          <div className="card border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-emerald-400">Positive Position</h3>
                <p className="text-sm text-emerald-300 mt-1">
                  Your total collections exceed the estimated liability.
                </p>
                <p className="text-sm text-emerald-400 font-semibold mt-2">
                  Surplus: {formatCurrency(Math.abs(difference))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Schemes Detail */}
        <div className="card">
          <h2 className="text-lg font-semibold text-silver-100 mb-6">Active Schemes Breakdown</h2>
          {activeSchemes.length === 0 ? (
            <p className="text-silver-500 text-center py-8">No active schemes</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-silver-400 uppercase">Customer</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-silver-400 uppercase">Silver (g)</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-silver-400 uppercase">Collected</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-silver-400 uppercase">Liability</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-silver-400 uppercase">Diff</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSchemes.map((scheme) => {
                    const collected = Number(scheme.monthly_amount) * scheme.months_paid;
                    const liability = Number(scheme.total_silver_grams) * parseFloat(currentRate || "0");
                    const diff = liability - collected;
                    return (
                      <tr key={scheme.id} className="border-b border-navy-700/50 hover:bg-navy-800/30">
                        <td className="py-3 px-4 text-silver-200">
                          {scheme.customer?.name || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-right text-silver-200">
                          {Number(scheme.total_silver_grams).toFixed(2)}g
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-400">
                          {formatCurrency(collected)}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-400">
                          {formatCurrency(liability)}
                        </td>
                        <td className={`py-3 px-4 text-right ${diff > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                          {diff > 0 ? "-" : "+"}{formatCurrency(Math.abs(diff))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}