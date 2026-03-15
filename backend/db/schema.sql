-- =============================================
-- PSG INVENTORY - FULL DATABASE SCHEMA
-- Run this once to initialize the database:
--   psql -U postgres -d psg_inventory -f schema.sql
-- =============================================

-- ============================
-- USERS (Google Auth + OTP)
-- ============================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',          -- 'admin' | 'manager' | 'staff'
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- PRODUCT CATEGORIES
-- ============================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- PRODUCTS (Sports Equipment)
-- ============================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    sport_type VARCHAR(100),
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    unit VARCHAR(50) DEFAULT 'pieces',
    reorder_level INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- LOCATIONS (Warehouses / Racks)
-- ============================
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50),   -- 'warehouse' | 'rack' | 'court' | 'floor'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- STOCK (Current Quantity per location)
-- ============================
CREATE TABLE IF NOT EXISTS stock (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    quantity INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, location_id)
);

-- ============================
-- MOVEMENTS (Inventory Ledger)
-- ============================
CREATE TABLE IF NOT EXISTS movements (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    type VARCHAR(50),   -- 'receipt' | 'delivery' | 'transfer' | 'adjustment'
    source_location INT REFERENCES locations(id),
    destination_location INT REFERENCES locations(id),
    quantity INT,
    reference VARCHAR(200),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- RECEIPTS (Incoming Stock)
-- ============================
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    supplier VARCHAR(150),
    status VARCHAR(50) DEFAULT 'draft',  -- 'draft' | 'waiting' | 'done' | 'cancelled'
    destination_location INT REFERENCES locations(id),
    created_by INT REFERENCES users(id),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_id INT REFERENCES receipts(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT,
    received_quantity INT DEFAULT 0
);

-- ============================
-- DELIVERIES (Outgoing Stock)
-- ============================
CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    customer VARCHAR(150),
    status VARCHAR(50) DEFAULT 'draft',  -- 'draft' | 'waiting' | 'ready' | 'done' | 'cancelled'
    source_location INT REFERENCES locations(id),
    created_by INT REFERENCES users(id),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_items (
    id SERIAL PRIMARY KEY,
    delivery_id INT REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT
);

-- ============================
-- TRANSFERS (Internal Movement)
-- ============================
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    source_location INT REFERENCES locations(id),
    destination_location INT REFERENCES locations(id),
    status VARCHAR(50) DEFAULT 'pending',  -- 'pending' | 'in_transit' | 'done' | 'cancelled'
    notes TEXT,
    created_by INT REFERENCES users(id),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfer_items (
    id SERIAL PRIMARY KEY,
    transfer_id INT REFERENCES transfers(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT
);

-- ============================
-- STOCK ADJUSTMENTS
-- ============================
CREATE TABLE IF NOT EXISTS adjustments (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    location_id INT REFERENCES locations(id),
    system_quantity INT,
    counted_quantity INT,
    difference INT GENERATED ALWAYS AS (counted_quantity - system_quantity) STORED,
    reason TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- DASHBOARD VIEW
-- ============================
CREATE OR REPLACE VIEW stock_summary AS
SELECT
    p.id AS product_id,
    p.name AS product,
    p.sku,
    p.reorder_level,
    c.name AS category,
    l.id AS location_id,
    l.name AS location,
    s.quantity,
    CASE
        WHEN s.quantity = 0 THEN 'out_of_stock'
        WHEN s.quantity <= p.reorder_level THEN 'low_stock'
        ELSE 'in_stock'
    END AS stock_status
FROM stock s
JOIN products p ON p.id = s.product_id
LEFT JOIN categories c ON c.id = p.category_id
JOIN locations l ON l.id = s.location_id;

-- ============================
-- SEED: Default categories for sports goods
-- ============================
INSERT INTO categories (name) VALUES
  ('Cricket'),
  ('Football'),
  ('Badminton'),
  ('Tennis'),
  ('Basketball'),
  ('Volleyball'),
  ('Athletics'),
  ('General Equipment')
ON CONFLICT (name) DO NOTHING;
