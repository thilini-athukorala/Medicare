# MediCare Backend (Node.js + Express + MongoDB)

Backend REST API for the MediCare Online Medical Appointment System.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```
   cp .env.example .env
   ```
   - `MONGO_URI`: Get a free connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - `JWT_SECRET`: Any long random string

3. Run in development mode (auto-restarts on file changes):
   ```
   npm run dev
   ```
   Or in production mode:
   ```
   npm start
   ```

4. Server runs at `http://localhost:5000` by default.

## Project Structure

```
medicare-backend/
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js             # Base user (patient/doctor/admin) with hashed password
│   ├── Doctor.js            # Doctor profile, linked 1:1 to a User
│   └── Appointment.js       # Links a patient + doctor + date/time + status
├── middleware/
│   ├── auth.js               # JWT verification (protect) + role check (authorize)
│   └── generateToken.js      # Signs JWT tokens
├── controllers/
│   ├── authController.js     # register, login, getMe
│   ├── doctorController.js   # list/view/update doctors
│   └── appointmentController.js  # book/cancel/update appointments
├── routes/
│   ├── authRoutes.js
│   ├── doctorRoutes.js
│   └── appointmentRoutes.js
└── server.js               # App entry point
```

## API Endpoints

### Auth
| Method | Endpoint            | Access  | Description                         |
|--------|----------------------|---------|--------------------------------------|
| POST   | /api/auth/register    | Public  | Register as PATIENT or DOCTOR       |
| POST   | /api/auth/login        | Public  | Login, returns JWT token            |
| GET    | /api/auth/me            | Private | Get logged-in user's profile        |

### Doctors
| Method | Endpoint            | Access         | Description                          |
|--------|----------------------|----------------|----------------------------------------|
| GET    | /api/doctors           | Public         | List all doctors (filter by ?specialty=) |
| GET    | /api/doctors/:id        | Public         | Get one doctor's full profile        |
| PUT    | /api/doctors/me          | DOCTOR only    | Update own profile / availability    |

### Appointments
| Method | Endpoint                     | Access        | Description                          |
|--------|--------------------------------|---------------|----------------------------------------|
| POST   | /api/appointments              | PATIENT only  | Book a new appointment                |
| GET    | /api/appointments/my            | PATIENT only  | View own appointments                 |
| GET    | /api/appointments/doctor         | DOCTOR only   | View appointments assigned to doctor  |
| PUT    | /api/appointments/:id/status      | DOCTOR only   | Update status (CONFIRMED/COMPLETED/CANCELLED) |
| PUT    | /api/appointments/:id/cancel       | PATIENT only  | Cancel own appointment                |

## Auth Notes

- Passwords are hashed with bcrypt before saving (see `User.js` pre-save hook).
- On register/login, a JWT is returned. Send it on protected routes as:
  ```
  Authorization: Bearer <token>
  ```
- Roles: `PATIENT`, `DOCTOR`, `ADMIN`. Public registration only allows PATIENT or DOCTOR — create ADMIN accounts manually in the database for security.

## Next Steps

This is the backend only. Next, we build the React frontend that calls these APIs.
