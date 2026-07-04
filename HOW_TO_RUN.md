# 📖 How to Run ShopFlow — Complete Step-by-Step Guide

---

## ❓ First: Why is there an `init.sql` in EVERY service?

This is the core idea behind **microservices**: **each service owns its own database**.

```
auth-service    ──►  auth_db      (users, refresh_tokens)
user-service    ──►  user_db      (profiles, addresses)
product-service ──►  product_db   (products, categories)
order-service   ──►  order_db     (orders, order_items, cart_items)
```

### Why not one big shared database?

| ❌ One shared DB (monolith)              | ✅ One DB per service (microservice)       |
|------------------------------------------|--------------------------------------------|
| All services break if DB goes down       | Only that one service is affected          |
| Hard to scale one part independently     | Each DB can scale separately               |
| Schema changes affect every service      | Change schema without breaking others      |
| Tightly coupled, hard to maintain        | Loosely coupled, easy to maintain          |

### What does `init.sql` do exactly?

Each `init.sql` file does **three things**:
1. **Creates the database** → `CREATE DATABASE IF NOT EXISTS auth_db;`
2. **Creates the tables** → `CREATE TABLE IF NOT EXISTS users (...)`
3. **Seeds demo data** → `INSERT IGNORE INTO users ...` (sample rows so the app has data on first launch)

> You run it **once** before starting the services.
> After that, the data persists in MySQL and you never need to run it again.

---

## ✅ Prerequisites — Install These First

```bash
node --version    # Need v18+
npm --version
mysql --version
```

Start MySQL if it's not running:
```bash
sudo systemctl start mysql   # Linux
```

---

## 🗂️ Step 1 — Run the init.sql Files (Creates All 4 Databases)

From the **project root**, run these one by one:

```bash
cd /home/sivakumar/Documents/devops_projects/3tier-app

mysql -u root -p < services/auth-service/src/db/init.sql
mysql -u root -p < services/user-service/src/db/init.sql
mysql -u root -p < services/product-service/src/db/init.sql
mysql -u root -p < services/order-service/src/db/init.sql
```

Each command will ask for your MySQL root password. Type it and press Enter.

### Verify it worked:

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

You should see `auth_db`, `user_db`, `product_db`, `order_db` in the list.

---

## ⚙️ Step 2 — Create .env Files for Each Service

Copy the example template into a real `.env` file for each service:

```bash
cd /home/sivakumar/Documents/devops_projects/3tier-app

cp services/auth-service/.env.example    services/auth-service/.env
cp services/user-service/.env.example    services/user-service/.env
cp services/product-service/.env.example services/product-service/.env
cp services/order-service/.env.example   services/order-service/.env
```

Now **open each `.env`** and change these two values:

```env
DB_PASSWORD=your_actual_mysql_password
JWT_SECRET=any_long_random_string_same_in_all_services
```

### ⚠️ CRITICAL: JWT_SECRET must be the SAME in all 4 services

- `auth-service` → **creates** a JWT token using `JWT_SECRET`
- `user-service`, `product-service`, `order-service` → **verify** the token using `JWT_SECRET`
- If they're different → every API call returns **403 Forbidden**

Example (use same value in all 4 `.env` files):
```env
JWT_SECRET=shopflow_my_secret_key_2024
```

---

## 🚀 Step 3 — Start All Services (5 Terminals)

Open 5 terminal tabs and run one command in each:

```bash
# Terminal 1 — Auth Service (Port 3001)
cd services/auth-service && npm run dev

# Terminal 2 — User Service (Port 3002)
cd services/user-service && npm run dev

# Terminal 3 — Product Service (Port 3003)
cd services/product-service && npm run dev

# Terminal 4 — Order Service (Port 3004)
cd services/order-service && npm run dev

# Terminal 5 — React Frontend (Port 3000)
cd frontend && npm run dev
```

Each terminal should print a success message like:
```
🚀 Auth Service running on http://localhost:3001
✅ Auth DB connected: auth_db
```

---

## 🌐 Step 4 — Open the App

```
http://localhost:3000
```

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@shopflow.com     | Admin@123 |

---

## 🗺️ How Frontend Talks to Services

The `frontend/vite.config.js` has proxy rules so the browser doesn't need to know ports:

```
/api/auth/*     → http://localhost:3001  (auth-service)
/api/users/*    → http://localhost:3002  (user-service)
/api/products/* → http://localhost:3003  (product-service)
/api/orders/*   → http://localhost:3004  (order-service)
```

When you add your API Gateway later, you replace this proxy with the gateway URL.

---

## 🛠️ Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Access denied for user root` | Wrong DB password in `.env` | Fix `DB_PASSWORD` |
| `Unknown database 'auth_db'` | init.sql not run yet | Run Step 1 |
| `403 Invalid or expired token` | JWT_SECRET mismatch | Use same secret in all `.env` files |
| `EADDRINUSE: port 3001` | Port already in use | `kill -9 $(lsof -ti:3001)` |
| Frontend blank page | Backend services not running | Start all 4 services first |

---

## 📋 Checklist

- [ ] MySQL is running
- [ ] All 4 `init.sql` files executed
- [ ] All 4 `.env` files created with correct `DB_PASSWORD` and same `JWT_SECRET`
- [ ] auth-service running on `:3001`
- [ ] user-service running on `:3002`
- [ ] product-service running on `:3003`
- [ ] order-service running on `:3004`
- [ ] frontend running on `:3000`
- [ ] Opened `http://localhost:3000` ✅
