# PSG Inventory Management System
## Patel Sports & Goods — Ahmedabad, Gujarat

A full-stack Inventory Management System built with:
- **Frontend:** React 18 + React Router v6
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (on 192.168.1.20)

---

## Project Structure

```
PSG/
├── backend/
│   ├── config/
│   │   ├── db.js           # PostgreSQL connection pool
│   │   └── init.sql        # DB schema + seed data
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── receiptController.js
│   │   ├── deliveryController.js
│   │   └── inventoryController.js
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   ├── routes/
│   │   └── index.js        # All API routes
│   ├── .env                # Environment config
│   ├── package.json
│   └── server.js           # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.js
    │   │   │   └── Sidebar.js
    │   │   └── ui/
    │   │       ├── Modal.js
    │   │       └── StatusBadge.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── ForgotPassword.js
    │   │   ├── Dashboard.js
    │   │   ├── Products.js
    │   │   ├── Receipts.js
    │   │   ├── Deliveries.js
    │   │   ├── Transfers.js
    │   │   ├── Adjustments.js
    │   │   ├── MoveHistory.js
    │   │   └── Settings.js
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.css
    │   └── index.js
    ├── .env
    └── package.json
```

---

## Setup Instructions

### Step 1 — Database Setup (on PC at 192.168.1.20)

1. Open pgAdmin or psql on your PostgreSQL PC
2. Create the database:
   ```sql
   CREATE DATABASE "PSG";
   ```
3. Connect to the PSG database and run the full SQL from:
   `backend/config/init.sql`

4. Make sure PostgreSQL allows remote connections:
   - Edit `postgresql.conf`: `listen_addresses = '*'`
   - Edit `pg_hba.conf`, add: `host all all 0.0.0.0/0 md5`
   - Restart PostgreSQL service

### Step 2 — Backend Setup

```bash
cd PSG/backend
npm install
# Edit .env if needed (DB settings are already configured)
npm start
# or for development:
npm run dev
```

Backend runs on: **http://localhost:5000**

### Step 3 — Frontend Setup

```bash
cd PSG/frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

---

## Default Login

After running `init.sql`:
- **Email:** admin@psg.com
- **Password:** password

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/dashboard | Dashboard KPIs |
| GET/POST | /api/products | Products CRUD |
| GET/POST | /api/receipts | Receipts |
| PATCH | /api/receipts/:id/status | Update receipt status |
| GET/POST | /api/deliveries | Deliveries |
| PATCH | /api/deliveries/:id/status | Update delivery status |
| GET/POST | /api/transfers | Internal transfers |
| PATCH | /api/transfers/:id/validate | Validate transfer |
| GET/POST | /api/adjustments | Stock adjustments |
| GET | /api/move-history | Full stock ledger |
| GET/POST | /api/warehouses | Warehouses |
| GET/POST | /api/locations | Locations |

---

## Inventory Flow

```
Vendor → Receipt (validate) → Stock +
Stock  → Delivery (validate) → Stock −
Stock  → Transfer → Location A− / Location B+
Stock  → Adjustment → Corrected quantity
All movements → Move History (ledger)
```

---

## Notes

- JWT tokens expire in 7 days
- OTP password reset logs the OTP to server console in development mode
- Stock goes negative if you validate a delivery with insufficient stock — implement reorder rules via the `reorder_level` field on products
