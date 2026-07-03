# Gym Management Backend

## Overview
This is the **Node.js/Express** backend for the Gym/Fitness Center Management System. It provides RESTful APIs for:
- User authentication (JWT)
- Role‑based access (admin, trainer, member)
- Membership plans, classes, workouts, diet plans
- Attendance tracking (QR & manual)
- Payments via Stripe
- Email & SMS notifications (Nodemailer, Twilio)

## Prerequisites
- **Node.js** v22 (or later) 
- **MongoDB** instance (local or Atlas) – connection string set in `.env`
- **Stripe**, **Nodemailer**, **Twilio** test credentials – also set in `.env`

## Setup
1. Clone the repo and navigate to the backend folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see `.env.example` for required variables). Example:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/gym-app
   JWT_SECRET=your_jwt_secret
   # … other keys (Stripe, SMTP, Twilio) …
   ```
4. Start the server:
   ```bash
   npm run dev   # development with nodemon
   # or
   npm start     # production
   ```
   The API will be available at `http://localhost:5000/api/…`.

## Database Seeding
A seed script populates mock data for quick testing:
```bash
node utils/seed.js
```
It creates:
- Admin user
- Sample trainers & members
- Membership plans, classes, workout & diet plans
- Attendance logs and notifications

## Scripts
| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the server with nodemon (auto‑restart on changes) |
| `npm start`   | Starts the server in production mode |
| `npm run seed`| Runs `node utils/seed.js` (alias) |

## API Documentation
The routes are defined in the `routes/` folder. Use a tool like **Postman** or **Insomnia** to explore:
- `POST /api/auth/signup` & `POST /api/auth/login`
- `GET /api/members`, `GET /api/trainers`, etc.
- Protected routes require the `Authorization: Bearer <token>` header.

## License
MIT © 2026 Your Name
