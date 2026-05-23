# 🚼 DevPulse Backend API

🚀 DevPulse একটি Internal Tech Issue & Feature Tracker Backend System, যেখানে team members সহজে bug report, feature request এবং issue management করতে পারে।

---

## 🌐 Live API

👉 https://devpulse-backend-nu.vercel.app/

---

## ✨ Features

- 🔐 Secure JWT Authentication System
- 👥 Role-based Access Control (Contributor & Maintainer)
- 🐞 Bug & Feature Request Tracking System
- 📌 Full CRUD Operations for Issues
- ⚡ Advanced Filtering & Sorting (status, type, newest/oldest)
- 🧠 Secure Password Hashing using bcrypt
- 📦 Raw SQL based PostgreSQL integration (No ORM)
- 🚫 No SQL JOINs (manual data handling for performance & control)
- 🔒 Protected routes using Authorization middleware

---

## 🛠️ Tech Stack

- Node.js (LTS 24+)
- TypeScript
- Express.js (Modular Architecture)
- PostgreSQL (Native `pg` driver)
- Raw SQL (`pool.query()` only)
- bcrypt (Password Hashing)
- jsonwebtoken (JWT Authentication)

---

## 🚀 Setup Instructions

### 1️⃣ Project Clone করুন
```bash
git clone https://github.com/Ahmed-Nakib/B7A2.git