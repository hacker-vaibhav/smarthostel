import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { complaintsService } from '../services/api';

export const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    escalated: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'staff' || user?.role === 'warden') {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintsService.getAllComplaints();
      setComplaints(response.data);

      // Calculate stats
      const statsData = {
        pending: response.data.filter(c => c.status === 'pending').length,
        inProgress: response.data.filter(c => c.status === 'in_progress').length,
        completed: response.data.filter(c => c.status === 'completed').length,
        escalated: response.data.filter(c => c.status === 'escalated').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await complaintsService.updateComplaintStatus(complaintId, newStatus);
      setComplaints(complaints.map(c =>
        c.id === complaintId ? { ...c, status: newStatus } : c
      ));
      fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'staff' && user?.role !== 'warden') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">❌ Unauthorized Access</p>
          <p className="text-gray-600 mt-2">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 className="text-purple-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage complaints and staff assignments</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Clock />} label="Pending" value={stats.pending} color="orange" />
          <StatCard icon={<AlertCircle />} label="In Progress" value={stats.inProgress} color="blue" />
          <StatCard icon={<CheckCircle />} label="Completed" value={stats.completed} color="green" />
          <StatCard icon={<AlertCircle />} label="Escalated" value={stats.escalated} color="red" />
        </div>

        {/* Complaints Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">⏳ Loading complaints...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-soft overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-gradient-primary text-white">
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">Category</th>
                    <th className="px-6 py-4 text-left">Priority</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Assigned To</th>
                    <th className="px-6 py-4 text-left">Votes</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">#{complaint.id}</td>
                      <td className="px-6 py-4 font-semibold">{complaint.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          complaint.priority === 'critical' ? 'bg-red-200 text-red-800' :
                          complaint.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                          complaint.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {complaint.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={complaint.status}
                          onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="escalated">Escalated</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">{complaint.assigned_to_name || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-bold">
                          👍 {complaint.votes_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          View Details
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorMap = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${colorMap[color]} rounded-xl p-4`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-3xl opacity-40">{icon}</div>
      </div>
    </motion.div>
  );
};
