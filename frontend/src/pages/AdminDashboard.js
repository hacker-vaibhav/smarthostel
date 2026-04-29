import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Building2, CheckCircle, Clock, DoorOpen, Search, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { adminService, complaintsService, roomsService } from '../services/api';

export const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [managementUsers, setManagementUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'management') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, studentsRes, roomsRes, managementRes] = await Promise.all([
        complaintsService.getAllComplaints(),
        adminService.getStudents(),
        roomsService.getAllRooms(),
        adminService.getManagementUsers(),
      ]);
      setComplaints(complaintsRes.data);
      setStudents(studentsRes.data);
      setRooms(roomsRes.data);
      setManagementUsers(managementRes.data);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    await complaintsService.updateComplaintStatus(complaintId, newStatus);
    fetchData();
  };

  const handleAssignRoom = async () => {
    if (!selectedStudent || !selectedRoom) return;
    await roomsService.assignRoom(selectedRoom, selectedStudent.id);
    setSelectedRoom('');
    fetchData();
  };

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    pending: complaints.filter((c) => c.status === 'pending').length,
    inProgress: complaints.filter((c) => c.status === 'in_progress').length,
    completed: complaints.filter((c) => c.status === 'completed').length,
    escalated: complaints.filter((c) => c.status === 'escalated').length,
    students: students.length,
  };

  if (user?.role !== 'admin' && user?.role !== 'management') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xl font-bold text-slate-800">Unauthorized access</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#f5efe7_48%,#eef7f6_100%)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <header className="bg-white/85 border border-white shadow-soft rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Building2 />
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.28em] text-slate-500 uppercase">
                  {user?.role === 'admin' ? 'Platform Control' : 'Hostel Operations'}
                </p>
                <h1 className="text-3xl font-bold text-slate-900">
                  {user?.role === 'admin' ? 'Admin Operations Dashboard' : 'Management Operations Dashboard'}
                </h1>
                <p className="text-slate-600">
                  {user?.role === 'admin'
                    ? 'Manage students, management staff, rooms, complaints, and dues across hostels.'
                    : 'Manage students, rooms, complaints, dues, and staff workload for your hostel.'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<Users />} label="Students" value={stats.students} />
          <StatCard icon={<Clock />} label="Pending" value={stats.pending} />
          <StatCard icon={<AlertCircle />} label="In Progress" value={stats.inProgress} />
          <StatCard icon={<CheckCircle />} label="Completed" value={stats.completed} />
          <StatCard icon={<AlertCircle />} label="Escalated" value={stats.escalated} danger />
        </div>

        {loading ? (
          <p className="text-center text-slate-600 py-12">Loading admin data...</p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-2 bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Student Management</h2>
                  <p className="text-sm text-slate-500">Assign rooms, monitor complaints, and check dues.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search students"
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="px-5 py-3 text-left">Student</th>
                      <th className="px-5 py-3 text-left">Room</th>
                      <th className="px-5 py-3 text-left">Open Complaints</th>
                      <th className="px-5 py-3 text-left">Pending Dues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50 ${
                          selectedStudent?.id === student.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </td>
                        <td className="px-5 py-4">{student.room_number || 'Unassigned'}</td>
                        <td className="px-5 py-4">{student.open_complaints}</td>
                        <td className="px-5 py-4">Rs.{Number(student.pending_amount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="space-y-6">
              <section className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {user?.role === 'admin' ? 'Management & Staff' : 'Hostel Staff'}
                </h2>
                <div className="space-y-3">
                  {managementUsers.map((member) => (
                    <div key={member.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                        <span className="text-xs font-bold uppercase text-slate-600">
                          {member.staff_role || 'management'}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>{member.tenant_name || 'Platform'}</span>
                          <span>{member.current_tasks}/{member.max_tasks} tasks</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-900"
                            style={{ width: `${Math.min((Number(member.current_tasks || 0) / Number(member.max_tasks || 5)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Room Assignment</h2>
                {selectedStudent ? (
                  <>
                    <p className="text-sm text-slate-600 mb-4">Assign a room to {selectedStudent.name}</p>
                    <select
                      value={selectedRoom}
                      onChange={(event) => setSelectedRoom(event.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 mb-3"
                    >
                      <option value="">Select available room</option>
                      {rooms
                        .filter((room) => room.occupied_count < room.capacity)
                        .map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.room_number} · {room.occupied_count}/{room.capacity}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={handleAssignRoom}
                      className="w-full bg-slate-900 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <DoorOpen size={18} /> Assign Room
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Select a student from the table.</p>
                )}
              </section>

              <section className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Priority Complaint Queue</h2>
                <div className="space-y-3">
                  {complaints.slice(0, 6).map((complaint) => (
                    <div key={complaint.id} className={`p-3 rounded-xl border ${complaint.status === 'escalated' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">{complaint.category}</p>
                        <span className="text-xs font-bold uppercase text-slate-600">{complaint.priority}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{complaint.summary || complaint.text}</p>
                      <select
                        value={complaint.status}
                        onChange={(event) => handleStatusUpdate(complaint.id, event.target.value)}
                        className="mt-3 w-full border border-slate-200 rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="escalated">Escalated</option>
                      </select>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, danger }) => (
  <motion.div whileHover={{ y: -4 }} className={`rounded-2xl p-4 border shadow-soft ${danger ? 'bg-red-50 border-red-100 text-red-800' : 'bg-white border-slate-100 text-slate-900'}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className="opacity-60">{icon}</div>
    </div>
  </motion.div>
);
