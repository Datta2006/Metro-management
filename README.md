# Metro Management System

A full-stack metro ticket booking platform with secure authentication, blockchain payments, and admin management features.

---

Here is the Demo 
https://drive.google.com/file/d/1bEn5YFCHjsuIAI5OhVRcUWoPuu12F1uN/view?usp=sharing

## Features

### User Features
- JWT-based authentication (Register/Login)
- Train search by origin/destination
- Metamask blockchain payment integration
- PDF ticket generation using jsPDF
- Booking history dashboard

### Admin Features
- Admin portal with elevated privileges
-  Train management (Add/Edit/Delete)
- Station management (Full CRUD operations)
- User account and booking management

---

## Tech Stack

### Frontend
- React.js 18
- Axios (API calls)
- Web3.js (Metamask integration)
- jsPDF (PDF ticket generation)

### Backend
- Node.js 18
- Express.js 4
- MySQL 8 (Database)
- JWT (Authentication)
- Bcrypt (Password hashing)

---

## 📁 Project Structure

```
Metro-management/
├── fron/                 # React frontend (run with `npm start`)
├── back/
│   └── server.js         # Node.js + Express backend
├── db/                   # Optional: SQL initialization scripts
├── package.json          # Backend dependencies
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Datta2006/Metro-management.git
cd Metro-management
```

---

### 2. Install Backend Dependencies

```bash
cd back
npm install
```

---

### 3. Start Backend Server

```bash
cd back
node server.js
```

---

### 4. Start Frontend (React)

In a **new terminal window**:

```bash
cd fron
npm install
npm start
```

---

## MySQL Database Setup

### Step 1: Create the Database

```sql
CREATE DATABASE railway_db;
```

---

### Step 2: Create Tables

```sql
USE railway_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin TINYINT(1) DEFAULT 0
);

-- Stations table
CREATE TABLE stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(255) NOT NULL DEFAULT 'Karnataka',
    location VARCHAR(255)
);

-- Trains table
CREATE TABLE trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    number VARCHAR(20) NOT NULL UNIQUE,
    source_station_id INT NOT NULL,
    destination_station_id INT NOT NULL,
    total_seats INT DEFAULT 100,
    available_seats INT DEFAULT 0,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    journey_duration VARCHAR(255) DEFAULT '00:00',
    fare_per_km DECIMAL(10,2) DEFAULT 0.00,
    base_fare DECIMAL(10,2) DEFAULT 500.00,
    distance_km INT DEFAULT 500,
    distance_from_source DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (source_station_id) REFERENCES stations(id),
    FOREIGN KEY (destination_station_id) REFERENCES stations(id)
);

-- Train Stops table
CREATE TABLE train_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    station_id INT NOT NULL,
    arrival_time TIME NOT NULL,
    departure_time TIME NOT NULL,
    sequence_number INT NOT NULL,
    distance_from_source INT NOT NULL,
    FOREIGN KEY (train_id) REFERENCES trains(id),
    FOREIGN KEY (station_id) REFERENCES stations(id)
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    user_id INT NOT NULL,
    pnr_number VARCHAR(15) NOT NULL UNIQUE,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_age INT NOT NULL,
    passenger_gender ENUM('Male', 'Female', 'Other') NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    coach_number VARCHAR(10) NOT NULL,
    class_type ENUM('SL', '3A', '2A', '1A', 'CC', 'EC') NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    booking_status ENUM('Confirmed', 'Waiting', 'Cancelled') DEFAULT 'Confirmed',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (train_id) REFERENCES trains(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(20),
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Wallet') NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    payment_status ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(pnr_number)
);

-- Cancellations table
CREATE TABLE cancellations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2) NOT NULL,
    cancellation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Feedback table
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    train_id INT,
    rating INT NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (train_id) REFERENCES trains(id),
    INDEX (created_at)
);
```

---

## Configure MySQL Credentials

Update your `server.js` file in the backend with your MySQL credentials:

```js
const connection = mysql.createConnection({
    host: "localhost",
    user: "your_username_here",
    password: "your_password_here",
    database: "railway_db"
});
```

Replace `your_username_here` and `your_password_here` with your actual MySQL credentials.

---

## Author

**Datta**  
GitHub: [@Datta2006](https://github.com/Datta2006)
