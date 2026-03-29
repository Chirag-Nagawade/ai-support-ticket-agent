import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';
import TicketDetail from '../components/TicketDetail';
import StatsOverview from '../components/StatsOverview';
import AnalyticsBoard from '../components/AnalyticsBoard';
import SimilarityMonitor from '../components/SimilarityMonitor';
import AgentManager from '../components/AgentManager';
import api from '../utils/api';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  MonitorPlay,
  ClipboardList,
  CheckCircle2,
  Clock,
  Shield,
  Tag
} from 'lucide-react';

const SentinelAlerts = ({ data, onSync }) => {
  if (!data?.isOutage || !data?.activeAlerts) return null;
  
  const getAlertStyles = (category) => {
    switch (category) {
      case 'Security': return {
        bg: 'from-indigo-700 via-purple-600 to-pink-500',
        iconBg: 'bg-indigo-600',
        text: 'text-indigo-600',
        label: 'Security Breach Detected',
        badge: 'Critical Security',
        impact: 'High Data Risk'
      };
      case 'Billing': return {
        bg: 'from-orange-600 via-amber-500 to-yellow-500',
        iconBg: 'bg-orange-600',
        text: 'text-orange-600',
        label: 'Revenue Block Detected',
        badge: 'Financial Intelligence',
        impact: 'Loss of Revenue'
      };
      default: return {
        bg: 'from-red-600 via-red-500 to-orange-500',
        iconBg: 'bg-red-600',
        text: 'text-red-600',
        label: 'System Outage Detected',
        badge: 'System Critical',
        impact: 'Service Disruption'
      };
    }
  };

  return (
    <div className="space-y-4 mb-10 relative">
      <div className="absolute -top-6 right-0 flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live Sentinel Syncing...</p>
      </div>

      {data.activeAlerts.map((alert, idx) => {
        const styles = getAlertStyles(alert.category);
        return (
          <div key={idx} className={`bg-gradient-to-r ${styles.bg} p-[2px] rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.1)] animate-in slide-in-from-top-4 duration-700`}>
            <div className="bg-white rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className={`absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#000_0%,transparent_50%)] animate-pulse`}></div>
              </div>

              <div className="flex items-center gap-6 relative z-10">
                <div className="relative">
                  <div className={`absolute inset-0 ${styles.iconBg} rounded-2xl blur-lg opacity-40 animate-pulse`}></div>
                  <div className={`w-16 h-16 ${styles.iconBg} text-white rounded-2xl flex items-center justify-center relative shadow-2xl`}>
                    <Shield size={32} className="animate-bounce" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-2 py-0.5 ${styles.iconBg} text-white text-[8px] font-black uppercase tracking-widest rounded-md animate-pulse`}>{styles.badge}</span>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">{styles.label}</h3>
                  </div>
                  <p className="text-xs font-bold text-gray-500 max-w-xl leading-relaxed">
                    Anomaly detected: <span className={styles.text}>{alert.count} users</span> reported {alert.category.toLowerCase()} issues in the last 15 minutes. Impacting: <span className="font-black italic text-gray-900">{alert.impactedUsers.slice(0, 3).join(', ')}{alert.count > 3 ? ' and others' : ''}</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                  <p className={`text-xl font-black ${styles.text} tracking-tighter uppercase italic`}>{styles.impact}</p>
                </div>
                <div className="h-10 w-[2px] bg-gray-100 hidden md:block mx-2"></div>
                <button 
                  onClick={onSync}
                  className="px-8 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  Instant Sync
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [adminStats, setAdminStats] = useState({ stats: [], priorityStats: [] });
  const [trends, setTrends] = useState({ dayTrends: [], monthTrends: [] });
  const [outageData, setOutageData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ongoing'); // 'ongoing' or 'completed'
  const [groupFilter, setGroupFilter] = useState(null); // Filter by category from similarity monitor

  useEffect(() => {
    fetchTickets();
    if (user?.role === 'admin' || user?.role === 'agent') {
      fetchAdminStats();
      fetchOutageStatus();
    }
    
    // Auto-Sync Heartbeat (Dashboard Real-time Sync)
    let heartbeat;
    if (user?.role === 'admin' || user?.role === 'agent') {
       heartbeat = setInterval(() => {
          fetchOutageStatus();
       }, 20000); // 20 seconds sync
    }

    return () => clearInterval(heartbeat);
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
      if (user?.role === 'admin' || user?.role === 'agent') {
        fetchOutageStatus();
      }
    } catch (err) {
      console.error('Error fetching tickets', err);
    }
  };

  const fetchOutageStatus = async () => {
    try {
      const res = await api.get('/tickets/outage-status');
      setOutageData(res.data);
    } catch (err) {
      console.error('Error fetching outage status', err);
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
    fetchOutageStatus();
  };

  const handleStatusChange = async (ticketId, status, resolution_msg = '', ai_resolution_msg = '', staff_message = '') => {
    try {
      const res = await api.put(`/tickets/${ticketId}/status`, { 
        status, 
        resolution_msg, 
        ai_resolution_msg,
        staff_message
      });
      const updatedTickets = tickets.map(t => t._id === ticketId ? res.data.ticket : t);
      setTickets(updatedTickets);
      
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(res.data.ticket);
      }
      
      if (user?.role === 'admin') fetchAdminStats();
      fetchOutageStatus();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleUserReply = async (ticketId, replyMessage) => {
    try {
      const res = await api.put(`/tickets/${ticketId}/reply`, { replyMessage });
      const updatedTickets = tickets.map(t => t._id === ticketId ? res.data.ticket : t);
      setTickets(updatedTickets);
      
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket(res.data.ticket);
      }
      fetchOutageStatus();
    } catch (err) {
      console.error('Error replying to ticket', err);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'agent';
  const isUser = user?.role === 'user';

  // Filter tickets based on status, role and group selection
  const filteredTickets = tickets.filter(t => {
    const isCompleted = t.status === 'Resolved' || t.status === 'Closed';
    const matchesStatus = ticketStatusFilter === 'completed' ? isCompleted : !isCompleted;
    const matchesGroup = groupFilter ? t.category === groupFilter : true;
    return matchesStatus && matchesGroup;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Navbar />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8 mt-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              {isAdmin && <Shield className="text-gray-900" size={32} />}
              {isAdmin ? 'ADMIN COMMAND' : isStaff ? 'STAFF WORKFLOW' : 'SUPPORT COMMAND'}
            </h1>
            <p className="mt-2 text-xs font-black text-gray-400 uppercase tracking-widest italic">
              {isAdmin ? 'Monitoring global system intelligence & personnel' : 
               isStaff ? 'Executing high-priority support resolutions' : 
               'Managing your personal support requests'}
            </p>
          </div>

          {(isAdmin || isStaff) && (
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'overview' ? 'bg-gray-900 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-900'}`}>
                <LayoutDashboard size={16} /> Overview
              </button>
              {isAdmin && (
                <>
                  <button onClick={() => setActiveTab('monitor')} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'monitor' ? 'bg-gray-900 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-900'}`}>
                    <MonitorPlay size={16} /> Monitor
                  </button>
                  <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'analytics' ? 'bg-gray-900 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-900'}`}>
                    <BarChart3 size={16} /> Analytics
                  </button>
                  <button onClick={() => setActiveTab('staff')} className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'staff' ? 'bg-gray-900 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-gray-900'}`}>
                    <Users size={16} /> Personnel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Outage Sentinel Alert - GLOBAL COMMAND */}
        {(isAdmin || isStaff) && outageData?.isOutage && <SentinelAlerts data={outageData} onSync={fetchOutageStatus} />}

        {/* Stats Section - Keep as requested */}
        {isAdmin && activeTab === 'overview' && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
             <StatsOverview stats={adminStats.stats} activeCriticalCount={adminStats.activeCriticalCount} />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Split Layout Container */}
            <div className={`grid grid-cols-1 ${selectedTicket ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-8 items-start`}>
              
              {/* Left Side: Ticket Management */}
              <div className={selectedTicket ? 'lg:col-span-2' : ''}>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-900/5"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-900 text-white rounded-lg shadow-md">
                        <ClipboardList size={20} />
                      </div>
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Active Queue</h2>
                    </div>
                    
                    {/* Status Toggle */}
                    <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                       <button 
                        onClick={() => setTicketStatusFilter('ongoing')}
                        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${ticketStatusFilter === 'ongoing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                          <Clock size={14} /> Ongoing
                       </button>
                       <button 
                        onClick={() => setTicketStatusFilter('completed')}
                        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${ticketStatusFilter === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                          <CheckCircle2 size={14} /> Resolved
                       </button>
                    </div>
                  </div>

                  <TicketList 
                    tickets={filteredTickets} 
                    role={user?.role} 
                    onStatusChange={handleStatusChange} 
                    selectedTicketId={selectedTicket?._id}
                    onSelectTicket={setSelectedTicket}
                  />
                </div>

                {/* Submissions for regular users */}
                {user?.role === 'user' && (
                  <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6">Dispatch New Request</h2>
                    <TicketForm onTicketCreated={handleTicketCreated} />
                  </div>
                )}
                
                {/* Grouped Similar Issues - Admin Only below the list */}
                {isAdmin && ticketStatusFilter === 'ongoing' && (
                  <div className="mt-12 space-y-4">
                    {groupFilter && (
                      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <Tag className="text-blue-600" size={18} />
                          <p className="text-xs font-black text-blue-900 uppercase tracking-widest">
                            Filtering by: {groupFilter}
                          </p>
                        </div>
                        <button 
                          onClick={() => setGroupFilter(null)}
                          className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                        >
                          Clear Filter
                        </button>
                      </div>
                    )}
                    <SimilarityMonitor 
                      tickets={tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed')} 
                      onSelectGroup={(groupKey) => {
                        setGroupFilter(groupKey);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Right Side: Detail Panel */}
              {selectedTicket && (
                <div className="lg:col-span-1 sticky top-24">
                  <TicketDetail 
                    ticket={selectedTicket} 
                    onStatusChange={handleStatusChange}
                    onUserReply={handleUserReply}
                    onClose={() => setSelectedTicket(null)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {isAdmin && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'monitor' && <SimilarityMonitor tickets={tickets} />}
            {activeTab === 'analytics' && <AnalyticsBoard trends={trends} priorityStats={adminStats.priorityStats} />}
            {activeTab === 'staff' && <AgentManager />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
