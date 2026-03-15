-- Update 1
-- AI Try-On System Migration
-- 1. Add is_ai_enabled column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_ai_enabled BOOLEAN DEFAULT FALSE;

-- 2. Update RLS policies to allow admin update on this column (already covered by "Admin full access products" policy)
-- But ensuring public can read it
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
