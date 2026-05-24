"use client";

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: "silver" | "gold" | "emerald" | "rose" | "blue";
}

const colorClasses = {
  silver: "from-silver-500 to-silver-700",
  gold: "from-gold-400 to-gold-600",
  emerald: "from-emerald-500 to-emerald-700",
  rose: "from-rose-500 to-rose-700",
  blue: "from-blue-500 to-blue-700",
};

export default function StatCard({ title, value, icon, trend, color = "silver" }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-xs font-medium ${trend.value >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {trend.value >= 0 ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-silver-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}