
# MediCare – Online Medical Appointment Management System

## Project Overview

MediCare is a web-based medical appointment management
system developed for the EC4307 Web Application
Development Mini Project.

The application allows patients to search for doctors,
book appointments, and manage their bookings.
Doctors can manage their availability and appointments,
while administrators can manage doctor information
and oversee appointments.

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML5 and CSS3

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- JSON Web Tokens (JWT)
- Password hashing with bcrypt

### Version Control
- Git
- GitHub

## User Roles

### Patient
- Register and log in
- Search doctors
- Filter doctors by specialty and hospital
- View available appointments
- Book appointments
- View and manage appointments

### Doctor
- Log in
- Manage availability
- View patient appointments
- Update appointment statuses

### Administrator
- Log in
- Add doctors
- View doctor records
- Update doctor information
- Delete doctor records
- Manage appointments

## CRUD Operations

The system supports CRUD operations for doctor
management.

| Operation | Description |
|-----------|-------------|
| Create | Add a new doctor |
| Read | View and search doctor information |
| Update | Edit existing doctor details |
| Delete | Remove a doctor record |

Doctor information is stored persistently in MongoDB.

## Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB Atlas connection
- Git

### Clone Repository

```bash
git clone https://github.com/thilini-athukorala/Medicare.git
cd Medicare
git checkout development
```

### Backend Setup

```bash
cd medicare-backend
npm install
```

Create a `.env` file with the required configuration
values. Use your own credentials and do not commit
this file.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

Open another terminal:

```bash
cd medicare-frontend
npm install
npm run dev
```

Open the URL displayed by Vite, usually:

http://localhost:5173/

## Database Design

The application uses MongoDB collections for:

- Users
- Doctors
- Appointments

Mongoose models define the data structures and
relationships between these entities.

## Screenshots

Add screenshots of the application here:

- Login and Registration
- Patient Dashboard
- Doctor Search
- Appointment Booking
- Admin Doctor Management
- Doctor Availability

## GitHub Repository

https://github.com/thilini-athukorala/Medicare

## Academic Information

Module: EC4307 – Web Application Development

Project: MediCare – Online Medical Appointment
Management System
```
