import { format, formatDistanceToNow } from "date-fns";

// Format currency (INR)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format currency with decimals
export const formatCurrencyDecimal = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "dd MMM yyyy");
  } catch {
    return dateString;
  }
};

// Format date short
export const formatDateShort = (dateString: string): string => {
  try {
    return format(new Date(dateString), "dd/MM/yy");
  } catch {
    return dateString;
  }
};

// Format relative time
export const formatRelativeTime = (dateString: string): string => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

// Calculate months between two dates
export const monthsBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
};

// Add months to a date
export const addMonths = (dateString: string, months: number): string => {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split("T")[0];
};

// Get today's date in ISO format
export const getTodayISO = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Check if date is overdue
export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};

// Calculate days until/overdue
export const daysUntil = (targetDate: string): number => {
  const target = new Date(targetDate);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Generate a simple ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// Status color mapping
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: "badge-success",
    completed: "badge-info",
    cancelled: "badge-neutral",
    inactive: "badge-neutral",
    pending: "badge-warning",
    paid: "badge-success",
    overdue: "badge-danger",
  };
  return colors[status] || "badge-neutral";
};

// Status label mapping
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    inactive: "Inactive",
    pending: "Pending",
    paid: "Paid",
    overdue: "Overdue",
  };
  return labels[status] || status;
};

// Calculate total collection for a scheme
export const calculateTotalCollection = (monthlyAmount: number, monthsPaid: number): number => {
  return monthlyAmount * monthsPaid;
};

// Calculate remaining amount for a scheme
export const calculateRemainingAmount = (monthlyAmount: number, totalMonths: number, monthsPaid: number): number => {
  return monthlyAmount * (totalMonths - monthsPaid);
};

// Calculate silver entitlement
export const calculateSilverEntitlement = (totalCollection: number, silverRate: number): number => {
  if (silverRate === 0) return 0;
  return totalCollection / silverRate;
};

// Validate phone number (Indian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};