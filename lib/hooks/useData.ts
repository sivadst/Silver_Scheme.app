"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/database.types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type Scheme = Database["public"]["Tables"]["schemes"]["Row"];
type Payment = Database["public"]["Tables"]["payments"]["Row"];
type Setting = Database["public"]["Tables"]["settings"]["Row"];

// Hook for fetching customers
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const addCustomer = async (customer: Omit<Customer, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("customers").insert([customer]).select();
    if (error) throw error;
    await fetchCustomers();
    return data?.[0];
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const { error } = await supabase.from("customers").update(updates).eq("id", id);
    if (error) throw error;
    await fetchCustomers();
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
    await fetchCustomers();
  };

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
};

// Hook for fetching schemes
export const useSchemes = () => {
  const [schemes, setSchemes] = useState<(Scheme & { customer?: Customer })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchemes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("schemes")
        .select("*, customer:customers(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSchemes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const addScheme = async (scheme: Omit<Scheme, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("schemes").insert([scheme]).select();
    if (error) throw error;
    await fetchSchemes();
    return data?.[0];
  };

  const updateScheme = async (id: string, updates: Partial<Scheme>) => {
    const { error } = await supabase.from("schemes").update(updates).eq("id", id);
    if (error) throw error;
    await fetchSchemes();
  };

  const deleteScheme = async (id: string) => {
    const { error } = await supabase.from("schemes").delete().eq("id", id);
    if (error) throw error;
    await fetchSchemes();
  };

  return {
    schemes,
    loading,
    error,
    addScheme,
    updateScheme,
    deleteScheme,
    refetch: fetchSchemes,
  };
};

// Hook for fetching payments
export const usePayments = () => {
  const [payments, setPayments] = useState<(Payment & { scheme?: Scheme & { customer?: Customer } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*, scheme:schemes(*, customer:customers(*))")
        .order("due_date", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const addPayment = async (payment: Omit<Payment, "id" | "created_at" | "updated_at">) => {
    const { data, error } = await supabase.from("payments").insert([payment]).select();
    if (error) throw error;
    await fetchPayments();
    return data?.[0];
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    const { error } = await supabase.from("payments").update(updates).eq("id", id);
    if (error) throw error;
    await fetchPayments();
  };

  const deletePayment = async (id: string) => {
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) throw error;
    await fetchPayments();
  };

  return {
    payments,
    loading,
    error,
    addPayment,
    updatePayment,
    deletePayment,
    refetch: fetchPayments,
  };
};

// Hook for fetching settings
export const useSettings = () => {
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;

      const settingsMap: Record<string, Setting> = {};
      data?.forEach((setting) => {
        settingsMap[setting.key] = setting;
      });
      setSettings(settingsMap);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase.from("settings").update({ value }).eq("key", key);
    if (error) throw error;
    await fetchSettings();
  };

  const getSetting = (key: string): string | undefined => {
    return settings[key]?.value;
  };

  return {
    settings,
    loading,
    error,
    updateSetting,
    getSetting,
    refetch: fetchSettings,
  };
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeSchemes: 0,
    totalCollection: 0,
    pendingPayments: 0,
    overduePayments: 0,
    monthlyCollection: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch customers count
        const { count: customerCount } = await supabase
          .from("customers")
          .select("*", { count: "exact", head: true });

        // Fetch active schemes
        const { data: activeSchemes } = await supabase
          .from("schemes")
          .select("monthly_amount")
          .eq("status", "active");

        // Fetch payments
        const { data: payments } = await supabase
          .from("payments")
          .select("amount, status, due_date")
          .in("status", ["pending", "paid", "overdue"]);

        const activeSchemesCount = activeSchemes?.length || 0;
        const totalCollection = activeSchemes?.reduce((sum, scheme) => sum + Number(scheme.monthly_amount), 0) || 0;
        
        const pendingPayments = payments?.filter((p) => p.status === "pending").length || 0;
        const overduePayments = payments?.filter((p) => p.status === "overdue").length || 0;
        const paidPayments = payments?.filter((p) => p.status === "paid") || [];
        const monthlyCollection = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);

        setStats({
          totalCustomers: customerCount || 0,
          activeSchemes: activeSchemesCount,
          totalCollection,
          pendingPayments,
          overduePayments,
          monthlyCollection,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};