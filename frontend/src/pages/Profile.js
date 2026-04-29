import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-soft p-8"
        >
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-600 text-sm capitalize mt-1">Role: {user?.role}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="p-4 bg-blue-50 rounded-lg text-center"
              >
                <p className="text-2xl font-bold text-blue-600">5</p>
                <p className="text-sm text-gray-600">Complaints Filed</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                className="p-4 bg-green-50 rounded-lg text-center"
              >
                <p className="text-2xl font-bold text-green-600">✅</p>
                <p className="text-sm text-gray-600">All Paid</p>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
