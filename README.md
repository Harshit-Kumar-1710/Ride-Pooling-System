# RidePool — Ride Matching & Pooling System

A backend-driven ride pooling system designed for efficient route-based matching, dynamic seat allocation, and secure booking management.

---

## 🚀 Overview

RidePool enables users to create and join shared rides based on route proximity and time preferences. The system focuses on backend logic for matching, authentication, and scalable data handling.

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **Authentication:** JWT, bcrypt  
- **Frontend:** React (basic UI)  

---

## ⚙️ Core Features

- 🔐 Secure user authentication using JWT and bcrypt  
- 🚗 Create, search, and book rides  
- 📍 Route-based ride matching using Haversine distance  
- 🧠 Matching algorithm with scoring based on:
  - Distance  
  - Time  
  - Driver rating  
- 💳 Credit-based booking system  
- 🗂 Structured MongoDB schemas for efficient data handling  

---

## 🧠 System Design Highlights

- Designed RESTful APIs for ride creation, booking, and user management  
- Implemented modular backend architecture (routes, controllers, models)  
- Optimized database queries for faster ride matching  
- Handled edge cases like invalid bookings and overlapping routes  

---

## 🔌 API Endpoints (Sample)

| Method | Endpoint | Description |
|--------|---------|------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| POST | /rides/create | Create a ride |
| GET | /rides/search | Search available rides |
| POST | /rides/book | Book a ride |

---

## ▶️ Run Locally

### Backend
```bash
cd server
npm install
npm start
