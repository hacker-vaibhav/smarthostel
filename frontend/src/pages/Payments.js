import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, AlertCircle, SendHorizonal } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { paymentsService } from '../services/api';

export const Payments = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsService.getPayments();
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async (paymentId) => {
    try {
      await paymentsService.completePayment(paymentId);
      setPayments(payments.map(p =>
        p.id === paymentId ? { ...p, status: 'completed', paid_date: new Date().toISOString() } : p
      ));
    } catch (error) {
      console.error('Error completing payment:', error);
    }
  };

  const handleSendReminder = async (paymentId) => {
    try {
      await paymentsService.sendReminder(paymentId);
      alert('✅ Reminder sent!');
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
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
            <Wallet className="text-purple-600" />
            Payments
          </h1>
          <p className="text-gray-600 mt-2">Manage your hostel payments and dues</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">⏳ Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-soft p-12 text-center"
          >
            <p className="text-gray-600 text-lg">✨ No payments to show</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-soft overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-primary text-white">
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Due Date</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-gray-800">₹{payment.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {payment.status === 'pending' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCompletePayment(payment.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition text-sm"
                            >
                              ✅ Pay
                            </motion.button>
                            {['admin', 'warden'].includes(user?.role) && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSendReminder(payment.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition text-sm flex items-center gap-1"
                              >
                                <SendHorizonal size={14} /> Remind
                              </motion.button>
                            )}
                          </>
                        )}
                        {payment.status === 'completed' && (
                          <CheckCircle className="text-green-500" size={20} />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
};
