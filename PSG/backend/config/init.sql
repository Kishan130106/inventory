-- PSG Inventory Management System - Database Schema
-- Run this on your PostgreSQL server at 192.168.1.20

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  short_code VARCHAR(20) NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  short_code VARCHAR(20) NOT NULL,
  warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100),
  unit_of_measure VARCHAR(30) DEFAULT 'pcs',
  unit_cost NUMERIC(10,2) DEFAULT 0,
  description TEXT,
  reorder_level INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock table
CREATE TABLE IF NOT EXISTS stock (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  location_id INT REFERENCES locations(id) ON DELETE CASCADE,
  on_hand INT DEFAULT 0,
  free_to_use INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, location_id)
);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  supplier VARCHAR(100),
  schedule_date DATE,
  responsible VARCHAR(100),
  warehouse_id INT REFERENCES warehouses(id),
  location_id INT REFERENCES locations(id),
  status VARCHAR(20) DEFAULT 'Draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Receipt items table
CREATE TABLE IF NOT EXISTS receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INT REFERENCES receipts(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 0,
  unit_cost NUMERIC(10,2) DEFAULT 0
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  delivery_address TEXT,
  responsible VARCHAR(100),
  schedule_date DATE,
  warehouse_id INT REFERENCES warehouses(id),
  location_id INT REFERENCES locations(id),
  status VARCHAR(20) DEFAULT 'Draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery items table
CREATE TABLE IF NOT EXISTS delivery_items (
  id SERIAL PRIMARY KEY,
  delivery_id INT REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 0
);

-- Internal transfers table
CREATE TABLE IF NOT EXISTS internal_transfers (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  from_location_id INT REFERENCES locations(id),
  to_location_id INT REFERENCES locations(id),
  responsible VARCHAR(100),
  schedule_date DATE,
  status VARCHAR(20) DEFAULT 'Draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Internal transfer items
CREATE TABLE IF NOT EXISTS transfer_items (
  id SERIAL PRIMARY KEY,
  transfer_id INT REFERENCES internal_transfers(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 0
);

-- Stock adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  product_id INT REFERENCES products(id),
  location_id INT REFERENCES locations(id),
  old_quantity INT DEFAULT 0,
  new_quantity INT DEFAULT 0,
  reason TEXT,
  adjusted_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Move history (ledger)
CREATE TABLE IF NOT EXISTS move_history (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50),
  operation_type VARCHAR(30),
  from_location VARCHAR(100),
  to_location VARCHAR(100),
  product_id INT REFERENCES products(id),
  quantity INT,
  contact VARCHAR(100),
  schedule_date DATE,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- OTP table for password reset
CREATE TABLE IF NOT EXISTS otp_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default warehouse
INSERT INTO warehouses (name, short_code, address)
VALUES ('Main Warehouse', 'WH', 'Patel Sports & Goods, Ahmedabad, Gujarat')
ON CONFLICT (short_code) DO NOTHING;

-- Seed default locations
INSERT INTO locations (name, short_code, warehouse_id)
VALUES
  ('Main Store', 'WH-MAIN', 1),
  ('Production Rack', 'WH-PROD', 1),
  ('Rack A', 'WH-RACK-A', 1),
  ('Rack B', 'WH-RACK-B', 1)
ON CONFLICT DO NOTHING;

-- Seed default admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, role)
VALUES ('Admin', 'PSG', 'admin@psg.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;
