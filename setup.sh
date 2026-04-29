#!/bin/bash

# Smart Hostel System - Setup Script
# This script automates the initial setup

echo "🚀 Smart Hostel Management System - Setup Script"
echo "=============================================="
echo ""

# Check prerequisites
echo "✅ Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ All prerequisites are installed"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
cp .env.example .env
echo "⚠️  Please edit backend/.env with your configuration"
npm install
mkdir -p uploads/complaints
echo "✅ Backend setup complete"
echo ""
cd ..

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend
npm install
echo "✅ Frontend setup complete"
echo ""
cd ..

# Setup Telegram Bot
echo "📦 Setting up Telegram Bot..."
cd telegram-bot
cp .env.example .env
echo "⚠️  Please edit telegram-bot/.env with your Telegram token"
npm install
echo "✅ Telegram Bot setup complete"
echo ""
cd ..

echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with database credentials"
echo "2. Edit telegram-bot/.env with Telegram token"
echo "3. Create PostgreSQL database and run database-init.sql"
echo "4. Run: npm run dev (in separate terminals)"
echo ""
echo "Start commands:"
echo "  Backend:      cd backend && npm run dev"
echo "  Frontend:     cd frontend && npm start"
echo "  Telegram Bot: cd telegram-bot && npm run dev"
echo ""
echo "📚 Documentation:"
echo "  - README.md: Complete documentation"
echo "  - QUICKSTART.md: Quick setup guide"
echo "  - PROJECT_STRUCTURE.md: Project structure overview"
echo "  - DEPLOYMENT.md: Production deployment guide"
