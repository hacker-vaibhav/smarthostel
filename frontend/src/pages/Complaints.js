import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Filter } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { complaintsService } from '../services/api';
import { ComplaintCard } from '../components/ComplaintCard';

export const Complaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filter, setFilter] = useState('all'); // all, my, pending, completed
  const [loading, setLoading] = useState(true);
  const [votedComplaints, setVotedComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, complaints]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintsService.getAllComplaints();
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...complaints];

    if (filter === 'my') {
      filtered = filtered.filter(c => c.user_id === user?.id);
    } else if (filter === 'pending') {
      filtered = filtered.filter(c => c.status === 'pending');
    } else if (filter === 'completed') {
      filtered = filtered.filter(c => c.status === 'completed');
    }

    setFilteredComplaints(filtered);
  };

  const handleUpvote = async (complaintId) => {
    try {
      if (votedComplaints.includes(complaintId)) return;

      await complaintsService.upvoteComplaint(complaintId);
      setVotedComplaints([...votedComplaints, complaintId]);

      setComplaints(complaints.map(c =>
        c.id === complaintId ? { ...c, votes_count: c.votes_count + 1 } : c
      ));
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <AlertCircle className="text-orange-500" />
            All Complaints
          </h1>
          <p className="text-gray-600 mt-2">Track and manage hostel complaints</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-soft p-4 mb-6 flex flex-wrap gap-2"
        >
          <Filter size={20} className="text-gray-600 self-center" />
          {[
            { value: 'all', label: 'All' },
            { value: 'my', label: 'My Complaints' },
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
          ].map((f) => (
            <motion.button
              key={f.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === f.value
                  ? 'bg-gradient-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Complaints List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">⏳ Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-soft p-12 text-center"
          >
            <p className="text-gray-600 text-lg">✨ No complaints found</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredComplaints.map((complaint) => (
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
  );
};
