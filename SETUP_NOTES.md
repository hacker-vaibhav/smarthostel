# 📝 SETUP NOTES & TIPS

## Common Issues & Solutions

### 1. OTP Email Not Sending

**Problem:** "Error sending OTP"

**Solutions:**
```
1. Gmail App Password (Not regular password!)
   - Go: https://myaccount.google.com/apppasswords
   - Generate password for "Mail"
   - Copy 16-character code
   - Add to .env: GMAIL_PASSWORD=xxxx xxxx xxxx xxxx

2. Check .env format:
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASSWORD=xxxx xxxx xxxx xxxx (16 chars)

3. Enable "Less secure apps"
   - https://myaccount.google.com/security

4. Check Gmail SMTP settings
   - SMTP Server: smtp.gmail.com
   - Port: 587
   - TLS: Yes
```

### 2. CORS Errors

**Problem:** Frontend can't reach backend

**Solution:**
```javascript
// In backend server.js:
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### 3. Database Connection Failed

**Problem:** "Cannot connect to PostgreSQL"

**Solutions:**
```bash
# Start PostgreSQL service
# Windows:
net start postgresql-x64-15

# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Check connection:
psql -U postgres -d smart_hostel

# See current connections:
\conninfo
```

### 4. Port Already in Use

**Problem:** "Address already in use"

```bash
# Find what's using the port
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # Database

# Kill the process
kill -9 <PID>

# Or use a different port
# In backend: change PORT=5001
# In frontend: PORT=3001 npm start
```

### 5. Module Not Found Error

**Problem:** "Cannot find module 'express'"

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Install specific package
npm install express
```

### 6. Telegram Bot Not Responding

**Problem:** Bot doesn't reply to messages

**Solutions:**
```
1. Check token format (should be long string)
2. Verify bot is running: npm run dev
3. Check .env file has correct token
4. Restart bot and try again
5. Check bot wasn't disabled by BotFather
```

---

## Performance Optimization

### Frontend Optimization
```javascript
// Use React.memo to prevent re-renders
export const ComplaintCard = React.memo(({ complaint }) => {
  // Component
});

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Debounce search
import { debounce } from 'lodash';
const handleSearch = debounce((query) => {
  // Search logic
}, 300);
```

### Backend Optimization
```javascript
// Add database indexes (already in schema)
// Use connection pooling
const pool = new Pool({ max: 20 });

// Cache frequently accessed data
const cache = {};

// Compress responses
app.use(compression());
```

---

## Database Maintenance

### Backup Database
```bash
# Backup
pg_dump smart_hostel > backup.sql

# Restore
psql smart_hostel < backup.sql
```

### View Database
```bash
# Connect
psql -U postgres smart_hostel

# List tables
\dt

# View specific table
SELECT * FROM complaints;

# View table structure
\d complaints

# Exit
\q
```

### Reset Database
```bash
# Drop and recreate
dropdb smart_hostel
createdb smart_hostel
psql smart_hostel < backend/config/database-init.sql
```

---

## Testing Endpoints with Curl

### Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"test@example.com",
    "phone":"9999999999",
    "password":"password123",
    "otp":"123456"
  }'
```

### Get All Rooms
```bash
curl http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Useful Commands

### Development
```bash
# Start all services at once (needs terminals)
cd backend && npm run dev
cd frontend && npm start
cd telegram-bot && npm run dev

# Check if services are running
curl http://localhost:5000/health
curl http://localhost:3000
```

### Database
```bash
# Create database
createdb smart_hostel

# Drop database
dropdb smart_hostel

# Connect to database
psql -U postgres smart_hostel

# View size
SELECT pg_size_pretty(pg_database_size('smart_hostel'));
```

### Node/npm
```bash
# List global packages
npm list -g

# Update npm
npm install -g npm@latest

# Clear npm cache
npm cache clean --force

# Audit vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Environment Best Practices

### Never commit .env file!
```bash
# Add to .gitignore
echo ".env" >> .gitignore
```

### Use .env.example for template
```
# .env.example contains template
# Never include real secrets!
```

### Rotate secrets regularly
- Change JWT_SECRET every month
- Regenerate API tokens
- Rotate database passwords

---

## Monitoring in Production

### Check server status
```bash
# Using PM2
pm2 status
pm2 logs
pm2 monit

# Manual check
curl https://api.smarthos.com/health
```

### View logs
```bash
# Backend logs
pm2 logs smart-hostel-backend

# Error logs
pm2 logs smart-hostel-backend --err
```

### Monitor database
```sql
-- Active connections
SELECT * FROM pg_stat_activity;

-- Slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC;

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Deployment Checklist

Before deploying to production:
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Secrets rotated
- [ ] Dependencies updated
- [ ] Security scan passed
- [ ] Load testing completed
- [ ] Rollback plan ready
- [ ] Status page created

---

## Additional Resources

### Documentation
- Express: https://expressjs.com
- React: https://react.dev
- PostgreSQL: https://postgresql.org
- Tailwind CSS: https://tailwindcss.com

### Tools
- Postman: API testing
- DBeaver: Database management
- VS Code: Code editor
- GitHub Desktop: Version control

### Communities
- Stack Overflow: Problem solving
- GitHub: Code inspiration
- Dev.to: Articles & tips

---

## Final Words

✅ **Keep it simple** - Don't over-engineer for demo
✅ **Test thoroughly** - Try all paths before demo
✅ **Have backup** - Record video just in case
✅ **Tell a story** - Features are features, but problems solved is what matters
✅ **Be confident** - You built something great!

🚀 Ready to deploy and win! 🏆
