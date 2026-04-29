import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const ComplaintCard = ({ complaint, onUpvote, hasVoted }) => {
  const priorityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    in_progress: <AlertTriangle className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    escalated: <AlertTriangle className="w-4 h-4" />,
  };

  const statusColors = {
    pending: 'text-orange-600',
    in_progress: 'text-blue-600',
    completed: 'text-green-600',
    escalated: 'text-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft hover:shadow-lg transition p-5 border-l-4 border-purple-500"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{complaint.category}</h3>
          <p className="text-gray-600 text-sm">by {complaint.user_name} • {new Date(complaint.created_at).toLocaleDateString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${priorityColors[complaint.priority]}`}>
          {complaint.priority.toUpperCase()}
        </span>
      </div>

      {complaint.image_url && (
        <img
          src={complaint.image_url}
          alt="Complaint"
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}

      <p className="text-gray-700 mb-3">{complaint.text}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUpvote}
            disabled={hasVoted}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition ${
              hasVoted
                ? 'bg-purple-200 text-purple-700'
                : 'bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700'
            }`}
          >
            <ThumbsUp size={16} />
            <span>{complaint.votes_count}</span>
          </motion.button>
          
          <div className={`flex items-center space-x-1 text-sm ${statusColors[complaint.status]}`}>
            {statusIcons[complaint.status]}
            <span className="capitalize">{complaint.status.replace('_', ' ')}</span>
          </div>
        </div>

        {complaint.assigned_to_name && (
          <p className="text-sm text-gray-600">👤 {complaint.assigned_to_name}</p>
        )}
      </div>
    </motion.div>
  );
};
