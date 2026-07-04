# ShopFlow — React + Node.js + MySQL Microservices

A full-stack e-commerce platform built with microservice architecture.

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────────────────────────────┐
│  React Frontend │ ───► │             (Your API Gateway)           │
│   Port: 3000    │      └──────┬──────────┬──────────┬────────────┘
└─────────────────┘             │          │          │
                         ┌──────┴─┐  ┌────┴──┐  ┌───┴───┐  ┌─────────┐
                         │  Auth  │  │ User  │  │Product│  │  Order  │
                         │  3001  │  │ 3002  │  │  3003 │  │  3004   │
                         └──┬─────┘  └───┬───┘  └───┬───┘  └────┬────┘
                            │            │           │           │
                         auth_db      user_db   product_db   order_db
```

## 📁 Project Structure

```
3tier-app/
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── pages/            # Dashboard, Products, Orders, Profile, Users
│       ├── components/       # Sidebar
│       ├── context/          # AuthContext
│       └── services/         # api.js (all service calls)
└── services/
    ├── auth-service/         # Port 3001 — JWT auth
    ├── user-service/         # Port 3002 — Profiles & addresses
    ├── product-service/      # Port 3003 — Products & categories
    └── order-service/        # Port 3004 — Cart & orders
```

## 🚀 Quick Start

### 1. Setup MySQL Databases

Run each init script in MySQL:
```bash
mysql -u root -p < services/auth-service/src/db/init.sql
mysql -u root -p < services/user-service/src/db/init.sql
mysql -u root -p < services/product-service/src/db/init.sql
mysql -u root -p < services/order-service/src/db/init.sql
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in each service and update:
```bash
cd services/auth-service && cp .env.example .env
cd services/user-service && cp .env.example .env
cd services/product-service && cp .env.example .env
cd services/order-service && cp .env.example .env
```

> ⚠️ **Important**: Use the **same** `JWT_SECRET` in all services!

### 3. Start Each Service

```bash
# Terminal 1 — Auth Service
cd services/auth-service && npm run dev

# Terminal 2 — User Service
cd services/user-service && npm run dev

# Terminal 3 — Product Service
cd services/product-service && npm run dev

# Terminal 4 — Order Service
cd services/order-service && npm run dev

# Terminal 5 — Frontend
cd frontend && npm run dev
```

### 4. Open the App

```
http://localhost:3000
```

**Demo Login:** `admin@shopflow.com` / `Admin@123`

---

## 🔌 API Reference

### Auth Service (3001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Get current user |

### User Service (3002)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (admin) |
| GET | `/api/users/:id` | Get profile |
| PUT | `/api/users/:id` | Update profile |
| GET | `/api/users/:id/addresses` | Get addresses |
| POST | `/api/users/:id/addresses` | Add address |
| DELETE | `/api/users/:id/addresses/:addrId` | Delete address |

### Product Service (3003)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search, filter) |
| GET | `/api/products/:id` | Get product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Soft delete (admin) |
| GET | `/api/products/categories` | List categories |
| PATCH | `/api/products/:id/stock` | Update stock (admin) |

### Order Service (3004)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/cart` | Get cart |
| POST | `/api/orders/cart` | Add to cart |
| PUT | `/api/orders/cart/:productId` | Update cart item |
| DELETE | `/api/orders/cart/:productId` | Remove from cart |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Get order detail |
| PATCH | `/api/orders/:id/status` | Update status (admin) |
| GET | `/api/orders/stats` | Dashboard stats (admin) |

---

## 🐳 Docker & Gateway

You handle this part — all services are ready with:
- Health check endpoint: `GET /health`
- CORS configured via `ALLOWED_ORIGINS` env
- `.env.example` for every service
