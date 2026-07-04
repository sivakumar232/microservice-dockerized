CREATE DATABASE IF NOT EXISTS order_db;
USE order_db;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method ENUM('card', 'upi', 'cod', 'netbanking') DEFAULT 'cod',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_image VARCHAR(500),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_image VARCHAR(500),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- Seed some orders
INSERT IGNORE INTO orders (id, user_id, status, total_amount, shipping_address, payment_method, payment_status) VALUES
(1, 1, 'delivered', 2499.99, '{"street":"123 MG Road","city":"Bangalore","state":"Karnataka","zip":"560001","country":"India"}', 'card', 'paid'),
(2, 1, 'shipped', 349.99, '{"street":"123 MG Road","city":"Bangalore","state":"Karnataka","zip":"560001","country":"India"}', 'upi', 'paid'),
(3, 1, 'processing', 129.99, '{"street":"456 Anna Salai","city":"Chennai","state":"Tamil Nadu","zip":"600002","country":"India"}', 'cod', 'pending');

INSERT IGNORE INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price) VALUES
(1, 1, 'MacBook Pro 16"', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 1, 2499.99, 2499.99),
(2, 3, 'Sony WH-1000XM5', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 1, 349.99, 349.99),
(3, 4, 'Nike Air Max 270', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 1, 129.99, 129.99);
