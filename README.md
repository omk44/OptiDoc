# OptiDoc - Doctor Appointment Booking System

OptiDoc is a full-stack MERN application designed to streamline the process of booking and managing doctor appointments. It provides a user-friendly interface for patients to find doctors and book appointments, and a comprehensive dashboard for doctors and administrators to manage schedules and patient information.

## Features

*   **User Authentication:** Secure login and registration for patients, doctors, and admins.
*   **Doctor Profiles:** Detailed profiles for doctors, including specialization, experience, and qualifications.
*   **Appointment Booking:** Easy-to-use booking system for patients to schedule appointments.
*   **Dashboards:** Role-based dashboards for Patients, Doctors, and Admins.
*   **Notification System:** In-app and email notifications for appointment confirmations and status updates.
*   **Admin Panel:** Full control over doctor and patient management for administrators.

## Tech Stack

*   **Frontend:** React.js, Vite, Tailwind CSS
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB
*   **Authentication:** JSON Web Tokens (JWT)
*   **File Uploads:** Multer
*   **Email Notifications:** Nodemailer

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Prerequisites

*   Node.js (v14 or later)
*   npm (Node Package Manager)
*   MongoDB (Make sure the MongoDB server is running on your machine)

### 2. Installation

**Clone the repository:**
```bash
git clone https://github.com/omk44/OptiDoc.git
cd OptiDoc
```

**Install Backend Dependencies:**
```bash
cd optidoc-backend
npm install
```

**Install Frontend Dependencies:**
```bash
cd ../Frontend
npm install
```

### 3. Environment Configuration (`.env` files)

You need to create `.env` files for both the backend and the frontend.

**Backend `.env`:**
1.  Navigate to the `optidoc-backend` directory.
2.  Create a file named `.env`.
3.  Copy the contents from `.env.example` and fill in your details:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    EMAIL_USER=your_gmail_address@gmail.com
    EMAIL_PASS=your_gmail_app_password
    ```
    *   **`MONGO_URI`**: Your MongoDB connection string (e.g., `mongodb://localhost:27017/OptiDoc`).
    *   **`EMAIL_PASS`**: For Gmail, you need to generate an "App Password". You can't use your regular login password.

**Frontend `.env`:**
1.  Navigate to the `Frontend` directory.
2.  Create a file named `.env`.
3.  Copy the contents from `.env.example`:
    ```
    VITE_API_URL=http://localhost:5000/api
    ```

### 4. Database Setup

You can set up the database by restoring the provided backup.

1.  Make sure your MongoDB server is running.
2.  From the root directory of the project (`/OptiDoc`), run the following command in your terminal:

    ```bash
    mongorestore --db OptiDoc --dir ./database-backup/OptiDoc
    ```
    This command will restore the database collections from the `database-backup` folder into a new database named `OptiDoc`.

### 5. Running the Application

**Run the Backend Server:**
Open a terminal, navigate to the backend directory, and run:
```bash
cd optidoc-backend
npm run dev
```
The backend server should now be running on `http://localhost:5000`.

**Run the Frontend Development Server:**
Open a **new** terminal, navigate to the frontend directory, and run:
```bash
cd Frontend
npm run dev
```
The frontend development server will start, and you can access the application in your browser at the URL provided (usually `http://localhost:5173`).
