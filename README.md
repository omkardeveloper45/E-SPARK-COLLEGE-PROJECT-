# E-SPARK – EV Charging & Billing System
> **Semester 5 Software Engineering Major Capstone Project**

E-SPARK is a complete, production-grade full-stack Electric Vehicle (EV) Charging Station Management, Slot Booking, Telemetry Monitoring, and Automated Billing Platform.

---

## 🎨 Visual Identity & UI Inspiration
The platform UI is designed following modern EV charging networks (inspired by Tata Power EZ Charge, ChargeZone, Statiq, and Bolt.Earth):
- High-contrast crisp white layout with forest green highlights (`#059669`, `#10B981`)
- Rounded card surfaces, soft shadows, and pill-shaped action buttons
- Real-time battery SoC progress ring and live telemetry monitors
- Interactive charging cost estimation calculator
- Responsive layout across Desktop, Tablet, and Mobile screens

---

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic web page structure across all 14 views
- **CSS3**: Custom design system, CSS variables, utility classes, animations
- **Vanilla JavaScript**: ES6+ modules, Fetch API client with automatic JWT header handling

### Backend
- **Node.js & Express.js**: Modular RESTful APIs using MVC architecture
- **JWT (JSON Web Token)**: State-free authentication for drivers and administrators
- **bcryptjs**: 10-round salt password encryption
- **Multer**: Profile image avatar file uploads

### Database & Storage
- **MongoDB & Mongoose**: Schema collections for Users, Admins, Stations, Bookings, Vehicles, ChargingSessions, Payments, Invoices, Notifications, and SupportTickets.
- **Dual Engine Architecture**: Automatically connects to native MongoDB (`MONGODB_URI`) when available, or seamlessly falls back to a high-performance in-memory database store for instant zero-config container preview!

---

## 📁 Project Directory Structure

```text
E-SPARK/
├── client/                      # Frontend HTML, CSS, & Vanilla JS
│   ├── index.html               # Home Page & Interactive Hero
│   ├── login.html               # User Auth Login
│   ├── register.html            # Driver & Vehicle Registration
│   ├── dashboard.html           # User Overview Dashboard
│   ├── profile.html             # Profile Settings & Avatar Upload
│   ├── booking.html             # Station Finder & Slot Reservation
│   ├── charging.html            # Live Battery & Telemetry Monitor
│   ├── billing.html             # Multi-channel Payment Checkout
│   ├── invoice.html             # Tax Invoice & PDF Print View
│   ├── support.html             # 24/7 Help Desk & FAQ Accordion
│   ├── contact.html             # Corporate Contact & Partnering
│   ├── about.html               # Project Objective & Tech Spec
│   ├── admin.html               # Admin Portal & Operations Control
│   ├── 404.html                 # Error Page
│   ├── css/
│   │   └── style.css            # Master Design System
│   └── js/
│       ├── api.js               # API Fetch & Auth Interceptor
│       ├── main.js              # Navbar & Global Toast Manager
│       ├── home.js              # Calculator & Station Previews
│       ├── auth.js              # Client Form Validation & Auth
│       ├── dashboard.js         # User Dashboard Analytics
│       ├── booking.js            # Station Filter & Booking Modal
│       ├── charging.js           # Real-Time Telemetry Loop
│       ├── billing.js            # Payment Processing & Gateway
│       ├── invoice.js           # Invoice Render & Printing
│       ├── profile.js           # Profile & Avatar Uploads
│       ├── admin.js             # Admin Stats, CRUD & Charts
│       └── support.js           # Ticket Submission
├── server/                      # Node.js Express Backend
│   ├── config/
│   │   └── db.js                # Database Connection Engine
│   ├── controllers/             # Business Logic & Controllers
│   ├── middleware/              # JWT Security & File Uploads
│   ├── models/                  # Mongoose & In-Memory Collections
│   ├── routes/                  # Express REST Endpoint Routes
│   ├── utils/                   # JWT & Seed Data Utilities
│   └── uploads/                 # Static Uploaded Files Storage
├── server.js                    # Server Entry Point
├── package.json                 # Node Dependencies & Scripts
├── README.md                    # Project Documentation
└── .env.example                 # Environment Configuration
```

---

## 🔐 Credentials & Quick Access

### Admin Credentials
- **URL**: `/admin`
- **Email**: `admin@espark.com`
- **Password**: `admin123`

### Demo Driver Credentials
- **URL**: `/login`
- **Email**: `rahul@espark.com`
- **Password**: `user123`

---

## 🚀 Installation & Running Instructions

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Steps
1. Clone or extract the repository files into your working directory.
2. Install project dependencies:
   ```bash
   npm install
   ```
3. (Optional) Configure environment variables in `.env`:
   ```env
   PORT=3000
   JWT_SECRET=espark_super_secret_jwt_key_2026
   MONGODB_URI=mongodb://localhost:27017/espark_db
   ```
4. Start the E-SPARK server:
   ```bash
   npm start
   ```
5. Open your web browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## ⚡ Major Project Features
1. **Interactive Station Discovery**: Filter stations by charger plug type (CCS2, Type 2, CHAdeMO) and real-time charger status.
2. **Live Telemetry & Battery Monitor**: Animated SVG battery SoC progress ring, speed kW readout, duration counter, and running cost updates.
3. **Multi-Channel Payment Gateway**: UPI (GPay/PhonePe), Credit/Debit Card, Net Banking, E-SPARK Wallet, and Kiosk Cash simulation.
4. **GST Tax Invoice Generator**: Automatic calculation of 18% GST with print & PDF download capability.
5. **Administrator Operations Control**: Complete CRUD over charging hubs, charger power outputs, driver accounts, and revenue analytics charts.
