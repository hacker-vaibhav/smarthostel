import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BarChart3, Building2, IndianRupee, TrendingUp, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { managementService } from '../services/api';

export const ManagementDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'management') {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await managementService.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching management dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'management') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xl font-bold text-slate-800">Admin or management access required</p>
      </div>
    );
  }

  const dashboard = data || {};
  const totals = dashboard.totals || {};
  const complaintsPerHostel = dashboard.complaintsPerHostel || [];
  const revenuePerHostel = dashboard.revenuePerHostel || [];
  const staffWorkload = dashboard.staffWorkload || [];
  const complaintTrends = dashboard.complaintTrends || [];
  const escalatedComplaints = dashboard.escalatedComplaints || [];
  const maxComplaints = Math.max(...complaintsPerHostel.map((item) => Number(item.complaints)), 1);
  const maxRevenue = Math.max(...revenuePerHostel.map((item) => Number(item.revenue)), 1);

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#f5efe7_50%,#ecfeff_100%)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <header className="bg-white/90 rounded-2xl border border-white shadow-soft p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <BarChart3 />
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.28em] text-slate-500 uppercase">Portfolio View</p>
                <h1 className="text-3xl font-bold text-slate-900">Management Dashboard</h1>
                <p className="text-slate-600">All hostels, revenue, escalations, staff workload, and trends.</p>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <p className="text-center text-slate-600 py-12">Loading management analytics...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Metric icon={<Building2 />} label="Hostels" value={totals.total_hostels} />
              <Metric icon={<Users />} label="Students" value={totals.total_students} />
              <Metric icon={<AlertTriangle />} label="Complaints" value={totals.total_complaints} />
              <Metric icon={<AlertTriangle />} label="Escalated" value={totals.escalated_complaints} danger />
              <Metric icon={<IndianRupee />} label="Revenue" value={`Rs.${Number(totals.total_revenue || 0).toLocaleString()}`} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <AnalyticsPanel title="Complaints Per Hostel">
                {complaintsPerHostel.map((item) => (
                  <BarRow key={item.hostel} label={item.hostel} value={item.complaints} max={maxComplaints} tone="complaint" />
                ))}
              </AnalyticsPanel>

              <AnalyticsPanel title="Revenue Per Hostel">
                {revenuePerHostel.map((item) => (
                  <BarRow key={item.hostel} label={item.hostel} value={`Rs.${Number(item.revenue).toLocaleString()}`} widthValue={Number(item.revenue)} max={maxRevenue} />
                ))}
              </AnalyticsPanel>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <AnalyticsPanel title="Staff Workload">
                <div className="space-y-3">
                  {staffWorkload.map((staff) => {
                    const load = Math.min((Number(staff.current_tasks) / Number(staff.max_tasks || 5)) * 100, 100);
                    return (
                      <div key={`${staff.hostel}-${staff.staff_name}`} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold text-slate-800">{staff.staff_name}</span>
                          <span className="text-slate-500">{staff.current_tasks}/{staff.max_tasks}</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${load >= 100 ? 'bg-red-500' : 'bg-slate-900'}`} style={{ width: `${load}%` }} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{staff.hostel} · {staff.role}</p>
                      </div>
                    );
                  })}
                </div>
              </AnalyticsPanel>

              <AnalyticsPanel title="Complaint Trends">
                <div className="space-y-3">
                  {complaintTrends.map((trend) => (
                    <div key={trend.date} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm text-slate-600">{new Date(trend.date).toLocaleDateString()}</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1"><TrendingUp size={15} /> {trend.complaints}</span>
                    </div>
                  ))}
                </div>
              </AnalyticsPanel>

              <AnalyticsPanel title="Escalated Complaints">
                <div className="space-y-3">
                  {escalatedComplaints.map((complaint) => (
                    <div key={complaint.id} className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-red-900">#{complaint.id} {complaint.category}</p>
                        <span className="text-xs font-bold text-red-700 uppercase">{complaint.priority}</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">{complaint.tenant_name} · {complaint.user_name}</p>
                      <p className="text-sm text-slate-700 mt-2">{complaint.summary || complaint.text}</p>
                    </div>
                  ))}
                </div>
              </AnalyticsPanel>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Metric = ({ icon, label, value, danger }) => (
  <motion.div whileHover={{ y: -4 }} className={`rounded-2xl border shadow-soft p-4 ${danger ? 'bg-red-50 border-red-100 text-red-800' : 'bg-white border-slate-100 text-slate-900'}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
        <p className="text-2xl font-bold mt-1">{value || 0}</p>
      </div>
      <div className="opacity-60">{icon}</div>
    </div>
  </motion.div>
);

const AnalyticsPanel = ({ title, children }) => (
  <section className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
    <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
    {children}
  </section>
);

const BarRow = ({ label, value, widthValue, max, tone }) => {
  const numeric = Number(widthValue ?? value);
  const width = Math.max((numeric / max) * 100, numeric > 0 ? 8 : 0);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${tone === 'complaint' ? 'bg-red-400' : 'bg-slate-900'}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};
