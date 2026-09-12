# 🚗 RidePool GEU — Campus Ride-Pooling System

![RidePool Banner](https://img.shields.io/badge/RidePool-GEU-FF4B4B?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/MERN_Stack-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

A modern, production-grade full-stack ride-pooling application built exclusively for students of **Graphic Era University (GEU / GEHU)**. It facilitates secure, affordable, and transparent commuting by connecting students across all Graphic Era campuses in Uttarakhand.

🌐 **Live Demo:** [https://ride-pooling-system.vercel.app](https://ride-pooling-system.vercel.app)  
⚙️ **Production Backend API:** [https://ride-pooling-system.onrender.com](https://ride-pooling-system.onrender.com)  
📦 **GitHub Repository:** [https://github.com/Harshit-Kumar-1710/Ride-Pooling-System](https://github.com/Harshit-Kumar-1710/Ride-Pooling-System)

---

## ✨ Key Features & Policies

### 🎓 1. Exclusive College Access & Option A Policy
- **Verified Access:** Sign-up restricted to verified Graphic Era students with official `@geu.ac.in` college emails, College ID, and personal email validation.
- **Campus Choice:** Supports all **4 Graphic Era Campuses**:
  - *Graphic Era Deemed to be University (Dehradun Main Campus)*
  - *Graphic Era Hill University (Dehradun Campus)*
  - *Graphic Era Hill University (Bhimtal Campus)*
  - *Graphic Era University (Haldwani Campus)*
- **Option A Enforcement:** Every ride posted on the platform **MUST originate from or terminate at a Graphic Era campus**, guaranteeing 100% college-centric community safety.

### 🚗 2. Vehicle Details & Indian RTO License Plate Validation
- **Compulsory Driver Vehicle Details:** Drivers must specify Vehicle Model, License Plate Number, Vehicle Color, Type (Car/Bike/Scooter), and Fuel Type (*Petrol, Diesel, EV / Electric, CNG, Hybrid*).
- **Indian RTO Plate Regex:** Strictly validates registration numbers via RTO Regex (`/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/`, e.g. `UK07AB1234`).
- **Complete Transparency:** Drivers see passenger rosters; passengers see complete driver contact info, vehicle specs, and fuel types.

### 💬 3. WhatsApp-Style Real-Time Chat & Private Messaging
- **Socket.io Real-Time Messaging:** Powered by WebSockets with dynamic room routing.
- **WhatsApp Alignment:** Sender messages appear on the right; incoming messages appear on the left with sender name and role tag (`🚗 Driver` / `👤 Passenger`).
- **Broadcast vs. Private DM Toggle:** Drivers can switch between broadcasting to all passengers or sending targeted private messages to specific passengers.
- **Floating Toast Notifications:** In-app floating notifications trigger when new messages arrive while the chat panel is minimized.

### 🗺️ 4. Uttarakhand Location Precision & Smart NLP Search
- **Uttarakhand Coverage:** 60+ location dictionary covering all districts, key towns, ISBTs, railway stations, airports, and major landmarks.
- **Instant Suggestions:** Overhauled `LocationSearch` with hybrid local dictionary + expanded Nominatim viewbox (`77.0,28.5,81.5,31.8`).
- **Smart Natural Language Search (Smart Fill):** Understands queries like *"GEU to ISBT tomorrow 9am"* and auto-populates pickup, dropoff, and departure time.
- **Campus Map Auto-Centering:** Leaflet maps dynamically auto-center and preset pickup markers based on the student's designated campus.

### 🔄 5. Ride Controls, Cancellation & Credit Economy
- **Flexible Completion & Credit Rewards:** Drivers earn base trip rewards + bonus credits per passenger transported ($10 + 5 \times \text{passengers}$).
- **Full Cancellation System:**
  - **Driver Cancellation:** Cancels ride and automatically emails all confirmed passengers.
  - **Passenger Cancellation:** Frees up the seat instantly and re-opens the ride for other students.
- **5-Star Driver Rating & Reviews:** Ratings prompt upon ride completion to maintain high community trust.
- **Secure Password Reset:** Reset via Resend HTTP API requiring matching College ID and Personal Email combination.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React.js (Vite)
- **Styling:** CSS Variables with Dark & Light Mode Support
- **Routing:** React Router DOM
- **Maps:** Leaflet & React-Leaflet (OSRM Routing & Nominatim Geocoding)
- **Real-Time:** Socket.io-client
- **Icons:** Lucide-React

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ORM)
- **Real-Time Engine:** Socket.io
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Email Delivery:** Resend HTTP API (Welcome & Password Reset Emails)

---

## 🚀 Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Harshit-Kumar-1710/Ride-Pooling-System.git
cd Ride-Pooling-System
```

### 2. Setup Backend Server
```bash
cd server
npm install
```
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
CLIENT_URL=http://localhost:5173
```
Run backend server:
```bash
npm run dev
```

### 3. Setup Frontend Client
```bash
cd ../client
npm install
```
Run frontend dev server:
```bash
npm run dev
```

---

## ☁️ Deployment Architecture

- **Frontend Client:** Deployed on **Vercel** (`https://ride-pooling-system.vercel.app`)
- **Backend API:** Deployed on **Render** (`https://ride-pooling-system.onrender.com`)
- **Database:** **MongoDB Atlas**
- **Git Branches:** `main` and `moving-traffic` kept in sync.

---

## 📝 License
This project is [MIT](LICENSE) licensed. Built with ❤️ for Graphic Era University students.