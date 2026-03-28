import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';
import StatsOverview from '../components/StatsOverview';
import AnalyticsBoard from '../components/AnalyticsBoard';
import SimilarityMonitor from '../components/SimilarityMonitor';
import AgentManager from '../components/AgentManager';
import api from '../utils/api';
import { LayoutDashboard, BarChart3, Users, MonitorPlay } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [adminStats, setAdminStats] = useState({ stats: [], priorityStats: [] });
  const [trends, setTrends] = useState({ dayTrends: [], monthTrends: [] });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTickets();
    if (user?.role === 'admin') {
      fetchAdminStats();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error fetching tickets', err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const [statsRes, trendsRes] = await Promise.all([
        api.get('/tickets/stats/admin'),
        api.get('/tickets/trends/admin')
      ]);
      setAdminStats(statsRes.data);
      setTrends(trendsRes.data);
    } catch (err) {
      console.error('Error fetching admin stats', err);
    }
  };

  const handleTicketCreated = (newTicket) => {
    setTickets([newTicket, ...tickets]);
    if (user?.role === 'admin') fetchAdminStats();
  };

  const handleStatusChange = async (ticketId, status, resolution_msg = '', ai_resolution_msg = '') => {
    try {
      const res = await api.put(`/tickets/${ticketId}/status`, { 
        status, 
        resolution_msg, 
        ai_resolution_msg 
      });
      setTickets(tickets.map(t => t._id === ticketId ? res.data.ticket : t));
      if (user?.role === 'admin') fetchAdminStats(); // Refresh stats
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isAdmin ? 'Administrative Control Center' : 'Welcome Back'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin ? 'Monitor system health and staff performance' : 'Manage your support requests efficiently'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 border border-gray-100 max-w-2xl">
            <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
              <LayoutDashboard size={18} /> Overview
            </button>
            <button onClick={() => setActiveTab('monitor')} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition ${activeTab === 'monitor' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
              <MonitorPlay size={18} /> Monitor
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
              <BarChart3 size={18} /> Analytics
            </button>
            <button onClick={() => setActiveTab('staff')} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition ${activeTab === 'staff' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Users size={18} /> Staff
            </button>
          </div>
        )}

        {isAdmin && activeTab === 'overview' && (
          <StatsOverview stats={adminStats.stats} />
        )}

        <div className="grid grid-cols-1 gap-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {user?.role === 'user' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Submit New Ticket</h2>
                  <TicketForm onTicketCreated={handleTicketCreated} />
                </div>
              )}
              <TicketList tickets={tickets} role={user?.role} onStatusChange={handleStatusChange} />
            </div>
          )}

          {isAdmin && activeTab === 'monitor' && <SimilarityMonitor tickets={tickets} />}
          {isAdmin && activeTab === 'analytics' && <AnalyticsBoard trends={trends} priorityStats={adminStats.priorityStats} />}
          {isAdmin && activeTab === 'staff' && <AgentManager />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
