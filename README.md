# Digital Library System

A web-based digital library system built using **Node.js**, **Express**, **MySQL**, and **EJS**, designed for students and administrators to share, access, and manage educational resources.

---

## Features

- User registration and login (session-based)
- Admin and student roles
- Upload and download PDF or document resources
- Browse all uploaded files
- Search for resources by title or description
- Community notes section (knowledge sharing)
- Admin-only resource deletion

---

## Technologies Used

- Node.js
- Express.js
- MySQL & MySQL Workbench
- EJS (Embedded JavaScript Templates)
- HTML, CSS
- Multer (for file uploads)
- Express-session (user sessions)
- Body-parser (form handling)

---

## How to Run This Project 

### 1. Clone the repository

git clone https://github.com/MonicaMukanda/digital-lib.git
cd digital-lib

### 2. Install dependencies
npm install

### 3. Start your MySQL server
Create a MySQL database named digital_library and run the SQL script to create tables (users, resources, notes, etc.).

Update db.js with your MySQL login credentials.

### 4. Start the application
node app.js
Visit:
http://localhost:3000

AUTHOR
Created by Mukanda Monica
