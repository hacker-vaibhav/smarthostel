# 🧠 Smart Hostel Management System

A complete AI-powered full-stack hostel management platform that automates room allocation, complaint tracking, payment management, and staff assignment.

## ✨ Features

### 🎓 Student Features
- ✅ OTP-verified registration & login
- ✅ Browse and book rooms
- ✅ Smart roommate matching based on preferences
- ✅ Submit complaints with images
- ✅ Upvote complaints (voting system)
- ✅ Track payment status
- ✅ Real-time complaint updates
- ✅ Telegram bot integration

### 🖥️ Admin Features
- ✅ Real-time dashboard with statistics
- ✅ View all complaints with AI analysis
- ✅ Auto-assign complaints to staff
- ✅ Update complaint status
- ✅ Send payment reminders
- ✅ Auto-escalation system
- ✅ Staff workload management

### 🤖 AI & Automation
- ✅ Automatic complaint categorization
- ✅ Priority detection (critical, high, medium, low)
- ✅ Smart staff assignment based on availability
- ✅ Roommate compatibility matching
- ✅ Auto-escalation after 2 minutes (demo mode)
- ✅ Email notifications

### 📱 Integration
- ✅ Gmail SMTP for OTP & reminders
- ✅ Telegram bot for complaint submission
- ✅ WebSocket for real-time updates
- ✅ RESTful API

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 with React Router v6
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide Icons

**Backend:**
- Node.js with Express.js
- PostgreSQL database
- Socket.io for real-time updates
- JWT authentication

**Realtime:**
- Socket.io channels

**Telegram:**
- Node Telegram Bot API

---

## 📋 Prerequisites

Before installation, ensure you have:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager
- Gmail account (for OTP sending)
- Telegram Bot Token (from BotFather)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone & Setup Project Structure

```bash
cd smart-hostel-system
```

### 2️⃣ Setup PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE smart_hostel;

# Connect to database
\c smart_hostel

# Import schema
\i backend/config/database-init.sql
```

Alternatively, run the SQL queries from `backend/config/database-init.sql` manually.

### 3️⃣ Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# - Database credentials
# - Gmail SMTP (use App Password)
# - JWT secret
# - Frontend URL

# Install dependencies
npm install

# Add upload directory
mkdir uploads/complaints

# Start backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### 4️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on: `http://localhost:3000`

### 5️⃣ Telegram Bot Setup (Optional)

```bash
cd telegram-bot

# Copy environment file
cp .env.example .env

# Edit .env with:
# - Your Telegram Bot Token (from @BotFather)
# - Backend URL
# - JWT token

# Install dependencies
npm install

# Start bot
npm run dev
```

---

## 📧 Email Configuration

### Gmail App Password Setup

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Search "App Passwords" and generate password
4. Copy the 16-character password
5. Add to `.env`:
   ```
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

---

## 🤖 Telegram Bot Setup

### Create Bot with BotFather

1. Chat with @BotFather on Telegram
2. Send `/newbot`
3. Follow prompts to create bot
4. Copy the bot token
5. Add to telegram-bot `.env`:
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh
   ```

---

## 🚀 Demo Flow

### User Registration & Login Flow

1. **Register**: Email → OTP sent → Verify OTP → Create account
2. **Login**: Email + Password → JWT token issued

### Complaint Submission Flow

1. **Via Website**:
   - User writes complaint text
   - Uploads image
   - AI analyzes: category, priority, summary
   - Auto-assigned to least busy staff
   - Real-time update sent to admin

2. **Via Telegram Bot** (@SmartHostelBot):
   - Send `/complaint`
   - Type complaint description
   - Send image
   - Bot submits to backend
   - Same AI analysis & assignment

### Complaint Escalation

- If complaint **pending > 2 minutes** → Auto-escalate to warden
- Status change triggers email to user

### Payment Reminders

- Admin sends payment reminder
- User receives email: "₹X due in Y days"

### Real-time Updates

- Dashboard updates instantly via WebSocket
- Complaint status changes appear live
- Vote count updates in real-time

---

## 📊 Database Schema

### Key Tables

```
users (id, name, email, phone, password, role)
otps (id, email, otp, expiry, verified)
rooms (id, room_number, capacity, occupied_count, price)
bookings (id, user_id, room_id, status)
complaints (id, user_id, text, image_url, category, priority, status, votes_count)
votes (id, user_id, complaint_id)
payments (id, user_id, amount, status, due_date)
staff (id, user_id, role, current_tasks)
student_preferences (id, user_id, course, year, sleep_schedule)
```

---

## 🔑 API Endpoints

### Auth
```
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/register
POST /api/auth/login
```

### Rooms
```
GET /api/rooms
GET /api/rooms/:id
POST /api/rooms/:id/book
GET /api/rooms/user/:userId
```

### Complaints
```
POST /api/complaints
GET /api/complaints
GET /api/complaints/user/:userId
PATCH /api/complaints/:id/status
POST /api/complaints/:id/vote
GET /api/complaints/:id/votes
```

### Payments
```
GET /api/payments
POST /api/payments/:id/complete
POST /api/payments/:id/remind
```

### Roommate
```
POST /api/roommate/preferences
GET /api/roommate/suggestions
```

---

## 🧪 Testing the System

### 1. Test Registration

```bash
# Send OTP
POST http://localhost:5000/api/auth/send-otp
{ "email": "student@example.com" }

# Verify OTP (check email for code)
POST http://localhost:5000/api/auth/verify-otp
{ "email": "student@example.com", "otp": "123456" }

# Register
POST http://localhost:5000/api/auth/register
{
  "name": "John Doe",
  "email": "student@example.com",
  "phone": "9999999999",
  "password": "password123",
  "otp": "123456"
}
```

### 2. Test Complaint Submission

```bash
POST http://localhost:5000/api/complaints
Headers: Authorization: Bearer YOUR_TOKEN
Body: FormData {
  text: "Water leakage in room 101",
  image: <image_file>
}
```

### 3. Test Telegram Bot

1. Find your bot: Search `@YourBotName` on Telegram
2. Send `/start`
3. Click "📋 Submit Complaint"
4. Describe issue & send image
5. Bot confirms submission with AI analysis

### 4. Test Real-time Updates

1. Open two dashboards in different browsers
2. Submit complaint in first
3. Second dashboard updates instantly (Socket.io)

---

## 🎨 UI Screenshots

### Pages Available
- **Home**: Beautiful PG website
- **Register**: OTP-verified signup
- **Login**: Secure login
- **Dashboard**: Main hub with stats
- **Complaints**: Browse all complaints with filters
- **Payments**: Payment tracking & reminders
- **Profile**: User profile & settings

---

## 📈 Hackathon Winning Features

✨ **Why this wins**:
1. **Real Product Feel**: Complete workflow like a startup
2. **AI Integration**: Smart categorization & assignment
3. **Automation**: Auto-escalation, staff assignment, reminders
4. **Real-time**: WebSocket updates feel responsive
5. **Multi-channel**: Web + Telegram integration
6. **User Experience**: Beautiful UI with smooth animations
7. **Solves Real Problems**: Actual hostel pain points
8. **Scalable Architecture**: Clean separation of concerns

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL status
psql -U postgres

# Verify connection string in .env
DB_HOST=localhost
DB_PORT=5432
```

### Email not Sending
- Verify Gmail App Password (not regular password)
- Enable "Less secure app access" if needed
- Check email spam folder

### Telegram Bot not responding
- Verify token in .env
- Check internet connection
- Restart bot: `npm run dev`

---

## 📝 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_hostel
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=app_password
FRONTEND_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=your_bot_token
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Telegram Bot (.env)
```
TELEGRAM_BOT_TOKEN=your_bot_token
BACKEND_URL=http://localhost:5000/api
BACKEND_JWT_TOKEN=your_jwt_token
```

---

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ OTP verification
- ✅ Protected routes
- ✅ CORS enabled
- ✅ File upload validation
- ✅ SQL injection prevention (parameterized queries)

---

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review API endpoint documentation
- Verify environment variables
- Check logs in terminal

---

## 🎯 Future Enhancements

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Mobile app (React Native)
- [ ] Video call support for complaints
- [ ] Advanced analytics dashboard
- [ ] Machine learning for better roommate matching
- [ ] SMS reminders
- [ ] WhatsApp integration
- [ ] Multi-language support

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Built with ❤️ for the Hackathon

**Smart Hostel Management System** - Making hostel life smarter and easier! 🧠✨

**Made to WIN the Hackathon** 🏆
