# 🚀 DEPLOYMENT GUIDE

## Deploy to Production

### Option 1: Deploy on Render (Recommended for Hackathon)

#### Backend on Render

1. Push code to GitHub
2. Go to https://render.com
3. Click "New +" → "Web Service"
4. Connect GitHub repo
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables
8. Deploy

#### Frontend on Vercel

1. Go to https://vercel.com
2. Connect GitHub repo
3. Select `frontend` folder
4. Add environment variables
5. Deploy

### Option 2: Docker Deployment

Create `Dockerfile` for backend:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Option 3: AWS/Azure/DigitalOcean

1. Create VM instance
2. SSH into server
3. Install Node.js, PostgreSQL
4. Clone repo
5. Setup .env
6. Install dependencies
7. Start with PM2

```bash
npm install -g pm2
pm2 start server.js --name "hostel-backend"
pm2 save
pm2 startup
```

---

## Environment Variables for Production

### Backend
```
NODE_ENV=production
PORT=5000
DB_HOST=production-db.xxx.rds.amazonaws.com
DB_PORT=5432
DB_NAME=smart_hostel_prod
DB_USER=produser
DB_PASSWORD=strong_password
JWT_SECRET=production_secret_key_12345
JWT_EXPIRE=7d
GMAIL_USER=noreply@smarthos.com
GMAIL_PASSWORD=app_password
FRONTEND_URL=https://smarthos.com
TELEGRAM_BOT_TOKEN=prod_bot_token
```

### Frontend
```
REACT_APP_API_URL=https://api.smarthos.com/api
REACT_APP_SOCKET_URL=https://api.smarthos.com
```

---

## Domain & SSL

1. Buy domain (Namecheap, GoDaddy, etc.)
2. Point DNS to your server/Render
3. Enable SSL (Let's Encrypt - free)
4. Update API URLs to use HTTPS

---

## Monitoring

Install monitoring tools:
```bash
npm install -g pm2-plus
pm2 plus  # Real-time monitoring
```

---

## Performance Tips

1. Enable Redis caching
2. Implement rate limiting
3. Optimize database queries
4. Use CDN for static files
5. Enable gzip compression

---

Ready to deploy! 🚀
