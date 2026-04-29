import React from 'react';
import { motion } from 'framer-motion';
import { Users, DoorOpen, AlertCircle, Wallet } from 'lucide-react';

export const StatsCard = ({ icon: Icon, title, value, bgColor }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${bgColor} rounded-xl p-6 text-white shadow-soft`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-opacity-80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon size={40} className="text-opacity-40" />
      </div>
    </motion.div>
  );
};

export const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatsCard
        icon={DoorOpen}
        title="Total Rooms"
        value={stats.totalRooms}
        bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      <StatsCard
        icon={Users}
        title="Occupied Rooms"
        value={stats.occupiedRooms}
        bgColor="bg-gradient-to-br from-green-500 to-green-600"
      />
      <StatsCard
        icon={AlertCircle}
        title="Total Complaints"
        value={stats.totalComplaints}
        bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
      />
      <StatsCard
        icon={Wallet}
        title="Pending Payments"
        value={stats.pendingPayments}
        bgColor="bg-gradient-to-br from-red-500 to-red-600"
      />
    </div>
  );
};
