import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, TrendingUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { complaintsService, roomsService, paymentsService } from '../services/api';
import { ComplaintForm } from '../components/ComplaintForm';
import { ComplaintCard } from '../components/ComplaintCard';
import { DashboardStats } from '../components/StatsCard';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [userComplaints, setUserComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    totalComplaints: 0,
    pendingPayments: 0,
  });
  const [votedComplaints, setVotedComplaints] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch complaints
      const complaintsRes = await complaintsService.getAllComplaints();
      setComplaints(complaintsRes.data);

      // Fetch user's complaints
      if (user?.id) {
        const userComplaintsRes = await complaintsService.getUserComplaints(user.id);
        setUserComplaints(userComplaintsRes.data);
      }

      // Fetch rooms for stats
      const roomsRes = await roomsService.getAllRooms();
      const occupied = roomsRes.data.reduce((sum, room) => sum + room.occupied_count, 0);

      // Fetch payments
      const paymentsRes = await paymentsService.getPayments();
      const pending = paymentsRes.data.filter(p => p.status === 'pending').length;

      setStats({
        totalRooms: roomsRes.data.length,
        occupiedRooms: occupied,
        totalComplaints: complaintsRes.data.length,
        pendingPayments: pending,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (complaintId) => {
    try {
      if (votedComplaints.includes(complaintId)) return;

      await complaintsService.upvoteComplaint(complaintId);
      setVotedComplaints([...votedComplaints, complaintId]);

      // Update votes count in UI
      setComplaints(complaints.map(c =>
        c.id === complaintId ? { ...c, votes_count: c.votes_count + 1 } : c
      ));
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleComplaintSubmit = (newComplaint) => {
    setComplaints([newComplaint.complaint, ...complaints]);
    setUserComplaints([newComplaint.complaint, ...userComplaints]);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening in your hostel today</p>
        </motion.div>

        {/* Stats Cards */}
        {!loading && <DashboardStats stats={stats} />}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Complaints Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Submit Complaint Button */}
            {!showForm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(true)}
                className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Submit a Complaint
              </motion.button>
            )}

            {/* Complaint Form */}
            {showForm && (
              <ComplaintForm onSubmit={handleComplaintSubmit} />
            )}

            {/* Complaints List */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="text-orange-500" />
                All Complaints
              </h2>
              {complaints.length === 0 ? (
                <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                  <p className="text-gray-600">✨ No complaints yet. Great!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onUpvote={() => handleUpvote(complaint.id)}
                      hasVoted={votedComplaints.includes(complaint.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* My Complaints */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">My Complaints</h3>
              {userComplaints.length === 0 ? (
                <p className="text-gray-600 text-sm">You haven't submitted any complaints</p>
              ) : (
                <div className="space-y-3">
                  {userComplaints.slice(0, 5).map((complaint) => (
                    <div key={complaint.id} className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-semibold text-purple-900">{complaint.category}</p>
                      <p className="text-xs text-gray-600 mt-1">{complaint.text.substring(0, 60)}...</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-purple-600">
                          👍 {complaint.votes_count}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          complaint.status === 'completed' ? 'bg-green-100 text-green-800' :
                          complaint.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-secondary text-white rounded-xl shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} /> Real-time Updates
              </h3>
              <ul className="space-y-2 text-sm">
                <li>✅ Live complaint tracking</li>
                <li>✅ Instant status updates</li>
                <li>✅ Payment reminders</li>
                <li>✅ Staff assignments</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
