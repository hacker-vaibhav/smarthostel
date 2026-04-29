-- Run database creation separately before importing this schema.
-- Example: CREATE DATABASE smart_hostel;

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student', -- student, admin, staff, warden
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Table
CREATE TABLE otps (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expiry TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(50) UNIQUE NOT NULL,
  capacity INT NOT NULL,
  occupied_count INT DEFAULT 0,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in_date TIMESTAMP,
  check_out_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Complaints Table
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  text TEXT NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(100),
  priority VARCHAR(50), -- low, medium, high, critical
  summary TEXT,
  suggested_staff VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, escalated
  assigned_to INT,
  votes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Votes Table
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  complaint_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, complaint_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);

-- Payments Table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, overdue
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Staff Table
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100), -- maintenance, cleaning, security, plumbing
  current_tasks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Student Preferences Table (for roommate matching)
CREATE TABLE student_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  course VARCHAR(255),
  year INT,
  sleep_schedule VARCHAR(50), -- early_bird, night_owl
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_votes_complaint_id ON votes(complaint_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);
