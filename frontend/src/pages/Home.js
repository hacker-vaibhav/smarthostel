import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Lock, Globe, BarChart3 } from 'lucide-react';

export const Home = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            🧠 Smart Hostel Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered hostel system connecting students and administrators for seamless room allocation, complaint tracking, and smart automation.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition"
              >
                Get Started <ArrowRight size={20} />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold border-2 border-purple-300 hover:border-purple-500 transition"
              >
                Login
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          <FeatureCard
            icon={<Zap className="w-12 h-12 text-yellow-500" />}
            title="AI-Powered System"
            description="Automatic complaint analysis, categorization, and staff assignment"
          />
          <FeatureCard
            icon={<Users className="w-12 h-12 text-blue-500" />}
            title="Smart Roommate Matching"
            description="Find perfect roommates based on preferences and compatibility"
          />
          <FeatureCard
            icon={<Lock className="w-12 h-12 text-green-500" />}
            title="Secure & Private"
            description="OTP-verified registration with secure authentication"
          />
          <FeatureCard
            icon={<Globe className="w-12 h-12 text-pink-500" />}
            title="Real-time Updates"
            description="Live complaint status, payment reminders, and notifications"
          />
          <FeatureCard
            icon={<BarChart3 className="w-12 h-12 text-purple-500" />}
            title="Smart Admin Dashboard"
            description="Complete oversight with analytics and priority management"
          />
          <FeatureCard
            icon={<span className="text-4xl">🤖</span>}
            title="Telegram Bot Integration"
            description="Submit complaints directly via Telegram with images"
          />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to revolutionize hostel management?</h2>
          <p className="text-lg mb-8">Join hundreds of students and administrators already using Smart Hostel</p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Sign Up Now
            </motion.button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">About Our Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">🏢 For Students</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Easy room booking</li>
              <li>✅ Smart roommate recommendations</li>
              <li>✅ Submit complaints with AI analysis</li>
              <li>✅ Track payment status</li>
              <li>✅ Real-time issue tracking</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">🖥️ For Administrators</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Centralized dashboard</li>
              <li>✅ AI-powered complaint categorization</li>
              <li>✅ Smart staff assignment</li>
              <li>✅ Auto-escalation system</li>
              <li>✅ Payment tracking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-12">
        <p>© 2024 Smart Hostel Management. All rights reserved. 🧠</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};
