-- Update 2
-- Update 1
-- ==========================================
-- SEED DATA FOR TRYONME MOBILE APP
-- ==========================================

-- 1. DELETE EXISTING DATA (OPTIONAL - REMOVE IF YOU WANT TO KEEP YOUR DATA)
-- DELETE FROM tryon_sessions;
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM cart_items;
-- DELETE FROM product_variants;
-- DELETE FROM products;
-- DELETE FROM categories;

-- 2. INSERT CATEGORIES
INSERT INTO categories (name, slug, image_url)
VALUES 
  ('Clothes', 'clothes', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800'),
  ('Jewellery', 'jewellery', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'),
  ('Watches', 'watches', 'https://images.unsplash.com/photo-1524592094765-f7a5f02eb9f9?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;

-- 3. INSERT PRODUCTS & VARIANTS

-- PRODUCT 1: Denim Jacket
WITH cat AS (SELECT id FROM categories WHERE slug = 'clothes' LIMIT 1),
     p AS (INSERT INTO products (name, brand, description, category_id, base_price, images, rating, review_count)
           VALUES ('Classic Denim Jacket', 'Urban Thread', 'A timeless classic denim jacket that goes with everything.', (SELECT id FROM cat), 89.99, ARRAY['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=800'], 4.8, 120)
           RETURNING id)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, unnest(ARRAY['S', 'M', 'L', 'XL']), 'Blue', 'CL-DJ-BL-' || id, 50 FROM p;

-- PRODUCT 2: Summer Dress
WITH cat AS (SELECT id FROM categories WHERE slug = 'clothes' LIMIT 1),
     p AS (INSERT INTO products (name, brand, description, category_id, base_price, images, rating, review_count)
           VALUES ('Floral Summer Dress', 'Bloom', 'Light and airy floral dress perfect for summer days.', (SELECT id FROM cat), 59.99, ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800'], 4.5, 200)
           RETURNING id)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, unnest(ARRAY['XS', 'S', 'M', 'L']), 'Floral', 'CL-FD-FL-' || id, 30 FROM p;

-- PRODUCT 3: Oversized Hoodie
WITH cat AS (SELECT id FROM categories WHERE slug = 'clothes' LIMIT 1),
     p AS (INSERT INTO products (name, brand, description, category_id, base_price, images, rating, review_count)
           VALUES ('Oversized Cotton Hoodie', 'Essential', 'Premium cotton hoodie with a relaxed fit.', (SELECT id FROM cat), 75.00, ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'], 4.7, 85)
           RETURNING id)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, unnest(ARRAY['M', 'L', 'XL']), 'Slate Gray', 'CL-HO-GY-' || id, 100 FROM p;

-- PRODUCT 4: Gold Necklace
WITH cat AS (SELECT id FROM categories WHERE slug = 'jewellery' LIMIT 1),
     p AS (INSERT INTO products (name, brand, description, category_id, base_price, images, rating, review_count)
           VALUES ('Gold Plated Necklace', 'Luxe', 'Elegant gold plated necklace for special occasions.', (SELECT id FROM cat), 149.00, ARRAY['https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=800'], 4.9, 54)
           RETURNING id)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, 'One Size', 'Gold', 'JW-GN-01-' || id, 15 FROM p;

-- PRODUCT 5: Silver Ring Set
WITH cat AS (SELECT id FROM categories WHERE slug = 'jewellery' LIMIT 1),
     p AS (INSERT INTO products (name, brand, description, category_id, base_price, images, rating, review_count)
           VALUES ('Silver Ring Set', 'Argent', 'Set of 3 minimalist silver rings.', (SELECT id FROM cat), 45.00, ARRAY['https://images.unsplash.com/photo-1627932634424-699313ac3530?auto=format&fit=crop&q=80&w=800'], 4.6, 32)
           RETURNING id)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, unnest(ARRAY['6', '7', '8']), 'Silver', 'JW-RS-SV-' || id, 40 FROM p;

-- PRODUCT 6: Chronograph Watch
WITH cat AS (SELECT id FROM categories WHERE slug = 'watches' LIMIT 1),
     p AS (INSERT INTO products (name, brand, description, category_id, base_price, images, rating, review_count)
           VALUES ('Chronograph Watch', 'Timeless', 'Precision chronograph with leather strap.', (SELECT id FROM cat), 299.00, ARRAY['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=800'], 4.7, 89)
           RETURNING id)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, 'One Size', 'Dark Brown', 'WT-CW-BR-' || id, 10 FROM p;

-- PRODUCT 7: Minimalist Analog Watch
WITH cat AS (SELECT id FROM categories WHERE slug = 'watches' LIMIT 1),
     p AS (INSERT INTO products (name, brand, description, category_id, base_price, images, rating, review_count)
           VALUES ('Minimalist Analog Watch', 'Pure', 'Clean design with a stainless steel mesh band.', (SELECT id FROM cat), 125.00, ARRAY['https://images.unsplash.com/photo-1524592094765-f7a5f02eb9f9?auto=format&fit=crop&q=80&w=800'], 4.4, 45)
           RETURNING id)
INSERT INTO product_variants (product_id, size, color, sku, stock_quantity)
SELECT id, 'One Size', 'Silver', 'WT-MA-SV-' || id, 25 FROM p;
