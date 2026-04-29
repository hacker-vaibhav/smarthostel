# Smart Hostel System - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Database Setup
```bash
# Create database
createdb smart_hostel

# Import schema
psql smart_hostel < backend/config/database-init.sql
```

### Step 2: Backend (Terminal 1)
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
npm install
npm run dev
```

### Step 3: Frontend (Terminal 2)
```bash
cd frontend
npm install
npm start
```

### Step 4: Optional - Telegram Bot (Terminal 3)
```bash
cd telegram-bot
cp .env.example .env
npm install
npm run dev
```

---

## 🎯 Demo Credentials

Use these to test:
```
Email: test@example.com
Password: password123
```

---

## ✅ Verify Installation

1. **Backend**: http://localhost:5000/health
   Should return: `{ "message": "✅ Smart Hostel Backend is running" }`

2. **Frontend**: http://localhost:3000
   Should show: Smart Hostel Home Page

3. **Database**: 
   ```bash
   psql smart_hostel
   \dt  # List all tables
   ```

---

## 🧪 Test Workflow

1. Go to http://localhost:3000/register
2. Enter email, get OTP (check console/email)
3. Verify OTP, complete registration
4. Login with credentials
5. Go to Dashboard
6. Submit complaint with image
7. Check real-time updates
8. View payments

---

## 📱 Telegram Bot Testing

1. Get bot token from @BotFather
2. Add to telegram-bot/.env
3. Run: `npm run dev`
4. Search your bot on Telegram
5. Send `/start`
6. Use `/complaint` to submit

---

## 🔧 Troubleshooting

**Port 5000 in use?**
```bash
lsof -i :5000
kill -9 <PID>
```

**Port 3000 in use?**
```bash
lsof -i :3000
kill -9 <PID>
```

**Database error?**
```bash
# Check PostgreSQL status
pg_isready

# Recreate database
dropdb smart_hostel
createdb smart_hostel
```

---

## 📊 Project Structure

```
smart-hostel-system/
├── backend/                 # Node.js + Express
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── middleware/         # Auth, validation
│   ├── config/            # Database setup
│   └── server.js          # Main server
│
├── frontend/               # React + Tailwind
│   ├── src/
│   │   ├── pages/        # Different pages
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API calls
│   │   └── context/      # Auth context
│   └── package.json
│
└── telegram-bot/          # Telegram Bot
    ├── bot.js            # Bot logic
    └── package.json
```

---

## 🎓 Learning Resources

- Express.js: https://expressjs.com
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Socket.io: https://socket.io
- PostgreSQL: https://postgresql.org

---

Ready to deploy and impress the judges! 🚀
