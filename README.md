# 🚗 RidePool GEU

![RidePool Banner](https://img.shields.io/badge/RidePool-GEU-FF4B4B?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/MERN_Stack-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

A modern, full-stack college ride-pooling application built exclusively for students. It facilitates secure, affordable, and eco-friendly commuting by connecting students who need rides with those who are driving. 

🌐 **Live Demo:** [https://ride-pooling-system.vercel.app](https://ride-pooling-system.vercel.app)
*(Backend API hosted on Render: [https://ride-pooling-system.onrender.com](https://ride-pooling-system.onrender.com))*

---

## ✨ Key Features

- 🔐 **Exclusive College Access:** Strict sign-up system using OTP verification sent only to official `.edu` or university email addresses.
- 📍 **Real-Time Ride Tracking:** Live, interactive maps powered by **Leaflet.js** and **Socket.io** to track drivers dynamically as they move.
- 🎨 **Premium UI/UX:** A stunning, fully responsive Dark Mode interface built from scratch with glassmorphism effects, smooth animations, and a modern aesthetic.
- 🏆 **Gamification & Badges:** Users earn achievements and dynamic profile badges (e.g., *First Ride, Eco Warrior*) based on their activity to encourage carpooling.
- ⭐ **Review & Rating System:** A comprehensive 5-star rating system with detailed reviews to maintain trust and safety within the college community.
- 💳 **Virtual Credit System:** A built-in digital wallet for seamless, cashless transactions between riders and drivers. 
- 🔍 **Smart Search:** Advanced filtering to easily find available rides matching specific dates, times, and destinations.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React.js (Vite)
- **Styling:** Custom CSS with Glassmorphism
- **Routing:** React Router DOM
- **Maps:** Leaflet & React-Leaflet
- **Icons:** Lucide-React
- **State/API:** Axios

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Real-time:** Socket.io
- **Emails:** Nodemailer (OTP Verification)

---

## 🚀 Installation & Local Setup

If you want to run this project locally on your machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/Harshit-Kumar-1710/Ride-Pooling-System.git
cd Ride-Pooling-System
```

### 2. Setup the Backend
Open a terminal and navigate to the `server` directory:
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add the following:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal and navigate to the `client` directory:
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory and add the following:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

---

## ☁️ Deployment Architecture

- **Frontend:** Hosted on **Vercel** for ultra-fast global edge delivery.
- **Backend:** Hosted on **Render** (Node.js runtime).
- **Database:** Hosted on **MongoDB Atlas** for secure, scalable cloud storage.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Harshit-Kumar-1710/Ride-Pooling-System/issues).

## 📝 License
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.