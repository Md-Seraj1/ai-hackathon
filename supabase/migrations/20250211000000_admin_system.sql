-- Update 3
-- Update 2
-- Update 1
-- Admin System Migration
-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trigger to limit admin count to 3
CREATE OR REPLACE FUNCTION enforce_admin_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM admin_users) >= 3 THEN
    RAISE EXCEPTION 'Maximum limit of 3 admins reached.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS limit_admin_users ON admin_users;
CREATE TRIGGER limit_admin_users
  BEFORE INSERT ON admin_users
  FOR EACH ROW EXECUTE PROCEDURE enforce_admin_limit();

-- 3. Helper function for RLS
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Schema updates
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 5. Updated RLS Policies

-- Categories
DROP POLICY IF EXISTS "Admin write categories" ON categories;
CREATE POLICY "Admin full access categories" ON categories FOR ALL 
USING (is_admin()) WITH CHECK (is_admin());

-- Products
DROP POLICY IF EXISTS "Admin write products" ON products;
CREATE POLICY "Admin full access products" ON products FOR ALL 
USING (is_admin()) WITH CHECK (is_admin());

-- Variants
DROP POLICY IF EXISTS "Admin write variants" ON product_variants;
CREATE POLICY "Admin full access variants" ON product_variants FOR ALL 
USING (is_admin()) WITH CHECK (is_admin());

-- Orders
DROP POLICY IF EXISTS "Admin manage orders" ON orders;
CREATE POLICY "Admin manage all orders" ON orders FOR ALL 
USING (is_admin()) WITH CHECK (is_admin());

-- Reviews
DROP POLICY IF EXISTS "Admin manage reviews" ON reviews;
CREATE POLICY "Admin manage reviews" ON reviews FOR ALL 
USING (is_admin()) WITH CHECK (is_admin());

-- Profiles
DROP POLICY IF EXISTS "Admin view all profiles" ON profiles;
CREATE POLICY "Admin view all profiles" ON profiles FOR SELECT USING (is_admin());

-- Enable RLS on admin_users just in case
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view admin list" ON admin_users FOR SELECT USING (is_admin());
