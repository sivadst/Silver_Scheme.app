-- Silver Savings Scheme Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  aadhaar VARCHAR(20),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed'))
);

-- Schemes Table
CREATE TABLE IF NOT EXISTS schemes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  monthly_amount DECIMAL(10,2) NOT NULL,
  total_months INTEGER NOT NULL,
  months_paid INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  silver_rate_at_start DECIMAL(10,2) NOT NULL,
  total_silver_grams DECIMAL(10,2) NOT NULL,
  notes TEXT
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  paid_date DATE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_method VARCHAR(50),
  receipt_number VARCHAR(100),
  notes TEXT
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_schemes_customer_id ON schemes(customer_id);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON schemes(status);
CREATE INDEX IF NOT EXISTS idx_payments_scheme_id ON payments(scheme_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON schemes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('current_silver_rate', '90', 'Current silver rate per gram in INR'),
  ('business_name', 'Silver Savings Scheme', 'Business name'),
  ('contact_phone', '', 'Business contact phone'),
  ('contact_email', '', 'Business contact email'),
  ('address', '', 'Business address')
ON CONFLICT (key) DO NOTHING;

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can customize this later)
-- In production, you would want to add proper auth policies

CREATE POLICY "Allow all operations on customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on schemes" ON schemes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on settings" ON settings
  FOR ALL USING (true) WITH CHECK (true);

-- Sample Data (Optional - remove if you don't want sample data)
-- Uncomment the lines below to insert sample data

-- INSERT INTO customers (name, phone, email, address, status) VALUES
--   ('Rajesh Kumar', '9876543210', 'rajesh@email.com', '123 Main St, Mumbai', 'active'),
--   ('Priya Sharma', '9876543211', 'priya@email.com', '456 Park Ave, Delhi', 'active'),
--   ('Amit Patel', '9876543212', 'amit@email.com', '789 Lake Rd, Ahmedabad', 'active'),
--   ('Sneha Reddy', '9876543213', 'sneha@email.com', '321 Hill St, Hyderabad', 'active'),
--   ('Vikram Singh', '9876543214', 'vikram@email.com', '654 River Rd, Jaipur', 'active');

-- INSERT INTO schemes (customer_id, monthly_amount, total_months, start_date, maturity_date, silver_rate_at_start, total_silver_grams, status) VALUES
--   ((SELECT id FROM customers WHERE name = 'Rajesh Kumar'), 5000, 12, '2024-01-01', '2024-12-01', 85, 70.59, 'active'),
--   ((SELECT id FROM customers WHERE name = 'Priya Sharma'), 3000, 10, '2024-03-01', '2024-12-01', 88, 40.91, 'active'),
--   ((SELECT id FROM customers WHERE name = 'Amit Patel'), 7500, 15, '2024-02-01', '2025-04-01', 82, 137.20, 'active');