CREATE DATABASE IF NOT EXISTS product_db;
USE product_db;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Seed categories
INSERT IGNORE INTO categories (id, name, description) VALUES
(1, 'Electronics', 'Phones, laptops, accessories'),
(2, 'Clothing', 'Men and women fashion'),
(3, 'Books', 'Fiction, non-fiction, educational'),
(4, 'Home & Kitchen', 'Furniture and appliances');

-- Seed products
INSERT IGNORE INTO products (id, category_id, name, description, price, stock_quantity, sku, image_url) VALUES
(1, 1, 'MacBook Pro 16"', 'Apple M3 Pro chip, 18GB RAM, 512GB SSD', 2499.99, 25, 'MBP-16-M3', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'),
(2, 1, 'iPhone 15 Pro', '6.1-inch display, titanium design, 256GB', 999.99, 50, 'IP15-PRO-256', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'),
(3, 1, 'Sony WH-1000XM5', 'Wireless Noise Cancelling Headphones', 349.99, 80, 'SONY-XM5', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
(4, 2, 'Nike Air Max 270', 'Running shoes with Max Air cushioning', 129.99, 120, 'NIKE-AM270-42', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
(5, 3, 'Clean Code', 'A Handbook of Agile Software Craftsmanship by Robert C. Martin', 39.99, 200, 'BK-CLEAN-CODE', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
(6, 4, 'Dyson V15 Detect', 'Cordless vacuum cleaner with laser dust detection', 749.99, 30, 'DYSON-V15', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
(7, 1, 'Samsung 4K Monitor 27"', 'UHD 4K display, 144Hz refresh rate', 449.99, 40, 'SAM-MON-27-4K', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
(8, 2, 'Levi 501 Original Jeans', 'Classic straight fit, 100% cotton denim', 79.99, 150, 'LEV-501-32', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400');
