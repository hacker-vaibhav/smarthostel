const axios = require('axios');
require('dotenv').config();

// Using Hugging Face API for text classification and summarization
const analyzeComplaint = async (complaintText, imageDescription = '') => {
  try {
    // Simulate AI analysis - in production use actual AI API
    const analysis = {
      category: categorizeComplaint(complaintText),
      priority: determinePriority(complaintText),
      summary: generateSummary(complaintText),
      suggested_staff: suggestStaff(categorizeComplaint(complaintText)),
    };

    console.log('🤖 AI Analysis:', analysis);
    return analysis;
  } catch (error) {
    console.error('❌ Error analyzing complaint:', error);
    throw error;
  }
};

const categorizeComplaint = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('water') || lowerText.includes('plumb')) return 'Plumbing';
  if (lowerText.includes('electric') || lowerText.includes('light') || lowerText.includes('power')) return 'Electrical';
  if (lowerText.includes('wifi') || lowerText.includes('internet') || lowerText.includes('network')) return 'Internet';
  if (lowerText.includes('clean') || lowerText.includes('dirt') || lowerText.includes('mess')) return 'Cleaning';
  if (lowerText.includes('noise') || lowerText.includes('sound') || lowerText.includes('loud')) return 'Noise';
  if (lowerText.includes('security') || lowerText.includes('theft') || lowerText.includes('safe')) return 'Security';
  if (lowerText.includes('food') || lowerText.includes('meal') || lowerText.includes('kitchen')) return 'Food Quality';
  if (lowerText.includes('repair') || lowerText.includes('broken') || lowerText.includes('damage')) return 'Maintenance';
  
  return 'General';
};

const determinePriority = (text) => {
  const lowerText = text.toLowerCase();
  
  // Critical keywords
  if (lowerText.includes('emergency') || lowerText.includes('urgent') || lowerText.includes('critical') || 
      lowerText.includes('severe') || lowerText.includes('dangerous')) {
    return 'critical';
  }
  
  // High priority keywords
  if (lowerText.includes('water leak') || lowerText.includes('fire') || lowerText.includes('electric hazard') ||
      lowerText.includes('no water') || lowerText.includes('no power')) {
    return 'high';
  }
  
  // Medium priority
  if (lowerText.includes('not working') || lowerText.includes('broken') || lowerText.includes('damage')) {
    return 'medium';
  }
  
  return 'low';
};

const generateSummary = (text) => {
  // Simple summary generation - take first 120 characters
  if (text.length > 120) {
    return text.substring(0, 120) + '...';
  }
  return text;
};

const suggestStaff = (category) => {
  const staffMap = {
    'Plumbing': 'Plumber - Raj Kumar',
    'Electrical': 'Electrician - Amit Singh',
    'Internet': 'Network Admin - Priya Verma',
    'Cleaning': 'Cleaner - Maria Santos',
    'Noise': 'Security Guard - Vikram Patel',
    'Security': 'Security Head - Rajesh Sharma',
    'Food Quality': 'Cook - Mrs. Sharma',
    'Maintenance': 'Maintenance Lead - Mohan Das',
    'General': 'Admin - Neha Gupta',
  };

  return staffMap[category] || 'Admin - Neha Gupta';
};

// Simulate roommate matching
const findBestRoommates = async (userId, preferences) => {
  try {
    // This would query database for matching preferences
    const matches = [
      { id: 1, name: 'Rohan Sharma', course: preferences.course, year: preferences.year, sleepSchedule: preferences.sleep_schedule, compatibility: 95 },
      { id: 2, name: 'Arjun Patel', course: preferences.course, year: preferences.year, sleepSchedule: preferences.sleep_schedule, compatibility: 87 },
      { id: 3, name: 'Vikram Singh', course: preferences.course, year: preferences.year, sleepSchedule: preferences.sleep_schedule, compatibility: 82 },
    ];

    return matches;
  } catch (error) {
    console.error('❌ Error finding roommates:', error);
    throw error;
  }
};

module.exports = {
  analyzeComplaint,
  findBestRoommates,
};
