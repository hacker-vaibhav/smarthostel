import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle } from 'lucide-react';
import { complaintsService } from '../services/api';

export const ComplaintForm = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setError('');
    } else {
      setError('❌ Please select a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) {
      setError('❌ Please describe your complaint');
      return;
    }

    if (!image) {
      setError('❌ Please upload an image');
      return;
    }

    try {
      setLoading(true);
      const response = await complaintsService.submitComplaint(text, image);
      
      onSubmit(response.data);
      setText('');
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.message || '❌ Error submitting complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-soft p-6 mb-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Report an Issue</h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Describe your complaint
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's the issue? (e.g., Water leakage, Broken WiFi, Noisy neighbors...)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="4"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📸 Upload Image (Required)
          </label>
          <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 transition">
            <div className="text-center">
              <Upload className="mx-auto text-purple-500 mb-2" />
              <p className="text-gray-600">
                {image ? image.name : 'Click to upload image'}
              </p>
            </div>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </label>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? '⏳ Submitting...' : '✅ Submit Complaint'}
        </motion.button>
      </form>
    </motion.div>
  );
};
